const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });

    res.status(201).json({ message: "Usuário criado com sucesso!", userId: user.id });
  } catch (error) {
    res.status(400).json({ error: "Erro ao cadastrar. E-mail talvez já exista." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && await bcrypt.compare(password, user.password)) {
    // Gera um token que expira em 24h
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    return res.json({ token });
  }

  res.status(401).json({ error: "Credenciais inválidas" });
};