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
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages
       (sender_id, sender_type, receiver_id, category, message_text, content_type, content_url, child_id, is_read)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, FALSE)
       RETURNING id, created_at`,
      [sender_id, sender_type, receiver_id, category, message_text, content_type, content_url, child_id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("SEND ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   2) GET MESSAGES BETWEEN USERS
===================================================== */
router.get('/messages', async (req, res) => {
  const { user1_id, user2_id, category, child_id } = req.query;

  if (!user1_id || !user2_id || !category || !child_id) {
    return res.status(400).json({ success: false });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE category = $1 AND child_id = $2
       AND (
         (sender_id = $3 AND receiver_id = $4) OR
         (sender_id = $4 AND receiver_id = $3)
       )
       ORDER BY created_at ASC`,
      [category, child_id, user1_id, user2_id]
    );

    res.json({ success: true, messages: result.rows });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   3) MARK READ (when chat opened)
===================================================== */
router.post('/messages/mark-read', async (req, res) => {
  const { sender_id, receiver_id, category, child_id } = req.body;

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
    console.error("MARK READ ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   4) UNREAD SUMMARY FOR PARENT (NEW)
===================================================== */
router.get("/messages/unread-summary/:parentId", async (req, res) => {
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

    result.rows.forEach(row => {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.child_id] = parseInt(row.unread_count);
    });

    res.json({ success: true, unread: grouped });
  } catch (err) {
    console.error("UNREAD SUMMARY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
