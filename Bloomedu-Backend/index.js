require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const pool = require('./db');
const sendVerificationCode = require('./utils/sendVerificationCode');
const sendStudentCredentials = require('./utils/sendMail');

const app = express();

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

// === PARENT SIGNUP ===
app.post('/parent/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ success: false, message: 'Invalid email format.' });

    const existing = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await sendVerificationCode(email, verificationCode);
    console.log(`📩 Verification code sent to ${email}: ${verificationCode}`);

    await pool.query(
      'INSERT INTO parents (name, email, password, is_verified, verification_code) VALUES ($1,$2,$3,$4,$5)',
      [name, email, password, false, verificationCode]
    );

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      verificationCode
    });
  } catch (err) {
    console.error('Error (POST /parent/signup):', err);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
});

// === NEW: VERIFY PARENT EMAIL ===
app.post('/parent/verify-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code)
    return res.status(400).json({ success: false, message: 'Email and code are required.' });

  try {
    const result = await pool.query(
      'SELECT * FROM parents WHERE email = $1 AND verification_code = $2',
      [email, code]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });

    await pool.query(
      'UPDATE parents SET is_verified = true, verification_code = NULL WHERE email = $1',
      [email]
    );

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Error (POST /parent/verify-code):', err);
    res.status(500).json({ success: false, message: 'Server error during verification.' });
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

// === GET FEEDBACKS BY PARENT ===
app.get('/feedbacks/by-parent/:parentId', async (req, res) => {
  const { parentId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         f.id AS feedback_id,
         f.message,
         COALESCE(TO_CHAR(f.created_at, 'YYYY-MM-DD HH24:MI:SS'), '') AS created_at,
         c.name AS child_name,
         c.surname AS child_surname,
         t.full_name AS teacher_name
       FROM feedbacks f
       LEFT JOIN children c ON f.child_id = c.id
       LEFT JOIN teachers t ON f.teacher_id = t.id
       WHERE f.parent_id = $1
       ORDER BY f.id DESC`,
      [parentId]
    );

    res.json({ success: true, feedbacks: result.rows });
  } catch (err) {
    console.error('DB Error (GET /feedbacks/by-parent/:parentId):', err);
    res.status(500).json({ success: false, message: 'Server error while fetching feedbacks.' });
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

// === MARK SURVEY AS COMPLETE ===
app.put('/children/:id/mark-survey-complete', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE children SET survey_completed = TRUE WHERE id = $1', [id]);
    res.json({ success: true, message: 'Survey marked as complete.' });
  } catch (err) {
    console.error('DB Error (PUT /children/:id/mark-survey-complete):', err);
    res.status(500).json({ success: false, message: 'Server error while marking survey complete.' });
  }
});

// === UPDATE CHILD LEVEL ===
app.post('/children/:id/update-level', async (req, res) => {
  const { id } = req.params;
  const { correctAnswers } = req.body;

  if (correctAnswers === undefined)
    return res.status(400).json({ success: false, message: 'Missing correctAnswers field.' });

  let level = 1;
  if (correctAnswers <= 4) level = 1;
  else if (correctAnswers <= 8) level = 2;
  else if (correctAnswers <= 12) level = 3;
  else if (correctAnswers <= 16) level = 4;
  else level = 5;

  try {
    await pool.query('UPDATE children SET level = $1 WHERE id = $2', [level, id]);
    res.json({ success: true, message: 'Level updated.', level });
  } catch (err) {
    console.error('DB Error (POST /children/:id/update-level):', err);
    res.status(500).json({ success: false, message: 'Server error updating level.' });
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

// === HEALTH CHECK (redundant but safe) ===
app.get("/health", (req, res) => res.status(200).json({ ok: true }));

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Backend is running on 0.0.0.0:${port}`);
});
