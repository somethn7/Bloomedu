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
    // -umut: (23.11.2025) Using TEXT type for content_url allows storing Base64 strings for images/audio
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
router.get('/messages', async (req, res) => {
  const { user1_id, user2_id, category } = req.query; 

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

// 3. Get Recent Conversations for Teacher (GET)
// -umut: (23.11.2025) Updated to GROUP BY sender AND category so teacher sees all threads
router.get('/teacher/conversations/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (m.sender_id, m.category) 
         m.sender_id as parent_id, 
         p.name as parent_name, 
         p.email as parent_email,
         m.message_text as last_message,
         m.created_at as last_message_time,
         m.category,
         m.content_type
       FROM messages m
       JOIN parents p ON m.sender_id = p.id
       WHERE m.receiver_id = $1 AND m.sender_type = 'parent'
       ORDER BY m.sender_id, m.category, m.created_at DESC`,
      [teacherId]
    );

    res.json({ success: true, conversations: result.rows });
  } catch (err) {
    console.error('Error (GET /teacher/conversations):', err);
    res.status(500).json({ success: false, message: 'Server error fetching conversations.' });
  }
});

// 4. Mark Messages as Read (POST)
// -umut: (23.11.2025) New endpoint to mark messages as read
router.post('/messages/mark-read', async (req, res) => {
  const { sender_id, receiver_id, category } = req.body;

  if (!sender_id || !receiver_id || !category) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    await pool.query(
      `UPDATE messages 
       SET is_read = TRUE 
       WHERE sender_id = $1 AND receiver_id = $2 AND category = $3`,
      [sender_id, receiver_id, category]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking read:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
