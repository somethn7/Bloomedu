// utils/sendMail.js
const nodemailer = require("nodemailer");

const sendStudentCredentials = async (toEmail, studentCode, studentPassword) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bloomedu.app@gmail.com",
        pass: "hswehknbnjxnzkej", // Google App Password
      },
      tls: {
        rejectUnauthorized: false, // 🧩 Render TLS sorunu için
      },
    });

    const mailOptions = {
      from: '"Bloomedu" <bloomedu.app@gmail.com>', // ✅ Doğru adres
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
