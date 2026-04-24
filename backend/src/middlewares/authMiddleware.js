const { verifyAuthToken } = require('../services/tokenService');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token nao fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.auth = verifyAuthToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido ou expirado.' });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Nao autenticado.' });
    }

    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Sem permissao para esta operacao.' });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRoles,
};
