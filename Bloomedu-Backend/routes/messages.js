/* =====================================================
   5) TEACHER – GET CONVERSATION LIST
   (Parent + Child + Category bazlı son mesaj)
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
