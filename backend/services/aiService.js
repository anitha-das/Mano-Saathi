import { config } from "dotenv";
config();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const AI_TIMEOUT = Number(process.env.GEMINI_TIMEOUT_MS) || 12000;

const systemPrompt = `You are AI Saathi, a friendly emotional wellness assistant for students on MANO-SAATHI.

Your role is to provide calm, emotionally safe, supportive, natural, and student-friendly conversations.

Behave like a warm, understanding companion — not like a doctor, therapist, or robotic chatbot.

Guidelines:
- Respond naturally and conversationally.
- Understand greetings, casual chats, emotional struggles, motivation requests, study stress, anxiety, loneliness, burnout, calming recommendations, and wellness guidance.
- Keep responses supportive, practical, and emotionally comforting.
- Avoid sounding repetitive or overly dramatic.
- Use the user's latest message as the main focus.
- Use recent conversation history for follow-up questions, but do not repeat your previous answer.
- If the user changes topics, adapt to the new topic immediately.
- Keep responses short to medium length unless the user asks for detailed help.
- When users ask for recommendations, examples, songs, study tips, routines, calming ideas, or wellness suggestions, provide specific useful examples naturally instead of generic guidance.
- Respond directly to the user's request first before giving emotional reassurance.
- Maintain a positive, emotionally safe, hopeful tone.

Safety Rules:
- Never give harmful advice.
- Never encourage self-harm, violence, or dangerous behavior.
- Never provide toxic or abusive responses.
- Do not diagnose medical or psychological conditions.
- If the user appears in serious emotional danger, encourage them to contact a trusted person, counselor, emergency service, or crisis support immediately.

Your goal is to make students feel heard, calmer, supported, and emotionally safer after each conversation.`;

const fallbackReplies = {
  exam: "Exam stress can feel heavy, but you do not have to solve everything at once. Pick one subject, set a 25-minute study block, and write the three topics that matter most today. After that, take a short break and repeat gently.",
  sleep: "Poor sleep often gets worse when stress keeps the mind active. Tonight, try a simple wind-down: stop studying 30 minutes before bed, dim your screen, write tomorrow's first task on paper, and do slow breathing for two minutes.",
  morning: "Tomorrow morning, keep it simple: drink water, do one slow breathing round, review your top three tasks, and start with the easiest useful step for 20 minutes. A calm start matters more than a perfect one.",
  lonely: "Feeling lonely can be really painful. Try reaching out to one safe person with a small message like, 'Can we talk for a few minutes?' You can also share anonymously in the community if speaking directly feels too hard.",
  anxiety: "When anxiety rises, bring your attention back to the present. Try naming five things you can see, relax your shoulders, and choose one tiny next action. You are not behind for needing a slower pace.",
  greeting: "Hi, I am here with you. Tell me what is on your mind today, and we can take it one step at a time.",
  default: "I hear you. Let us focus on what you just shared and make it smaller: name the main feeling, choose one practical next step, and give yourself permission to move gently. What part feels hardest right now?",
};

const emergencyWords = [
  "suicide",
  "kill myself",
  "end my life",
  "self harm",
  "hurt myself",
  "i want to die",
  "can't live",
  "cannot live",
];

const getEmergencySupportReply = () => {
  return "I am really sorry you are feeling this much pain. Please do not stay alone with this right now. Contact a trusted person, your counselor, or local emergency services immediately. You deserve urgent support and care in this moment.";
};

const hasEmergencyLanguage = (message) => {
  const lowerMessage = message.toLowerCase();
  return emergencyWords.some((word) => lowerMessage.includes(word));
};

const getFallbackReply = (message) => {
  const lowerMessage = message.toLowerCase();

  if (/\b(exam|test|marks|study|studying|syllabus|assignment)\b/.test(lowerMessage)) return fallbackReplies.exam;
  if (/\b(sleep|insomnia|tired|can't sleep|cannot sleep|wake up)\b/.test(lowerMessage)) return fallbackReplies.sleep;
  if (/\b(tomorrow|morning|routine|plan|schedule)\b/.test(lowerMessage)) return fallbackReplies.morning;
  if (/\b(lonely|alone|isolated|no friends)\b/.test(lowerMessage)) return fallbackReplies.lonely;
  if (/\b(anxious|anxiety|panic|overthinking|stressed|stress)\b/.test(lowerMessage)) return fallbackReplies.anxiety;
  if (/^(hi|hello|hey|namaste)\b/.test(lowerMessage.trim())) return fallbackReplies.greeting;

  return fallbackReplies.default;
};

const normalizeHistory = (message, history = []) => {
  const normalized = [];
  const latestMessage = String(message).trim();
  const cleanHistory = Array.isArray(history) ? history.slice(-10) : [];

  for (const item of cleanHistory) {
    const role = item?.role === "model" ? "model" : item?.role === "user" ? "user" : null;
    const text = String(item?.text || "").trim();

    if (!role || !text) continue;
    if (role === "user" && text === latestMessage) continue;
    if (normalized.length === 0 && role === "model") continue;

    const previous = normalized[normalized.length - 1];
    if (previous?.role === role) {
      previous.text = `${previous.text}\n${text}`.slice(0, 1600);
    } else {
      normalized.push({ role, text: text.slice(0, 1200) });
    }
  }

  return normalized.slice(-8);
};

const buildContents = (message, history = []) => {
  const cleanHistory = normalizeHistory(message, history);

  const contents = cleanHistory
    .map((item) => ({
      role: item.role,
      parts: [{ text: item.text }],
    }));

  contents.push({
    role: "user",
    parts: [{ text: `Latest student message: ${String(message).slice(0, 2000)}\n\nRespond directly to this message. If it is a follow-up, use the recent context. Avoid repeating your previous response.` }],
  });

  return contents;
};

const extractReply = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return null;
  }

  return parts.map((part) => part.text).filter(Boolean).join(" ").trim();
};

export const getAiSaathiReply = async (message, history = []) => {
  if (hasEmergencyLanguage(message)) {
    return getEmergencySupportReply();
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY is missing");
    return getFallbackReply(message);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: buildContents(message, history),
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          maxOutputTokens: 300,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Gemini API error", response.status, errorText);
      return getFallbackReply(message);
    }

    const data = await response.json();
    const reply = extractReply(data);

    if (!reply) {
      return getFallbackReply(message);
    }

    return reply;
  } catch (err) {
    console.log("AI Saathi error", err.message);
    return getFallbackReply(message);
  } finally {
    clearTimeout(timeout);
  }
};
