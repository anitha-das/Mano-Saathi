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

const fallbackReply = "I am here with you. Take one slow breath, pause for a moment, and focus on the next small step. If this feels too heavy, please talk to a trusted person or counselor today.";

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

const buildContents = (message, history = []) => {
  const cleanHistory = Array.isArray(history) ? history.slice(-6) : [];

  const contents = cleanHistory
    .filter((item) => item?.role && item?.text)
    .map((item) => ({
      role: item.role === "model" ? "model" : "user",
      parts: [{ text: String(item.text).slice(0, 1200) }],
    }));

  contents.push({
    role: "user",
    parts: [{ text: String(message).slice(0, 2000) }],
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
    return fallbackReply;
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
      return fallbackReply;
    }

    const data = await response.json();
    const reply = extractReply(data);

    if (!reply) {
      return fallbackReply;
    }

    return reply;
  } catch (err) {
    console.log("AI Saathi error", err.message);
    return fallbackReply;
  } finally {
    clearTimeout(timeout);
  }
};
