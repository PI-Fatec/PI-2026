const amqp = require('amqplib');

const QUEUE_NAME = process.env.RABBITMQ_HEALTH_QUEUE || 'health_data_queue';
let channel;

async function connectQueue() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log('RabbitMQ Conectado com sucesso');
    return channel;
  } catch (error) {
    console.error('Erro ao conectar no RabbitMQ:', error);
  }
}

const getChannel = () => channel;

module.exports = { connectQueue, getChannel, QUEUE_NAME };