// ✅ node-fetch doğru şekilde import ediliyor
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendVerificationCode(email, code) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY environment variable not set!");
    throw new Error("Missing RESEND_API_KEY");
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // 👇 Gönderen Resend’in test domaini (sandbox)
        from: 'Bloomedu <onboarding@resend.dev>',

        // 👇 Alan: Ekip maili (tüm doğrulama kodları buraya düşecek)
        to: 'bloomedu.app@gmail.com',

        subject: 'New Parent Verification Request',
        html: `
          <h2>New Parent Sign-Up Verification</h2>
          <p><b>Parent Email:</b> ${email}</p>
          <p><b>Verification Code:</b> ${code}</p>
          <hr/>
          <p>This verification email was forwarded to the Bloomedu team inbox.</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to send verification code:', errorText);
      throw new Error('Verification email failed');
    }

    console.log(`✅ Verification email forwarded to bloomedu.app@gmail.com`);
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err;
  }
}

module.exports = sendVerificationCode;
