const fetch = require("node-fetch");

async function sendVerificationCode(email, code) {
  const apiKey = process.env.RESEND_API_KEY;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Bloomedu <onboarding@resend.dev>",
      to: email,
      subject: "Bloomedu Email Verification Code",
      html: `
        <h2>Verify Your Email</h2>
        <p>Your verification code is:</p>
        <h1>${code}</h1>
        <p>Enter this code in the Bloomedu app to complete your registration.</p>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("❌ Failed to send verification code:", error);
    throw new Error("Verification email failed");
  }

  console.log(`✅ Verification email sent to ${email}`);
}

module.exports = sendVerificationCode;
