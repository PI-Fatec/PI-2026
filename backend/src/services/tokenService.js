const jwt = require('jsonwebtoken');

function signAuthToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyAuthToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  signAuthToken,
  verifyAuthToken,
};
