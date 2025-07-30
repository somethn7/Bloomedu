require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const pool = require('./db');
const sendVerificationCode = require('./utils/sendVerificationCode');
const sendStudentCredentials = require('./utils/sendMail');

app.use(cors());
app.use(express.json());

// Basit e-posta formatı doğrulama fonksiyonu
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Öğretmen login
app.post('/teacher/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const teacher = await pool.query(
      'SELECT * FROM teachers WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (teacher.rows.length > 0) {
      // teacherId döndür
      res.json({ success: true, teacherId: teacher.rows[0].id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('DB Error (POST /teacher/login):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Çocuk ekleme - mail gönderme eklenmiş
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

// Öğretmenin çocuklarını listeleme
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

// 1) Signup endpoint: sadece doğrulama kodu gönderir, kullanıcı oluşturmaz
app.post('/parent/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  // Mail format kontrolü
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    // Email daha önce kayıtlı mı kontrol et
    const existing = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Doğrulama kodu oluştur
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Mail gönder
    await sendVerificationCode(email, verificationCode);
    console.log(`Verification code sent to ${email}: ${verificationCode}`);

    // Doğrulama kodunu frontend'e dön (frontend saklamalı)
    res.json({ success: true, message: 'Verification code sent to email.', verificationCode });
  } catch (err) {
    console.error('Error sending verification code:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

// 2) Verify code endpoint: kod doğruysa kullanıcıyı veritabanına ekle
app.post('/parent/verify-code', async (req, res) => {
  const { name, email, password, inputCode, originalCode } = req.body;

  if (!name || !email || !password || !inputCode || !originalCode) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (inputCode !== originalCode) {
    return res.status(400).json({ success: false, message: 'Incorrect verification code.' });
  }

  try {
    // Kayıtlı mı kontrol et (bu sefer kayıt yapılmamış olacak)
    const existing = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Kullanıcıyı oluştur ve doğrulanmış olarak işaretle
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

// Veli giriş (mail doğrulama zorunlu)
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

app.listen(port, () => {
  console.log(`✅ Backend is running on http://localhost:${port}`);
});
