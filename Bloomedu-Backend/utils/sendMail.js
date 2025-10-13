// ✅ node-fetch uyumlu kullanım (ESM içinde değilken require alternatifi)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendStudentCredentials(to, studentCode, studentPassword) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY environment variable not set!");
    throw new Error("Missing RESEND_API_KEY");
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bloomedu <onboarding@resend.dev>",
        to,
        subject: "Your Bloomedu Student Credentials",
        html: `
          <h2>Welcome to Bloomedu!</h2>
          <p>Your child's login credentials:</p>
          <p><b>Student Code:</b> ${studentCode}</p>
          <p><b>Password:</b> ${studentPassword}</p>
          <p>Please keep these safe.</p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Failed to send mail via Resend:", error);
      throw new Error("Email sending failed");
    }

    console.log(`✅ Mail sent successfully to ${to}`);
  } catch (err) {
    console.error("❌ Error in sendStudentCredentials:", err);
    throw err;
  }
}

module.exports = sendStudentCredentials;
