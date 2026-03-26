const { getChannel } = require('../config/rabbitmq');

async function sendToAIQueue(data) {
  const channel = getChannel();
  if (!channel) {
    throw new Error('Canal do RabbitMQ não está disponível');
  }
  
  const payload = Buffer.from(JSON.stringify(data));
  // Envia os dados do paciente para a fila que o Python vai ler
  channel.sendToQueue('health_data_queue', payload, { persistent: true });
  console.log('Dados enviados para a fila da IA:', data.indicatorId);
}

module.exports = { sendToAIQueue };