// -umut: (23.11.2025) Temporary debug script to mirror /feedbacks/by-parent logic

const pool = require('./db');

async function run() {
  const parentId = process.argv[2] || 1;
  console.log('Running feedbacks debug for parentId =', parentId);

  try {
    const result = await pool.query(
      `SELECT 
         f.id AS feedback_id,
         f.message,
         f.created_at,
         c.name AS child_name,
         c.surname AS child_surname,
         t.full_name AS teacher_full_name
       FROM feedbacks f
       LEFT JOIN children c ON f.child_id = c.id
       LEFT JOIN teachers t ON f.teacher_id = t.id
       WHERE f.parent_id = $1
       ORDER BY f.id DESC`,
      [parentId]
    );

    const feedbacks = result.rows.map(row => {
      let teacherName = 'Unknown Teacher';
      if (row.teacher_full_name) {
        teacherName = row.teacher_full_name;
      }

      let dateStr = '';
      if (row.created_at) {
        try {
          const d = new Date(row.created_at);
          dateStr = d.toISOString().replace('T', ' ').substring(0, 19);
        } catch (e) {
          dateStr = String(row.created_at);
        }
      }

      return {
        feedback_id: row.feedback_id,
        message: row.message,
        created_at: dateStr,
        child_name: row.child_name,
        child_surname: row.child_surname,
        teacher_name: teacherName,
      };
    });

    console.log('Feedbacks:', feedbacks);
  } catch (err) {
    console.error('DEBUG FEEDBACK ERROR:', err);
  } finally {
    await pool.end();
  }
}

run();


