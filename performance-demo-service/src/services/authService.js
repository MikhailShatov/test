const jwt = require('jsonwebtoken');
const db = require('../db/postgres');
const env = require('../config/env');

async function login(email, password) {
  const result = await db.query(
    'SELECT id, email, full_name FROM users WHERE email = $1 AND password = $2',
    [email, password]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const user = result.rows[0];
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name
    },
    env.jwtSecret,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name
    }
  };
}

module.exports = {
  login
};
