require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const pool = require('./db');
const sendVerificationCode = require('./utils/sendVerificationCode');
const sendStudentCredentials = require('./utils/sendMail');
// Not: sendPasswordResetMail kullandıysan utils klasöründe hazır olmalı

app.use(cors());
app.use(express.json());

// Tüm gelen isteklerin method, url ve body'sini konsola yazdıran middleware
app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// Basit e-posta formatı doğrulama fonksiyonu
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// === TEACHER LOGIN ===
app.post('/teacher/login', async (req, res) => {
  console.log('🎯 Teacher login endpoint called');
  console.log('📥 Request body:', req.body);

  const { email, password } = req.body;
  try {
    const teacher = await pool.query(
      'SELECT * FROM teachers WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (teacher.rows.length > 0) {
      console.log(`✅ Teacher found: ID ${teacher.rows[0].id}`);
      res.json({ success: true, teacherId: teacher.rows[0].id });
    } else {
      console.log('❌ Invalid credentials');
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('DB Error (POST /teacher/login):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === ADD CHILD (ÖĞRETMEN ÇOCUK EKLEME) ===
app.post('/add-child', async (req, res) => {
  const {
    name,
    surname,
    birthdate,
    birthplace,
    gender,
    diagnosis_date,
    communication_notes,
    general_notes,
    teacher_id,
    student_code,
    student_password,
    parent_email,
  } = req.body;

  if (!teacher_id) {
    return res.status(400).json({ success: false, message: 'Teacher ID is required.' });
  }

  if (!parent_email) {
    return res.status(400).json({ success: false, message: 'Parent email is required to send student credentials.' });
  }

  try {
    await pool.query(
      `INSERT INTO children 
        (name, surname, birthdate, birthplace, gender, diagnosis_date, communication_notes, general_notes, teacher_id, student_code, student_password) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        name,
        surname,
        birthdate,
        birthplace,
        gender,
        diagnosis_date,
        communication_notes,
        general_notes,
        teacher_id,
        student_code,
        student_password,
      ]
    );

    await sendStudentCredentials(parent_email, student_code, student_password);

    res.json({ success: true, message: 'Child added and credentials sent to parent.' });
  } catch (err) {
    console.error('DB Error (POST /add-child):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === GET CHILDREN BY TEACHER ===
app.get('/children/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const children = await pool.query(
      'SELECT * FROM children WHERE teacher_id = $1',
      [teacherId]
    );
    res.json(children.rows);
  } catch (err) {
    console.error('DB Error (GET /children/:teacherId):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === PARENT SIGNUP (Mail doğrulama kodu gönderilir) ===
app.post('/parent/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    const existing = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await sendVerificationCode(email, verificationCode);
    console.log(`Verification code sent to ${email}: ${verificationCode}`);

    // Burada kodu geçici tut, frontend ile paylaş, veya DB'de sakla (şimdilik frontend'te tutuyorsan döndürülebilir)
    res.json({ success: true, message: 'Verification code sent to email.', verificationCode });
  } catch (err) {
    console.error('Error sending verification code:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

// === PARENT VERIFY CODE & REGISTER ===
app.post('/parent/verify-code', async (req, res) => {
  const { name, email, password, inputCode, originalCode } = req.body;

  if (!name || !email || !password || !inputCode || !originalCode) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (inputCode !== originalCode) {
    return res.status(400).json({ success: false, message: 'Incorrect verification code.' });
  }

  try {
    const existing = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const result = await pool.query(
      `INSERT INTO parents (name, email, password, is_verified)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, password, true]
    );

    res.json({ success: true, message: 'Account created and verified.', parent: result.rows[0] });
  } catch (err) {
    console.error('DB Error during verification:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === PARENT LOGIN ===
app.post('/parent/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const parent = await pool.query(
      'SELECT * FROM parents WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (parent.rows.length > 0) {
      const user = parent.rows[0];
      if (!user.is_verified) {
        return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
      }
      return res.json({ success: true, parentId: user.id });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('DB Error (POST /parent/login):', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === PARENT FORGOT PASSWORD - REQUEST RESET CODE ===
app.post('/parent/request-reset', async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Valid email required' });
  }

  try {
    const existing = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await pool.query(
      'UPDATE parents SET verification_code = $1 WHERE email = $2',
      [resetCode, email]
    );

    await sendVerificationCode(email, resetCode);

    res.json({ success: true, message: 'Reset code sent to email.' });
  } catch (err) {
    console.error('Error in /parent/request-reset:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === PARENT RESET PASSWORD ===
app.post('/parent/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  try {
    const result = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || user.verification_code !== code) {
      return res.status(400).json({ success: false, message: 'Invalid code or email' });
    }

    await pool.query(
      'UPDATE parents SET password = $1, verification_code = NULL WHERE email = $2',
      [newPassword, email]
    );

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Error in /parent/reset-password:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === PARENT VERIFY CHILD (VELİ ÇOCUK EKLEME) ===
// === PARENT VERIFY CHILD (VELİ ÇOCUK EKLEME) ===
app.post('/parent/verify-child', async (req, res) => {
  const { firstName, lastName, studentCode, studentPassword, parentId } = req.body;

  if (!firstName || !lastName || !studentCode || !studentPassword || !parentId) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const normalizedFirst = firstName.trim().toLowerCase();
  const normalizedLast = lastName.trim().toLowerCase();

  try {
    const result = await pool.query(
      `SELECT * FROM children WHERE 
        LOWER(TRIM(name)) = $1 AND 
        LOWER(TRIM(surname)) = $2 AND 
        student_code = $3 AND 
        student_password = $4`,
      [normalizedFirst, normalizedLast, studentCode, studentPassword]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Information did not match.' });
    }

    const child = result.rows[0];

    if (!child.parent_id || child.parent_id !== parentId) {
      await pool.query(
        `UPDATE children SET parent_id = $1 WHERE id = $2`,
        [parentId, child.id]
      );
    }

    res.json({ success: true, child });
  } catch (error) {
    console.error('DB Error (POST /parent/verify-child):', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


// === GET CHILDREN BY PARENT ===
app.get('/children-by-parent/:parentId', async (req, res) => {
  const { parentId } = req.params;
  try {
    const children = await pool.query(
      'SELECT * FROM children WHERE parent_id = $1',
      [parentId]
    );
    res.json({ success: true, children: children.rows });
  } catch (err) {
    console.error('DB Error (GET /children-by-parent/:parentId):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === START SERVER ===
app.listen(port, () => {
  console.log(`✅ Backend is running on http://localhost:${port}`);
});
