// utils/sendMail.js
const nodemailer = require("nodemailer");

const sendStudentCredentials = async (toEmail, studentCode, studentPassword) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // 465 = SSL/TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // ✅ bağlantı kontrolü
    await transporter.verify();
    console.log("✅ Gmail bağlantısı başarılı.");

    const mailOptions = {
      from: `"Bloomedu" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Bloomedu - Öğrenci Bilgileri",
      text: `Merhaba,

Çocuğunuz sisteme eklendi 🎉

👧 Öğrenci Kodu: ${studentCode}
🔑 Şifre: ${studentPassword}

Bloomedu uygulamasına bu bilgilerle giriş yapabilirsiniz.

Sevgiler,
Bloomedu Ekibi`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Mail gönderildi: ${toEmail} (${info.messageId})`);
  } catch (error) {
    console.error("❌ Mail gönderme hatası:", error);
    throw error;
  }
};

module.exports = sendStudentCredentials;
