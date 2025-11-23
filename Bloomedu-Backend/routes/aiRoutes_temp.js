// === AI CHAT BOT (MOCK) ===
// -umut: Ebeveynlerin yapay zeka rehber ile konuşması için endpoint (Mock Data)
app.post('/ai-chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  // Mock Yanıt Üretici (Basit Kural Tabanlı)
  let aiResponse = "";
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("merhaba") || lowerMsg.includes("selam")) {
    aiResponse = "Merhaba! Ben Bloomedu Pedagog Asistanıyım. Size ve çocuğunuza nasıl yardımcı olabilirim?";
  } else if (lowerMsg.includes("oyun")) {
    aiResponse = "Oyun oynamak çocuğunuzun gelişimi için harika! Bloomedu içindeki **'Eşleştirme'** ve **'Renkler'** oyunlarını denediniz mi? Bu oyunlar dikkat ve bilişsel becerileri destekler. Ayrıca evde basit nesnelerle 'bu ne renk?' oyunu oynayabilirsiniz.";
  } else if (lowerMsg.includes("konuş") || lowerMsg.includes("iletişim")) {
    aiResponse = "İletişim becerilerini desteklemek için çocuğunuzla bol bol göz teması kurun. Kısa ve net cümleler kullanın. İstediği bir şeyi işaret ettiğinde, o nesnenin adını söyleyerek ona verin. Sabırlı olun, her çocuk kendi hızında ilerler.";
  } else if (lowerMsg.includes("öfke") || lowerMsg.includes("kriz") || lowerMsg.includes("ağla")) {
    aiResponse = "Öfke nöbetleri zorlayıcı olabilir. Böyle anlarda sakin kalmaya çalışın. Çocuğunuzun duygusunu isimlendirin: 'Şu an üzgünsün, seni anlıyorum.' Güvenli bir alanda sakinleşmesini bekleyin. Sarılmak bazen en iyi ilaçtır.";
  } else if (lowerMsg.includes("uyku")) {
    aiResponse = "Uyku rutinleri çok önemlidir. Yatmadan önce ekranları kapatın, ılık bir duş ve masal okuma gibi sakinleştirici aktiviteler yapın. Odayı karanlık ve sessiz tutmak da uykuya geçişi kolaylaştırır.";
  } else if (lowerMsg.includes("yemek") || lowerMsg.includes("iştah")) {
    aiResponse = "Yemek konusunda ısrarcı olmayın. Farklı tatları ve dokuları oyunlaştırarak sunmayı deneyin. Birlikte yemek hazırlamak da ilgisini çekebilir. Ancak ciddi beslenme sorunları için doktorunuza danışmayı ihmal etmeyin.";
  } else {
    aiResponse = "Sizi anlıyorum. Bu konuda daha detaylı bilgi verebilmem için sorunuzu biraz daha açabilir misiniz? Genel olarak çocuk gelişiminde tutarlılık, sevgi ve sabır en önemli anahtarlardır. Ayrıca Bloomedu'daki gelişim raporlarını incelemeyi unutmayın.";
  }

  // Yapay zeka gibi hissettirmek için biraz gecikme ekleyelim (isteğe bağlı, burada doğrudan dönüyoruz)
  res.json({ success: true, reply: aiResponse });
});

