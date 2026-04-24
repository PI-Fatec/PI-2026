const crypto = require('crypto');

function createRawInviteToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashInviteToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function getInviteExpiry() {
  const date = new Date();
  date.setHours(date.getHours() + 24);
  return date;
}

module.exports = {
  createRawInviteToken,
  hashInviteToken,
  getInviteExpiry,
};
