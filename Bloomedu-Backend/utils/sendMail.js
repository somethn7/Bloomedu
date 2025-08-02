// utils/sendMail.js
const nodemailer = require("nodemailer");

const sendStudentCredentials = async (toEmail, studentCode, studentPassword) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bloomedu.app@gmail.com",         // <-- kendi gmail adresini yaz
        pass: "hswehknbnjxnzkej",              // <-- Google'dan aldığın 16 karakterlik uygulama şifresi
      },
    });

    const mailOptions = {
      from: '"Bloomedu" <SENINGMAILADRESIN@gmail.com>', // görünmesini istediğin gönderici adı
      to: toEmail,
      subject: "Bloomedu - Öğrenci Bilgileri",
      text: `Merhaba,

Çocuğunuz sisteme eklendi.

Öğrenci Kodu: ${studentCode}
Şifresi: ${studentPassword}

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
