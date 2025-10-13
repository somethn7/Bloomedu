// ✅ node-fetch uyumlu kullanım (ESM içinde değilken require alternatifi)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendStudentCredentials(to, studentCode, studentPassword) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY environment variable not set!");
    throw new Error("Missing RESEND_API_KEY");
  }

  // 🔹 Artık tüm mailler ortak Bloomedu hesabına gidecek
  const destination = "bloomedu.app@gmail.com";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bloomedu <onboarding@resend.dev>",
        to: destination, // sabitlendi
        subject: "New Student Added to Bloomedu",
        html: `
          <h2>New Student Added</h2>
          <p>A teacher has added a new student to the Bloomedu system.</p>
          <p><b>Student Code:</b> ${studentCode}</p>
          <p><b>Password:</b> ${studentPassword}</p>
          <p>All notifications are sent to the central Bloomedu account.</p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Failed to send mail via Resend:", error);
      throw new Error("Email sending failed");
    }

    console.log(`✅ Mail sent successfully to ${destination}`);
  } catch (err) {
    console.error("❌ Error in sendStudentCredentials:", err);
    throw err;
  }
}

module.exports = sendStudentCredentials;
