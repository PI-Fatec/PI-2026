const amqp = require('amqplib');

const QUEUE_NAME = process.env.RABBITMQ_HEALTH_QUEUE || 'health_data_queue';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
let channel;
let connection;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectQueue({ retries = 10, retryDelayMs = 3000 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });

      connection.on('close', () => {
        channel = undefined;
        connection = undefined;
        console.error('Conexao com RabbitMQ encerrada.');
      });

      connection.on('error', (error) => {
        console.error('Erro na conexao com RabbitMQ:', error.message);
      });

      console.log(`RabbitMQ conectado. Fila pronta: ${QUEUE_NAME}`);
      return channel;
    } catch (error) {
      lastError = error;
      console.error(`Erro ao conectar no RabbitMQ (tentativa ${attempt}/${retries}):`, error.message);

      if (attempt < retries) {
        await wait(retryDelayMs);
      }
    }
  }

  throw lastError;
}

const getChannel = () => channel;

module.exports = { connectQueue, getChannel, QUEUE_NAME };
