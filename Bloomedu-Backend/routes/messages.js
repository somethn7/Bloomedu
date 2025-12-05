const express = require('express');
const router = express.Router();
const pool = require('../db');

// === MESSAGES (Advanced Communication Module with child_id support) ===

/**
 * 1) SEND MESSAGE
 * Body:
 *  - sender_id
 *  - sender_type: 'parent' | 'teacher'
 *  - receiver_id
 *  - category
 *  - child_id   ✅  (zorunlu)
 *  - message_text
 *  - content_type?: 'text' | 'image'
 *  - content_url?: string (Base64, URL vs.)
 */
router.post('/messages', async (req, res) => {
  const { 
    sender_id,
    sender_type,
    receiver_id,
    category,
    child_id,
    content_type,
    content_url,
    message_text
  } = req.body;

  if (!sender_id || !sender_type || !receiver_id || !category || !child_id || !message_text) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages 
       (sender_id, sender_type, receiver_id, category, child_id, content_type, content_url, message_text) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, created_at`,
      [
        sender_id,
        sender_type,
        receiver_id,
        category,
        child_id,
        content_type || 'text',
        content_url || null,
        message_text
      ]
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


/**
 * 2) GET MESSAGES (between 2 users, for a topic & child)
 * Query:
 *  - user1_id
 *  - user2_id
 *  - category
 *  - child_id
 */
router.get('/messages', async (req, res) => {
  const { user1_id, user2_id, category, child_id } = req.query;

  if (!user1_id || !user2_id || !category || !child_id) {
    return res.status(400).json({ success: false, message: 'Missing query params.' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE category = $1
       AND child_id = $2
       AND (
         (sender_id = $3 AND receiver_id = $4) OR 
         (sender_id = $4 AND receiver_id = $3)
       )
       ORDER BY created_at ASC`,
      [category, child_id, user1_id, user2_id]
    );

    res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error('Error (GET /messages):', err);
    res.status(500).json({ success: false, message: 'Server error while fetching messages.' });
  }
});


/**
 * 3) GET RECENT CONVERSATIONS FOR TEACHER
 *  - teacherId (route param)
 * 
 *  Amaç:
 *   Her parent + child + category için SON mesaji getir.
 */
router.get('/teacher/conversations/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (parent_id, c.id, m.category)
        parent_id,
        p.name AS parent_name,
        p.email AS parent_email,
        c.id   AS child_id,
        c.name AS child_name,
        m.category,
        m.content_type,
        m.message_text AS last_message,
        m.created_at   AS last_message_time

      FROM messages m

      -- parent id: eğer sender parent ise sender_id, değilse receiver_id
      JOIN LATERAL (
        SELECT 
          CASE 
            WHEN m.sender_type = 'parent' THEN m.sender_id 
            ELSE m.receiver_id 
          END AS parent_id
      ) x ON TRUE

      JOIN parents p ON p.id = x.parent_id
      LEFT JOIN children c ON c.id = m.child_id

      WHERE 
        -- Bu mesajların teacher ile ilgili olduğundan emin ol:
        (
          m.sender_type = 'parent' AND m.receiver_id = $1
          OR
          m.sender_type = 'teacher' AND m.sender_id = $1
        )

      ORDER BY parent_id, c.id, m.category, m.created_at DESC;
      `,
      [teacherId]
    );

    res.json({ success: true, conversations: result.rows });
  } catch (err) {
    console.error('Error (GET /teacher/conversations):', err);
    res.status(500).json({ success: false, message: 'Server error fetching conversations.' });
  }
});


/**
 * 4) MARK MESSAGES AS READ
 * Body:
 *  - sender_id   (karşı taraf)
 *  - receiver_id (ben)
 *  - category
 *  - child_id
 */
router.post('/messages/mark-read', async (req, res) => {
  const { sender_id, receiver_id, category, child_id } = req.body;

  if (!sender_id || !receiver_id || !category || !child_id) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    await pool.query(
      `UPDATE messages 
       SET is_read = TRUE 
       WHERE sender_id = $1 
         AND receiver_id = $2 
         AND category = $3
         AND child_id = $4`,
      [sender_id, receiver_id, category, child_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking read:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
