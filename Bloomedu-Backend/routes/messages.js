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
    child_id
  } = req.body;

  if (!sender_id || !receiver_id || !category || !message_text || !child_id) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages
       (sender_id, sender_type, receiver_id, category, message_text, content_type, content_url, child_id, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
       RETURNING id, created_at`,
      [
        sender_id,
        sender_type,
        receiver_id,
        category,
        message_text,
        content_type || 'text',
        content_url || null,
        child_id
      ]
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('SEND ERROR (/messages POST):', err);
    return res.status(500).json({ success: false, message: 'Server error while sending message.' });
  }
});

/* =====================================================
   2) GET MESSAGES BETWEEN USERS
===================================================== */
router.get("/", async (req, res) => {
  const { user1_id, user2_id, category, child_id } = req.query;

  if (!user1_id || !user2_id || !category || !child_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM messages
      WHERE 
        ((sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1))
        AND category = $3
        AND child_id = $4
      ORDER BY created_at ASC
      `,
      [user1_id, user2_id, category, child_id]
    );

    return res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error("MESSAGE FETCH ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


/* =====================================================
   3) MARK READ
===================================================== */
router.post('/messages/mark-read', async (req, res) => {
  const { sender_id, receiver_id, category, child_id } = req.body;

  if (!sender_id || !receiver_id || !category) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const params = [sender_id, receiver_id, category];

    let query = `
      UPDATE messages
      SET is_read = TRUE
      WHERE sender_id = $1
        AND receiver_id = $2
        AND category = $3
    `;

    if (child_id) {
      query += ' AND child_id = $4';
      params.push(child_id);
    }

    await pool.query(query, params);

    return res.json({ success: true });
  } catch (err) {
    console.error('MARK READ ERROR (/messages/mark-read):', err);
    return res.status(500).json({ success: false, message: 'Server error while marking read.' });
  }
});

/* =====================================================
   4) UNREAD SUMMARY FOR PARENT
===================================================== */
router.get('/messages/unread-summary/:parentId', async (req, res) => {
  const { parentId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT category, child_id, COUNT(*) AS unread_count
      FROM messages
      WHERE receiver_id = $1
        AND is_read = FALSE
      GROUP BY category, child_id
      `,
      [parentId]
    );

    const grouped = {};

    result.rows.forEach((row) => {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.child_id] = parseInt(row.unread_count, 10);
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
   5) TEACHER – CONVERSATION LIST
===================================================== */
router.get('/teacher/conversations/:teacherId', async (req, res) => {
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
        m.created_at AS last_message_time

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
      message: 'Error loading teacher conversations.',
    });
  }
});

module.exports = router;
