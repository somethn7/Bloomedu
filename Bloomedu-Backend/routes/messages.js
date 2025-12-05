const express = require('express');
const router = express.Router();
const pool = require('../db');

/* =====================================================
   1) SEND MESSAGE
===================================================== */
router.post('/messages', async (req, res) => {
  const {
    sender_id,
    sender_type,
    receiver_id,
    category,
    message_text,
    content_type,
    content_url,
    child_id,
  } = req.body;

  console.log('🟢 /messages POST body:', {
    sender_id,
    sender_type,
    receiver_id,
    category,
    message_text,
    child_id,
  });

  if (!sender_id || !receiver_id || !category || !message_text) {
    console.log('❌ /messages MISSING FIELDS');
    return res.status(400).json({
      success: false,
      message: 'Missing fields (sender, receiver, category, text).',
    });
  }

  const safeChildId = child_id ? Number(child_id) : null;

  try {
    const result = await pool.query(
      `INSERT INTO messages
       (sender_id, sender_type, receiver_id, category, message_text, content_type, content_url, child_id, is_read)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE)
       RETURNING id, created_at`,
      [
        sender_id,
        sender_type || 'parent',
        receiver_id,
        category,
        message_text,
        content_type || 'text',
        content_url || null,
        safeChildId,
      ]
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('SEND ERROR (/messages POST):', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending message.',
    });
  }
});

/* =====================================================
   2) GET MESSAGES (SAFE)
===================================================== */
router.get('/messages', async (req, res) => {
  const { user1_id, user2_id, category, child_id } = req.query;

  // Parametre eksikse hata değil, boş liste dön
  if (!user1_id || !user2_id || !category) {
    return res.json({ success: true, messages: [] });
  }

  try {
    let query = `
      SELECT *
      FROM messages
      WHERE 
        ((sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1))
        AND category = $3
    `;

    const params = [user1_id, user2_id, category];

    if (child_id) {
      query += ` AND child_id = $4`;
      params.push(child_id);
    }

    query += ` ORDER BY created_at ASC`;

    const result = await pool.query(query, params);

    return res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error('MESSAGE FETCH ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* =====================================================
   3) MARK READ
===================================================== */
router.post('/messages/mark-read', async (req, res) => {
  const { sender_id, receiver_id, category, child_id } = req.body;

  if (!sender_id || !receiver_id || !category || !child_id) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    await pool.query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE sender_id = $1
        AND receiver_id = $2
        AND category = $3
        AND child_id = $4
      `,
      [sender_id, receiver_id, category, child_id]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('MARK READ ERROR (/messages/mark-read):', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error marking read.' });
  }
});

/* =====================================================
   4) UNREAD SUMMARY FOR PARENT
   (sadece TEACHER -> PARENT mesajları)
===================================================== */
router.get('/messages/unread-summary/:parentId', async (req, res) => {
  const { parentId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT category, child_id, COUNT(*) AS unread_count
      FROM messages
      WHERE receiver_id = $1
        AND sender_type = 'teacher'
        AND is_read = FALSE
      GROUP BY category, child_id
      `,
      [parentId]
    );

    const grouped = {};

    result.rows.forEach((row) => {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.child_id] = Number(row.unread_count);
    });

    return res.json({ success: true, unread: grouped });
  } catch (err) {
    console.error('UNREAD SUMMARY ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching unread summary.',
    });
  }
});

/* =====================================================
   5) TEACHER – CHAT LIST (+ unread_count, TR saati)
===================================================== */
router.get('/messages/teacher/conversations/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (m.sender_id, m.child_id, m.category)
        m.sender_id AS parent_id,
        p.name AS parent_name,
        m.child_id,
        c.name || ' ' || c.surname AS child_name,
        m.category,
        m.message_text AS last_message,
        (m.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul') AS last_message_time,
        (
          SELECT COUNT(*)
          FROM messages m2
          WHERE m2.sender_id = m.sender_id
            AND m2.receiver_id = $1
            AND m2.category = m.category
            AND m2.child_id = m.child_id
            AND m2.sender_type = 'parent'
            AND m2.is_read = FALSE
        ) AS unread_count
      FROM messages m
      JOIN parents p ON m.sender_id = p.id
      JOIN children c ON m.child_id = c.id
      WHERE m.receiver_id = $1
        AND m.sender_type = 'parent'
      ORDER BY m.sender_id, m.child_id, m.category, m.created_at DESC
      `,
      [teacherId]
    );

    return res.json({ success: true, conversations: result.rows });
  } catch (err) {
    console.error('TEACHER CHAT LIST ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error loading teacher conversations.',
    });
  }
});

module.exports = router;
