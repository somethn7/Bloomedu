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

  console.log('POST /messages BODY:', req.body);

  if (!sender_id || !receiver_id || !category || !message_text) {
    return res.status(400).json({ success: false, message: 'Missing fields.' });
  }

  const trueSenderType =
    sender_type === 'teacher' ? 'teacher' : 'parent';

  const safeChildId = child_id ? Number(child_id) : null;

  try {
    const result = await pool.query(
      `INSERT INTO messages
       (sender_id, sender_type, receiver_id, category, message_text, content_type, content_url, child_id, is_read, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE,NOW())
       RETURNING id, created_at`,
      [
        sender_id,
        trueSenderType,
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
    console.error('SEND ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* =====================================================
   2) GET MESSAGES
===================================================== */
router.get('/messages', async (req, res) => {
  const { user1_id, user2_id, category, child_id } = req.query;

  if (!user1_id || !user2_id || !category) {
    return res.json({ success: true, messages: [] });
  }

  try {
    let sql = `
      SELECT *
      FROM messages
      WHERE 
        ((sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1))
        AND category = $3
    `;

    const params = [user1_id, user2_id, category];

    if (child_id) {
      sql += ` AND child_id = $4`;
      params.push(child_id);
    }

    sql += ` ORDER BY created_at ASC`;

    const result = await pool.query(sql, params);

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
    // Parent mesajları okuduğunda, teacher'dan gelen mesajları okundu olarak işaretle
    // Teacher mesajları okuduğunda, parent'tan gelen mesajları okundu olarak işaretle
    await pool.query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE sender_id = $1
         AND receiver_id = $2
         AND category = $3
         AND child_id = $4
         AND is_read = FALSE`,
      [sender_id, receiver_id, category, child_id]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('MARK READ ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* =====================================================
   4) UNREAD SUMMARY — Parent dashboard badges
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

    result.rows.forEach(row => {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.child_id] = Number(row.unread_count);
    });

    return res.json({ success: true, unread: grouped });
  } catch (err) {
    console.error('UNREAD SUMMARY ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* =====================================================
   5) TEACHER CHAT LIST — Öğretmen için badge & son mesaj
===================================================== */
router.get('/messages/teacher/conversations/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        p.id AS parent_id,
        p.name AS parent_name,
        c.id AS child_id,
        c.name || ' ' || c.surname AS child_name,
        m.category,

        (
          SELECT m2.message_text
          FROM messages m2
          WHERE 
            (
              (m2.sender_id = p.id AND m2.receiver_id = $1)
              OR (m2.sender_id = $1 AND m2.receiver_id = p.id)
            )
            AND m2.child_id = c.id
            AND m2.category = m.category
          ORDER BY m2.created_at DESC
          LIMIT 1
        ) AS last_message,

        (
          SELECT m2.created_at
          FROM messages m2
          WHERE 
            (
              (m2.sender_id = p.id AND m2.receiver_id = $1)
              OR (m2.sender_id = $1 AND m2.receiver_id = p.id)
            )
            AND m2.child_id = c.id
            AND m2.category = m.category
          ORDER BY m2.created_at DESC
          LIMIT 1
        ) AS last_message_time,

        (
          SELECT COUNT(*)
          FROM messages m3
          WHERE 
            m3.sender_id = p.id
            AND m3.receiver_id = $1
            AND m3.child_id = c.id
            AND m3.category = m.category
            AND m3.sender_type = 'parent'
            AND m3.is_read = FALSE
        ) AS unread_count

      FROM messages m
      JOIN parents p 
        ON p.id = m.sender_id 
        AND m.sender_type = 'parent'
      JOIN children c 
        ON c.id = m.child_id
      WHERE 
        m.receiver_id = $1
        OR m.sender_id = $1
      GROUP BY p.id, c.id, m.category
      ORDER BY 
        (
          SELECT COUNT(*)
          FROM messages m3
          WHERE 
            m3.sender_id = p.id
            AND m3.receiver_id = $1
            AND m3.child_id = c.id
            AND m3.category = m.category
            AND m3.sender_type = 'parent'
            AND m3.is_read = FALSE
        ) DESC,
        last_message_time DESC;
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
