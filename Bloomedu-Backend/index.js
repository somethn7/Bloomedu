const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bloomedu',
  password: 'Project123!!',
  port: 5432,
});

app.get('/', (req, res) => {
  res.send('Backend çalışıyor');
});

// Parent signup
app.post('/parents/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const existing = await pool.query('SELECT id FROM parents WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    await pool.query(
      'INSERT INTO parents (name, email, password) VALUES ($1, $2, $3)',
      [name, email, password]
    );
    return res.status(201).json({ message: 'Parent registered successfully' });
  } catch (error) {
    console.error('DB Error (POST /parents/signup):', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Parent login
app.post('/parents/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM parents WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const parent = result.rows[0];
    return res.json({ parent });
  } catch (error) {
    console.error('DB Error (POST /parents/login):', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Teacher login
app.post('/teachers/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const result = await pool.query(
      'SELECT id, full_name, email FROM teachers WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const teacher = result.rows[0];
    return res.json({ teacher });
  } catch (error) {
    console.error('DB Error (POST /teachers/login):', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Children list by teacher id
app.get('/children/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, surname FROM children WHERE teacher_id = $1',
      [teacherId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('DB Error (GET /children/:teacherId):', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend is running on http://localhost:${port}`);
});
