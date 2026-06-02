import json
import os
import pickle
import threading
import time
from pathlib import Path

import pika
import requests
from fastapi import FastAPI

from predict import identificar_perfil_paciente, load_models, prever_risco_diabetes

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / 'models'

RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672/')
QUEUE_NAME = os.getenv('RABBITMQ_HEALTH_QUEUE', 'health_data_queue')
BACKEND_WEBHOOK_URL = os.getenv('BACKEND_AI_WEBHOOK_URL', 'http://localhost:3000/api/webhooks/ai-results')
AI_WEBHOOK_SECRET = os.getenv('AI_WEBHOOK_SECRET', '')

FEATURES_FALLBACK = [
	'HighBP',
	'HighChol',
	'BMI',
	'Smoker',
	'Stroke',
	'HeartDiseaseorAttack',
	'PhysActivity',
	'Fruits',
	'Veggies',
	'HvyAlcoholConsump',
	'DiffWalk',
	'Sex',
	'Age',
]

app = FastAPI(title='HealthTrack AI Worker')

models = {}
feature_list = []


def load_feature_list():
	features_path = MODELS_DIR / 'features.pkl'
	if features_path.exists():
		with open(features_path, 'rb') as handle:
			return pickle.load(handle)
	return FEATURES_FALLBACK


def normalize_features(incoming):
	normalized = {}
	for key in feature_list:
		value = incoming.get(key, 0)
		try:
			normalized[key] = float(value)
		except (TypeError, ValueError):
			normalized[key] = 0.0
	return normalized


def map_risk_level(probability):
	if probability >= 0.66:
		return 'ALTO'
	if probability >= 0.33:
		return 'MEDIO'
	return 'BAIXO'


def post_webhook(payload):
	headers = {}
	if AI_WEBHOOK_SECRET:
		headers['x-ai-secret'] = AI_WEBHOOK_SECRET

	response = requests.post(BACKEND_WEBHOOK_URL, json=payload, headers=headers, timeout=15)
	response.raise_for_status()


def handle_message(channel, method, _properties, body):
	try:
		payload = json.loads(body.decode('utf-8'))
	except json.JSONDecodeError:
		channel.basic_ack(delivery_tag=method.delivery_tag)
		return

	request_id = payload.get('requestId')
	if not request_id:
		channel.basic_ack(delivery_tag=method.delivery_tag)
		return

	try:
		features = normalize_features(payload.get('features') or {})
		risco = prever_risco_diabetes(features, models['classificacao'], models['scaler_classificacao'])
		perfil = identificar_perfil_paciente(
			features, models['clustering'], models['scaler_clustering'], models['cluster_labels']
		)

		probability = float(risco.get('prob_com_diabetes', 0))
		result = {
			**risco,
			**perfil,
			'risk_level': map_risk_level(probability),
		}

		post_webhook({
			'requestId': request_id,
			'status': 'DONE',
			'result': result,
		})

		channel.basic_ack(delivery_tag=method.delivery_tag)
	except Exception as exc:
		try:
			post_webhook({
				'requestId': request_id,
				'status': 'FAILED',
				'error': str(exc),
			})
			channel.basic_ack(delivery_tag=method.delivery_tag)
		except Exception:
			channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def consume_queue():
	while True:
		try:
			params = pika.URLParameters(RABBITMQ_URL)
			connection = pika.BlockingConnection(params)
			channel = connection.channel()
			channel.queue_declare(queue=QUEUE_NAME, durable=True)
			channel.basic_qos(prefetch_count=1)
			channel.basic_consume(queue=QUEUE_NAME, on_message_callback=handle_message)
			print(f'Consumindo fila {QUEUE_NAME}')
			channel.start_consuming()
		except Exception as exc:
			print(f'Falha ao consumir RabbitMQ: {exc}. Tentando novamente em 5s.')
			time.sleep(5)


@app.on_event('startup')
def startup():
	os.chdir(BASE_DIR)
	model_class, model_cluster, scaler_class, scaler_cluster, cluster_labels = load_models()

	models['classificacao'] = model_class
	models['clustering'] = model_cluster
	models['scaler_classificacao'] = scaler_class
	models['scaler_clustering'] = scaler_cluster
	models['cluster_labels'] = cluster_labels

	global feature_list
	feature_list = load_feature_list()

	thread = threading.Thread(target=consume_queue, daemon=True)
	thread.start()


@app.get('/healthz')
def healthz():
	return {'ok': True, 'service': 'healthtrack-ai'}
