const nodemailer = require("nodemailer");

const sendStudentCredentials = async (toEmail, studentCode, studentPassword) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Bloomedu" <${process.env.EMAIL_USER}>`,
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
