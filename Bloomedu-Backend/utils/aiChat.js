// Bloomedu AI Chat helper
// - Uses OpenAI if OPENAI_API_KEY is set
// - Falls back to rule-based mock replies if not configured

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

function mockReply(message) {
  let aiResponse = '';
  const lowerMsg = String(message || '').toLowerCase();

  if (lowerMsg.includes('merhaba') || lowerMsg.includes('selam')) {
    aiResponse =
      'Merhaba! Ben Bloomedu Pedagog Asistanıyım. Size ve çocuğunuza nasıl yardımcı olabilirim?';
  } else if (lowerMsg.includes('oyun')) {
    aiResponse =
      "Oyun oynamak çocuğunuzun gelişimi için harika! Bloomedu içindeki **'Eşleştirme'** ve **'Renkler'** oyunlarını denediniz mi? Bu oyunlar dikkat ve bilişsel becerileri destekler. Ayrıca evde basit nesnelerle 'bu ne renk?' oyunu oynayabilirsiniz.";
  } else if (lowerMsg.includes('konuş') || lowerMsg.includes('iletişim')) {
    aiResponse =
      'İletişim becerilerini desteklemek için çocuğunuzla bol bol göz teması kurun. Kısa ve net cümleler kullanın. İstediği bir şeyi işaret ettiğinde, o nesnenin adını söyleyerek ona verin. Sabırlı olun, her çocuk kendi hızında ilerler.';
  } else if (
    lowerMsg.includes('öfke') ||
    lowerMsg.includes('kriz') ||
    lowerMsg.includes('ağla')
  ) {
    aiResponse =
      "Öfke nöbetleri zorlayıcı olabilir. Böyle anlarda sakin kalmaya çalışın. Çocuğunuzun duygusunu isimlendirin: 'Şu an üzgünsün, seni anlıyorum.' Güvenli bir alanda sakinleşmesini bekleyin. Sarılmak bazen en iyi ilaçtır.";
  } else if (lowerMsg.includes('uyku')) {
    aiResponse =
      'Uyku rutinleri çok önemlidir. Yatmadan önce ekranları kapatın, ılık bir duş ve masal okuma gibi sakinleştirici aktiviteler yapın. Odayı karanlık ve sessiz tutmak da uykuya geçişi kolaylaştırır.';
  } else if (lowerMsg.includes('yemek') || lowerMsg.includes('iştah')) {
    aiResponse =
      'Yemek konusunda ısrarcı olmayın. Farklı tatları ve dokuları oyunlaştırarak sunmayı deneyin. Birlikte yemek hazırlamak da ilgisini çekebilir. Ancak ciddi beslenme sorunları için doktorunuza danışmayı ihmal etmeyin.';
  } else {
    aiResponse =
      "Sizi anlıyorum. Bu konuda daha detaylı bilgi verebilmem için sorunuzu biraz daha açabilir misiniz? Genel olarak çocuk gelişiminde tutarlılık, sevgi ve sabır en önemli anahtarlardır. Ayrıca Bloomedu'daki gelişim raporlarını incelemeyi unutmayın.";
  }

  return aiResponse;
}

async function openaiReply(message) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'Sen Bloomedu uygulamasında ebeveynlere destek veren bir pedagog asistanısın. Türkçe, kısa, empatik ve güvenli öneriler ver. Tıbbi/psikolojik teşhis koyma; acil durumlarda profesyonel destek öner. Gerektiğinde net sorular sor.',
        },
        { role: 'user', content: String(message || '') },
      ],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error: HTTP ${resp.status} - ${text}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' && content.trim() ? content.trim() : null;
}

async function generateAiChatReply(message) {
  try {
    const llm = await openaiReply(message);
    if (llm) return llm;
  } catch (err) {
    console.error('AI provider error (falling back to mock):', err);
  }
  return mockReply(message);
}

module.exports = { generateAiChatReply };

