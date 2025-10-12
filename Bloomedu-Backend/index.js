require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const pool = require('./db');
const sendVerificationCode = require('./utils/sendVerificationCode');
const sendStudentCredentials = require('./utils/sendMail');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// === Firebase initialization ===
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

// === Middleware: loglama ===
app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// === SMTP bağlantısını başlatırken doğrula ===
(async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
    await transporter.verify();
    console.log('✅ Gmail SMTP bağlantısı doğrulandı.');
  } catch (err) {
    console.error('❌ Gmail SMTP doğrulaması başarısız:', err);
  }
})();

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

// === ADD CHILD (mail gönderimi dahil) ===
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
    return res.status(400).json({ success: false, message: 'Teacher ID is required.' });
  if (!parent_email)
    return res.status(400).json({ success: false, message: 'Parent email is required.' });

  try {
    const insertResult = await pool.query(
      `INSERT INTO children 
       (name, surname, birthdate, birthplace, gender, diagnosis_date, communication_notes, general_notes, teacher_id, student_code, student_password, survey_completed) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,FALSE)
       RETURNING id`,
      [name, surname, birthdate, birthplace, gender, diagnosis_date, communication_notes, general_notes, teacher_id, student_code, student_password]
    );

    const childId = insertResult.rows[0].id;
    console.log(`🧒 Yeni öğrenci eklendi (ID: ${childId}), veli maili gönderiliyor...`);

    try {
      await sendStudentCredentials(parent_email, student_code, student_password);
      console.log(`📨 Mail başarıyla gönderildi: ${parent_email}`);
    } catch (mailErr) {
      console.error('❌ Mail gönderilemedi:', mailErr);
      return res.status(500).json({
        success: true,
        message: 'Child added but email failed to send.',
      });
    }

    res.json({ success: true, message: 'Child added and credentials sent to parent.' });
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

    await pool.query('UPDATE children SET parent_id = $1 WHERE id = $2', [parentId, childId]);
    console.log(`✅ Child (ID: ${childId}) linked to Parent (ID: ${parentId})`);
    res.json({ success: true, message: 'Child verified and linked successfully.', child });
  } catch (err) {
    console.error('❌ Error (POST /parent/verify-child):', err);
    res.status(500).json({ success: false, message: 'Server error while verifying child.' });
  }
});

// (Diğer endpointlerin senin sürümünde olduğu gibi kalıyor)
app.listen(port, () => {
  console.log(`✅ Backend is running on http://localhost:${port}`);
});
