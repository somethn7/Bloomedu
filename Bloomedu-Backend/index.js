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

// Middleware: loglama
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

// === FCM NOTIFICATION ===
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

// === VERIFY CHILD ===
app.post('/parent/verify-child', async (req, res) => {
  const { firstName, lastName, studentCode, studentPassword, parentId } = req.body;

  if (!firstName || !lastName || !studentCode || !studentPassword || !parentId) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    const childQuery = await pool.query(
      'SELECT * FROM children WHERE name = $1 AND surname = $2 AND student_code = $3 AND student_password = $4',
      [firstName, lastName, studentCode, studentPassword]
    );
    if (childQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Child not found or information does not match.' });
    }
    const child = childQuery.rows[0];
    const childId = child.id;

    if (child.parent_id && child.parent_id !== parentId) {
      return res.status(400).json({ success: false, message: 'This child is already linked with another parent.' });
    }

    if (child.parent_id === parentId) {
      return res.json({ success: true, message: 'Child already added.', child: child });
    }

    await pool.query('UPDATE children SET parent_id = $1 WHERE id = $2', [parentId, childId]);
    console.log(`✅ Child (ID: ${childId}) linked to Parent (ID: ${parentId})`);
    res.json({ success: true, message: 'Child verified and linked successfully.', child: child });
  } catch (err) {
    console.error('❌ Error (POST /parent/verify-child):', err);
    res.status(500).json({ success: false, message: 'Server error while verifying child.' });
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

// === SEND FEEDBACK (Teacher -> Parent) ===
app.post('/feedback', async (req, res) => {
  try {
    let { child_id, parent_id, teacher_id, message } = req.body;

    if (!child_id || !teacher_id || !message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'child_id, teacher_id ve message zorunludur.' });
    }

    const childId = Number(child_id);
    const teacherId = Number(teacher_id);
    let parentId = parent_id !== undefined && parent_id !== null ? Number(parent_id) : null;

    if (Number.isNaN(childId) || Number.isNaN(teacherId)) {
      return res.status(400).json({ success: false, message: 'child_id ve teacher_id sayısal olmalıdır.' });
    }

    const childRes = await pool.query('SELECT id, parent_id, teacher_id FROM children WHERE id = $1', [childId]);
    if (childRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Child not found.' });
    }
    const childRow = childRes.rows[0];

    if (Number(childRow.teacher_id) !== teacherId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to send feedback for this child.' });
    }

    if (!parentId) {
      parentId = childRow.parent_id;
    }

    if (!parentId) {
      return res.status(400).json({ success: false, message: 'This child is not linked to any parent yet.' });
    }

    const insertRes = await pool.query(
      'INSERT INTO feedbacks (child_id, parent_id, teacher_id, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [childId, parentId, teacherId, String(message).trim()]
    );

    try {
      await sendFeedbackNotification(parentId, String(message).trim());
    } catch (e) {
      console.log('⚠️ FCM skipped:', e?.message);
    }

    return res.json({ success: true, feedbackId: insertRes.rows[0].id, message: 'Feedback saved.' });
  } catch (err) {
    console.error('❌ Error (POST /feedback):', err);
    return res.status(500).json({ success: false, message: 'Server error while sending feedback.' });
  }
});

// === GET FEEDBACKS BY PARENT ===
app.get('/feedbacks/by-parent/:parentId', async (req, res) => {
  try {
    const parentId = Number(req.params.parentId);
    if (Number.isNaN(parentId)) {
      return res.status(400).json({ success: false, message: 'Invalid parentId.' });
    }

    const result = await pool.query(
      `SELECT 
          f.id, 
          f.child_id, 
          f.parent_id, 
          f.teacher_id, 
          f.message,
          (f.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul') AS created_at,
          c.name AS child_name, 
          c.surname AS child_surname,
          t.full_name AS teacher_name
       FROM feedbacks f
       LEFT JOIN children c ON c.id = f.child_id
       LEFT JOIN teachers t ON t.id = f.teacher_id
       WHERE f.parent_id = $1
       ORDER BY f.created_at DESC`,
      [parentId]
    );

    console.log(`🔍 Fetched ${result.rows.length} feedbacks for parent ${parentId}`);
    return res.json({ success: true, feedbacks: result.rows });
  } catch (err) {
    console.error('❌ Error (GET /feedbacks/by-parent/:parentId):', err);
    res.status(500).json({ success: false, message: 'Server error fetching feedbacks.' });
  }
});

// === GET CHILDREN BY PARENT ===
app.get('/children/by-parent/:parentId', async (req, res) => {
  const { parentId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.surname, c.survey_completed
         FROM children c
        WHERE c.parent_id = $1`,
      [parentId]
    );

    return res.json({ success: true, children: result.rows });
  } catch (err) {
    console.error('❌ Error (GET /children/by-parent/:parentId):', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching children.' });
  }
});

// === PARENT REQUEST PASSWORD RESET ===
app.post('/parent/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  try {
    const parentRes = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
    if (parentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found with this email.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    await pool.query('UPDATE parents SET verification_code = $1 WHERE email = $2', [code, email]);

    await sendVerificationCode(email, code);
    console.log(`✅ Password reset code sent to ${email}`);
    res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('❌ Error (POST /parent/request-reset):', err);
    res.status(500).json({ success: false, message: 'Server error while requesting password reset.' });
  }
});

// === PARENT RESET PASSWORD ===
app.post('/parent/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, code, and new password are required.' });
  }

  try {
    const parentRes = await pool.query(
      'SELECT * FROM parents WHERE email = $1 AND verification_code = $2',
      [email, code]
    );

    if (parentRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid code or email.' });
    }

    await pool.query(
      'UPDATE parents SET password = $1, verification_code = NULL WHERE email = $2',
      [newPassword, email]
    );

    console.log(`✅ Password reset successfully for ${email}`);
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    console.error('❌ Error (POST /parent/reset-password):', err);
    res.status(500).json({ success: false, message: 'Server error while resetting password.' });
  }
});

// === PARENT LOGIN ===
app.post('/parent/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const parent = await pool.query('SELECT * FROM parents WHERE email = $1 AND password = $2', [email, password]);
    if (parent.rows.length > 0) {
      const user = parent.rows[0];
      if (!user.is_verified) {
        return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
      }
      return res.json({ success: true, parentId: user.id });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  } catch (err) {
    console.error('DB Error (POST /parent/login):', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend is running on http://localhost:${port}`);
});
