// ✅ node-fetch uyumlu kullanım
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
        // 👇 Gönderen Resend’in test domaini (buna dokunmuyoruz!)
        from: "Bloomedu <onboarding@resend.dev>",

        // 👇 Mailin gideceği yer: Bloomedu ekip hesabı
        to: "bloomedu.app@gmail.com",

        subject: "New Student Added to Bloomedu",
        html: `
          <h2>New Student Added</h2>
          <p><b>Parent Email:</b> ${to}</p>
          <p><b>Student Code:</b> ${studentCode}</p>
          <p><b>Password:</b> ${studentPassword}</p>
          <hr/>
          <p>This email was sent automatically by the Bloomedu system.</p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Failed to send mail via Resend:", error);
      throw new Error("Email sending failed");
    }

    console.log(`✅ Mail successfully sent to bloomedu.app@gmail.com`);
  } catch (err) {
    console.error("❌ Error in sendStudentCredentials:", err);
    throw err;
  }
}

module.exports = sendStudentCredentials;
