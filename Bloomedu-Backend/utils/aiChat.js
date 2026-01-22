// Bloomedu AI Chat helper
// - Uses OpenAI if OPENAI_API_KEY is set
// - Falls back to rule-based mock replies if not configured

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

function mockReply(message) {
  let aiResponse = '';
  const lowerMsg = String(message || '').toLowerCase();

  // App help: messaging the teacher
  if (
    (lowerMsg.includes('message') || lowerMsg.includes('text') || lowerMsg.includes('chat')) &&
    (lowerMsg.includes('teacher') || lowerMsg.includes('instructor'))
  ) {
    return (
      "To message the teacher in Bloomedu:\n" +
      "1) Open the Parent Dashboard\n" +
      "2) Tap **Communication Board / Messages**\n" +
      "3) Pick a topic (e.g., Development, Routine, Q&A)\n" +
      "4) Select your child\n" +
      "5) Type your message and tap Send\n\n" +
      "If you tell me what you want to ask, I can help you write a clear message."
    );
  }

  if (
    lowerMsg.includes('hello') ||
    lowerMsg.includes('hi') ||
    lowerMsg.includes('hey') ||
    lowerMsg.includes('merhaba') ||
    lowerMsg.includes('selam')
  ) {
    aiResponse =
      "Hello! I'm the Bloomedu Pedagogical Assistant. How can I support you and your child today?";
  } else if (
    lowerMsg.includes('game') ||
    lowerMsg.includes('play') ||
    lowerMsg.includes('oyun')
  ) {
    aiResponse =
      "Playing is great for development. In Bloomedu, try games like **Matching** and **Colors**—they support attention and early cognitive skills. At home, you can play simple “what color is this?” games with everyday objects.";
  } else if (
    lowerMsg.includes('communication') ||
    lowerMsg.includes('talk') ||
    lowerMsg.includes('speech') ||
    lowerMsg.includes('konuş') ||
    lowerMsg.includes('iletişim')
  ) {
    aiResponse =
      "To support communication, keep sentences short and clear, and follow your child’s lead. When they point to something, name it and model the word. Use gentle repetition and celebrate small attempts—every child progresses at their own pace.";
  } else if (
    lowerMsg.includes('tantrum') ||
    lowerMsg.includes('meltdown') ||
    lowerMsg.includes('angry') ||
    lowerMsg.includes('cry') ||
    lowerMsg.includes('öfke') ||
    lowerMsg.includes('kriz') ||
    lowerMsg.includes('ağla')
  ) {
    aiResponse =
      "Tantrums can be tough. Try to stay calm, keep your words minimal, and make sure your child is safe. Name the emotion (“You’re upset; I’m here with you”) and offer a simple choice when they’re calmer. If this is frequent or escalating, consider discussing it with a pediatric professional for tailored support.";
  } else if (
    lowerMsg.includes('sleep') ||
    lowerMsg.includes('bed') ||
    lowerMsg.includes('night') ||
    lowerMsg.includes('uyku')
  ) {
    aiResponse =
      'Sleep routines help a lot. Reduce screens before bed, use a predictable routine (bath → story → lights out), and keep the room dark and quiet. If sleep problems are persistent, a pediatrician can help rule out discomfort or other factors.';
  } else if (
    lowerMsg.includes('food') ||
    lowerMsg.includes('eat') ||
    lowerMsg.includes('appetite') ||
    lowerMsg.includes('yemek') ||
    lowerMsg.includes('iştah')
  ) {
    aiResponse =
      "Try to avoid pressure at mealtimes. Offer small portions, keep routines consistent, and introduce new foods slowly alongside familiar favorites. Involving your child in preparation can help. For significant feeding concerns, it’s best to consult a pediatrician or feeding specialist.";
  } else {
    aiResponse =
      "I’m here to help. Could you share a bit more detail (your child’s age, what you’re noticing, and when it happens)? I’ll suggest practical, gentle strategies you can try and what to observe next.";
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
            "You are Bloomedu's Pedagogical Assistant, supporting parents and caregivers. You also act as an in-app guide for how to use Bloomedu.\n\nPrimary goals:\n- Provide practical, empathetic, developmentally appropriate guidance.\n- Help parents communicate effectively with their child's teacher.\n- Help users navigate Bloomedu when they ask “how do I…?” or “where is…?”.\n- Ask 1–3 clarifying questions when needed.\n- Offer step-by-step strategies and simple routines.\n- Keep it concise and actionable.\n\nBloomedu app guide (features you can explain):\n- Parent sign-up & verification: sign up → receive a verification code → verify email.\n- Parent login.\n- Password reset: request reset code → verify code → set new password.\n- Linking a child to a parent: Parent Dashboard → Add Child / Verify Child → enter student code & password → link child.\n- Children overview: Parent Dashboard → Children Overview → select a child.\n- Survey: open a child → take/complete the survey if prompted.\n- Education & games: go to Education → choose a category → pick a game → play; results may be saved.\n- Progress: open a child’s progress screen (stats, recent sessions).\n- Feedback: Parent Dashboard → Feedbacks.\n- AI Chat: Parent Dashboard → Pedagog AI.\n- Messaging a teacher: Parent Dashboard → Communication Board / Messages → choose a topic → select the child → open chat → send message.\n- Message topics may include: Development Tracker, Behavioral Observations, Routine & Planning, Health & Concerns, Homework & Activities, Q&A.\n\nImportant constraints:\n- If the user asks about a feature not listed above (or you are unsure), say you’re not fully sure and ask what screen/menu they see, then provide the closest guidance.\n- Do not invent features, settings, or payment/subscription flows.\n\nSafety & scope:\n- Do NOT diagnose medical/psychological conditions.\n- If the user mentions self-harm, abuse, severe danger, or urgent medical issues, advise seeking immediate professional help or emergency services.\n- When unsure, recommend consulting a pediatrician/qualified specialist.\n\nLanguage & style:\n- ALWAYS respond in English, even if the user writes in another language.\n- Warm, supportive tone. Avoid jargon.\n- Prefer bullet points for steps.\n\nWhen the user asks about app usage, give clear navigation steps first, then offer to help draft a message or next action.",
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

