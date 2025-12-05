const express = require('express');
const router = express.Router();
const pool = require('../db');

/* SEND MESSAGE */
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

/* GET MESSAGES BETWEEN USERS */
router.get("/messages", async (req, res) => {
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

/* MARK READ */
router.post('/messages/mark-read', async (req, res) => {
  const { sender_id, receiver_id, category, child_id } = req.body;

  if (!sender_id || !receiver_id || !category) {
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
    return res.status(500).json({ success: false, message: 'Server error while marking read.' });
  }
});

/* UNREAD SUMMARY */
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

/* TEACHER CONVERSATIONS */
router.get("/messages", async (req, res) => {
  const { user1_id, user2_id, category, child_id } = req.query;

  if (!user1_id || !user2_id || !category) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
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

    // Eğer DB’de child_id kolonu yoksa buraya eklemeyeceğiz.
    if (child_id) {
      query += ` AND child_id = $4`;
      params.push(child_id);
    }

    query += ` ORDER BY created_at ASC`;

    const result = await pool.query(query, params);

    return res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error("MESSAGE FETCH ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
