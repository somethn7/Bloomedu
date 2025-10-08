require('dotenv').config();

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const pool = require('./db');
const sendVerificationCode = require('./utils/sendVerificationCode');
const sendStudentCredentials = require('./utils/sendMail');

app.use(cors());
app.use(express.json());

// Middleware: istekleri logla
app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// === HEALTH CHECK ===
app.get('/health', (req, res) => res.json({ ok: true }));

// === EMAIL CHECK ===
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// === FCM PUSH NOTIFICATION ===
async function sendFeedbackNotification(parent_id, message) {
  try {
    const tokenRes = await pool.query('SELECT token FROM device_tokens WHERE parent_id = $1', [parent_id]);
    if (tokenRes.rows.length === 0) {
      console.log('⚠️ No device token found for parent', parent_id);
      return;
    }

    const token = tokenRes.rows[0].token;

    await admin.messaging().send({
      token,
      notification: { title: 'New Feedback', body: message },
      data: { screen: 'ParentFeedbacks' },
    });

    console.log('✅ Push notification sent to parent', parent_id);
  } catch (err) {
    console.error('❌ Error sending FCM notification:', err);
  }
}

// === TEACHER LOGIN ===
app.post('/teacher/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const teacher = await pool.query('SELECT * FROM teachers WHERE email = $1 AND password = $2', [email, password]);
    if (teacher.rows.length > 0) {
      res.json({ success: true, teacherId: teacher.rows[0].id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('DB Error (POST /teacher/login):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === ADD CHILD ===
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

  if (!teacher_id) return res.status(400).json({ success: false, message: 'Teacher ID is required.' });
  if (!parent_email) return res.status(400).json({ success: false, message: 'Parent email is required.' });

  try {
    await pool.query(
      `INSERT INTO children 
       (name, surname, birthdate, birthplace, gender, diagnosis_date, communication_notes, general_notes, teacher_id, student_code, student_password, survey_completed) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,FALSE)`,
      [name, surname, birthdate, birthplace, gender, diagnosis_date, communication_notes, general_notes, teacher_id, student_code, student_password]
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
    const children = await pool.query('SELECT * FROM children WHERE teacher_id = $1', [teacherId]);
    res.json(children.rows);
  } catch (err) {
    console.error('DB Error (GET /children/:teacherId):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === MARK CHILD SURVEY AS COMPLETED ===
app.put('/children/:childId/mark-survey-complete', async (req, res) => {
  const { childId } = req.params;
  try {
    const result = await pool.query(
      'UPDATE children SET survey_completed = TRUE WHERE id = $1 RETURNING *',
      [childId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Child not found.' });
    }

    res.json({ success: true, message: 'Survey marked as completed.', child: result.rows[0] });
  } catch (err) {
    console.error('❌ DB Error (PUT /children/:id/mark-survey-complete):', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === PARENT SIGNUP ===
app.post('/parent/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

  if (!isValidEmail(email))
    return res.status(400).json({ success: false, message: 'Invalid email format' });

  try {
    const existing = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await sendVerificationCode(email, verificationCode);
    res.json({ success: true, message: 'Verification code sent to email.', verificationCode });
  } catch (err) {
    console.error('Error sending verification code:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

// === PARENT LOGIN ===
app.post('/parent/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const parent = await pool.query('SELECT * FROM parents WHERE email = $1 AND password = $2', [email, password]);
    if (parent.rows.length > 0) {
      const user = parent.rows[0];
      if (!user.is_verified)
        return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
      return res.json({ success: true, parentId: user.id });
    } else return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (err) {
    console.error('DB Error (POST /parent/login):', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// === GET CHILDREN BY PARENT ===
app.get('/children-by-parent/:parentId', async (req, res) => {
  const { parentId } = req.params;
  try {
    const children = await pool.query('SELECT * FROM children WHERE parent_id = $1', [parentId]);
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
