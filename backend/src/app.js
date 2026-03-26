const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Registro de rotas
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

module.exports = app;