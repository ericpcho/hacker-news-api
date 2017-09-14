'use strict';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost/hacker-news';

exports.DATABASE = {
  client: 'pg',
  user: 'dev',
  connection: DATABASE_URL,
  pool: { min: 0, max: 3 },
  debug: true
};

exports.PORT = process.env.PORT || 8080; 