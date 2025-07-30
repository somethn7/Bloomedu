const nodemailer = require('nodemailer');

const sendVerificationCode = async (email, code) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Bloomedu" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bloomedu Hesap Doğrulama Kodu',
      text: `Merhaba,\n\nDoğrulama kodunuz: ${code}\n\nBloomedu Ekibi`,
    });

    console.log(`Verification code sent to: ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

module.exports = sendVerificationCode;
