require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const pool = require('./db');
const sendVerificationCode = require('./utils/sendVerificationCode');
const sendStudentCredentials = require('./utils/sendMail'); // ✅ sadece bu yeterli

const app = express();
const port = process.env.PORT || 3000;

// === FIREBASE INIT ===
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

// === LOG MIDDLEWARE ===
app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url} - Body:`, req.body);
  next();
});


// === HEALTH CHECK ===
app.get('/health', (req, res) => res.json({ ok: true }));

// === TEACHER LOGIN ===
app.post('/teacher/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const teacher = await pool.query(
      'SELECT * FROM teachers WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (teacher.rows.length > 0)
      res.json({ success: true, teacherId: teacher.rows[0].id });
    else
      res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error('DB Error (POST /teacher/login):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === ADD CHILD ===
app.post('/teacher/add-child', async (req, res) => {
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

  if (!teacher_id)
    return res.status(400).json({ success: false, message: 'Teacher ID required.' });
  if (!parent_email)
    return res.status(400).json({ success: false, message: 'Parent email required.' });

  try {
    await pool.query(
      `INSERT INTO children 
       (name, surname, birthdate, birthplace, gender, diagnosis_date,
        communication_notes, general_notes, teacher_id, student_code, student_password, survey_completed) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,FALSE)`,
      [name, surname, birthdate, birthplace, gender, diagnosis_date,
       communication_notes, general_notes, teacher_id, student_code, student_password]
    );

    await sendStudentCredentials(parent_email, student_code, student_password);
    console.log(`📨 Mail gönderildi: ${parent_email}`);

    res.json({ success: true, message: 'Child added and credentials sent.' });
  } catch (err) {
    console.error('DB Error (POST /teacher/add-child):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === GET CHILDREN BY TEACHER ===
app.get('/children/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const children = await pool.query(
      'SELECT id, name, surname, level, survey_completed, student_code FROM children WHERE teacher_id = $1',
      [teacherId]
    );
    res.json(children.rows);
  } catch (err) {
    console.error('DB Error (GET /children/:teacherId):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === VERIFY CHILD (Parent Add Child) ===
app.post('/parent/verify-child', async (req, res) => {
  const { firstName, lastName, studentCode, studentPassword, parentId } = req.body;
  if (!firstName || !lastName || !studentCode || !studentPassword || !parentId)
    return res.status(400).json({ success: false, message: 'All fields required.' });

  try {
    const result = await pool.query(
      'SELECT * FROM children WHERE name = $1 AND surname = $2 AND student_code = $3 AND student_password = $4',
      [firstName, lastName, studentCode, studentPassword]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Child not found.' });

    const child = result.rows[0];
    if (child.parent_id && child.parent_id !== parentId)
      return res.status(400).json({ success: false, message: 'Child already linked.' });

    await pool.query('UPDATE children SET parent_id = $1 WHERE id = $2', [parentId, child.id]);
    res.json({ success: true, message: 'Child linked successfully.', child });
  } catch (err) {
    console.error('Error (POST /parent/verify-child):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === FEEDBACK ===
app.post('/feedback', async (req, res) => {
  const { child_id, parent_id, teacher_id, message } = req.body;
  if (!child_id || !teacher_id || !message)
    return res.status(400).json({ success: false, message: 'Missing fields.' });

  try {
    await pool.query(
      'INSERT INTO feedbacks (child_id, parent_id, teacher_id, message) VALUES ($1,$2,$3,$4)',
      [child_id, parent_id, teacher_id, message]
    );
    res.json({ success: true, message: 'Feedback saved.' });
  } catch (err) {
    console.error('Error (POST /feedback):', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// === CHILDREN BY PARENT ===
app.get('/children/by-parent/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    const result = await pool.query(
      `SELECT id, name, surname, survey_completed, level, student_code
       FROM children WHERE parent_id = $1`, [parentId]
    );
    res.json({ success: true, children: result.rows });
  } catch (err) {
    console.error('Error (GET /children/by-parent):', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// === PARENT LOGIN ===
app.post('/parent/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM parents WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (!user.is_verified)
        return res.status(403).json({ success: false, message: 'Please verify your email.' });
      res.json({ success: true, parentId: user.id });
    } else res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error('DB Error (POST /parent/login):', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.listen(port, () => console.log(`✅ Backend is running on http://localhost:${port}`));
