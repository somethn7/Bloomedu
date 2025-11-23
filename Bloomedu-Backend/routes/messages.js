const express = require('express');
const router = express.Router();
const pool = require('../db');

// === MESSAGES (Advanced Communication Module) ===

// 1. Send Message (POST)
router.post('/messages', async (req, res) => {
  const { sender_id, sender_type, receiver_id, category, content_type, content_url, message_text } = req.body;

  if (!sender_id || !sender_type || !receiver_id || !category || !message_text) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages 
       (sender_id, sender_type, receiver_id, category, content_type, content_url, message_text) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, created_at`,
      [sender_id, sender_type, receiver_id, category, content_type || 'text', content_url, message_text]
    );

    res.json({ 
      success: true, 
      message: 'Message sent successfully.', 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error('Error (POST /messages):', err);
    res.status(500).json({ success: false, message: 'Server error while sending message.' });
  }
});

// 2. Get Messages by Category & User (GET)
// Fetch conversation between a parent and a teacher for a specific category
router.get('/messages', async (req, res) => {
  const { user1_id, user2_id, category } = req.query; // user1 can be parent, user2 teacher, or vice versa

  if (!user1_id || !user2_id || !category) {
    return res.status(400).json({ success: false, message: 'Missing query params.' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE category = $1 
       AND (
         (sender_id = $2 AND receiver_id = $3) OR 
         (sender_id = $3 AND receiver_id = $2)
       )
       ORDER BY created_at ASC`,
      [category, user1_id, user2_id]
    );

    res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error('Error (GET /messages):', err);
    res.status(500).json({ success: false, message: 'Server error while fetching messages.' });
  }
});

module.exports = router;
