// ✅ node-fetch doğru şekilde import ediliyor
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendVerificationCode(email, code) {
  const apiKey = process.env.RESEND_API_KEY;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bloomedu <onboarding@resend.dev>',
        to: email,
        subject: 'Bloomedu Email Verification Code',
        html: `
          <h2>Verify Your Email</h2>
          <p>Your verification code is:</p>
          <h1>${code}</h1>
          <p>Enter this code in the Bloomedu app to complete your registration.</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to send verification code:', errorText);
      throw new Error('Verification email failed');
    }

    console.log(`✅ Verification email sent to ${email}`);
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err;
  }
}

module.exports = sendVerificationCode;
