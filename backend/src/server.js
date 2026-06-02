require('dotenv').config();
const app = require('./app');
const { connectQueue } = require('./config/rabbitmq');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectQueue();

    app.listen(PORT, () => {
      console.log(`Servidor HealthTrack AI rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor com RabbitMQ:', error.message);
    process.exit(1);
  }
}

startServer();
