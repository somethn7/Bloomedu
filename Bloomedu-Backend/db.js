const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres.xxjldvlmcyhhxkeivitw',  // connection string'deki kullanıcı adı TAM olarak bu
  host: 'aws-1-eu-north-1.pooler.supabase.com', // yeni host
  database: 'postgres', // varsayılan database ismi
  password: 'Project123!!', // senin belirlediğin şifre
  port: 6543, // dikkat! 5432 değil 6543 olacak
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
