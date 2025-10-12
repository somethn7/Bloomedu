const nodemailer = require("nodemailer");

const sendStudentCredentials = async (toEmail, studentCode, studentPassword) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Render SSL hatasını engeller
      },
    });

    const mailOptions = {
      from: '"Bloomedu" <bloomedu.app@gmail.com>',
      to: toEmail,
      subject: "Bloomedu - Öğrenci Bilgileri",
      text: `Merhaba,

Çocuğunuz sisteme eklendi.

👧 Öğrenci Kodu: ${studentCode}
🔑 Şifresi: ${studentPassword}

Bloomedu uygulamasına bu bilgilerle giriş yapabilirsiniz.

Sevgiler,
Bloomedu Ekibi`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Mail gönderildi: ${toEmail}`);
  } catch (error) {
    console.error("❌ Mail gönderme hatası:", error);
  }
};

module.exports = sendStudentCredentials;
