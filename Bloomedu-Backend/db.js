const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       // PostgreSQL kullanıcı adın
  host: 'localhost',
  database: 'bloomedu',   // senin veritabanı adı
  password: 'Project123!!',  // PostgreSQL şifren
  port: 5432,             // genelde 5432 olur
});

module.exports = pool;
