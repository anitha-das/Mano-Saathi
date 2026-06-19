import { config } from "dotenv";
config();

const GROQ_API_URL = process.env.GROQ_API_URL;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const AI_TIMEOUT = Number(process.env.AI_TIMEOUT_MS) || 12000;

const systemPrompt = `You are AI Saathi, a conversational student mental wellness assistant for MANO-SAATHI.

Your job is to respond like a real, intelligent, warm assistant.

Core behavior:
- Understand the user's latest message.
- Use recent conversation history to answer follow-up questions.
- Continue the conversation naturally instead of restarting advice.
- Adapt immediately when the user changes topic.
- Avoid repeating earlier wording, paragraphs, or advice.
- Ask a thoughtful follow-up question only when it helps.
- Give practical, student-friendly support without sounding scripted.

Topics you can help with:
- Greetings and casual conversation.
- Emotional wellness, stress, anxiety, loneliness, motivation, and confidence.
- Exams, study planning, productivity, sleep, mindfulness, and daily routines.
- General student questions, while staying supportive and grounded.

Mental wellness safety:
- Be empathetic, calm, and supportive.
- Do not diagnose medical or psychological conditions.
- Do not present yourself as a therapist or doctor.
- Never encourage self-harm, violence, or dangerous behavior.
- If a user appears to be in immediate danger, encourage urgent support from a trusted person, counselor, emergency services, or local crisis support.

Style:
- Keep replies concise but meaningful.
- Be natural and conversational.
- Respond directly to what the user actually said.`;

const createAiServiceError = (message, statusCode = 503) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const emergencyPatterns = [
  /\bsuicid(e|al)\b/i,
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bi want to die\b/i,
  /\bi wanna die\b/i,
  /\bhurt myself\b/i,
  /\bself[-\s]?harm\b/i,
  /\bcan't live\b/i,
  /\bcannot live\b/i,
];

const hasEmergencyLanguage = (message) => {
  return emergencyPatterns.some((pattern) => pattern.test(String(message || "")));
};

const getEmergencySupportReply = () => {
  return "I am really sorry you are feeling this much pain. Your safety matters right now. Please reach out immediately to a trusted person near you, your counsellor, campus support, or local emergency services. If you can, move away from anything you could use to hurt yourself and stay with someone until help is with you.";
};

const normalizeHistory = (message, history = []) => {
  const normalized = [];
  const latestMessage = String(message).trim();
  const cleanHistory = Array.isArray(history) ? history.slice(-18) : [];

  for (const item of cleanHistory) {
    const role = item?.role === "model" || item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : null;
    const text = String(item?.text || item?.content || "").trim();

    if (!role || !text) continue;
    if (role === "user" && text === latestMessage) continue;
    if (normalized.length === 0 && role === "assistant") continue;

    const previous = normalized[normalized.length - 1];
    if (previous?.role === role) {
      previous.content = `${previous.content}\n${text}`.slice(0, 2400);
    } else {
      normalized.push({ role, content: text.slice(0, 1800) });
    }
  }

  return normalized.slice(-12);
};

const getRecentAssistantReplies = (history = []) => {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => (item?.role === "model" || item?.role === "assistant") && (item?.text || item?.content))
    .slice(-4)
    .map((item) => String(item.text || item.content).trim())
    .filter(Boolean);
};

const normalizeForComparison = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getSimilarity = (firstText, secondText) => {
  const firstWords = new Set(normalizeForComparison(firstText).split(" ").filter((word) => word.length > 3));
  const secondWords = new Set(normalizeForComparison(secondText).split(" ").filter((word) => word.length > 3));

  if (firstWords.size === 0 || secondWords.size === 0) return 0;

  let overlap = 0;
  for (const word of firstWords) {
    if (secondWords.has(word)) overlap += 1;
  }

  return overlap / Math.min(firstWords.size, secondWords.size);
};

const isRepetitiveReply = (reply, history = []) => {
  const recentReplies = getRecentAssistantReplies(history);
  const normalizedReply = normalizeForComparison(reply);

  if (!normalizedReply) return true;

  return recentReplies.some((previousReply) => {
    return normalizeForComparison(previousReply) === normalizedReply || getSimilarity(previousReply, reply) > 0.82;
  });
};

const buildGroqMessages = (message, history = [], retryReason = "") => {
  const cleanHistory = normalizeHistory(message, history);
  const recentAssistantReplies = getRecentAssistantReplies(history);
  const repetitionInstruction = recentAssistantReplies.length
    ? `\n\nDo not repeat these recent AI Saathi replies. Treat them only as conversation context:\n${recentAssistantReplies.map((reply, index) => `${index + 1}. ${reply.slice(0, 500)}`).join("\n")}`
    : "";
  const retryInstruction = retryReason
    ? `\n\nPrevious generation issue: ${retryReason}. Generate a fresh, direct response with different wording.`
    : "";

  return [
    { role: "system", content: systemPrompt },
    ...cleanHistory,
    {
      role: "user",
      content: `Latest student message:\n${String(message).slice(0, 2200)}${repetitionInstruction}${retryInstruction}\n\nReply as AI Saathi.`,
    },
  ];
};

const parseGroqError = async (response) => {
  const errorText = await response.text();

  try {
    const errorJson = JSON.parse(errorText);
    return {
      raw: errorText,
      message: errorJson?.error?.message,
      type: errorJson?.error?.type,
    };
  } catch {
    return { raw: errorText };
  }
};

const requestGroqReply = async (message, history, retryReason = "") => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: buildGroqMessages(message, history, retryReason),
        temperature: retryReason ? 0.9 : 0.75,
        top_p: 0.9,
        max_tokens: 450,
      }),
    });

    if (!response.ok) {
      const errorDetails = await parseGroqError(response);
      console.log("Groq API error", response.status, errorDetails.raw);

      if (response.status === 429) {
        throw createAiServiceError("AI Saathi is busy right now because the AI provider limit was reached. Please try again in a minute.", 429);
      }

      throw createAiServiceError("AI Saathi is temporarily unavailable. Please try again in a moment.", 503);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw createAiServiceError("AI Saathi could not generate a response right now. Please try again.", 503);
    }

    return reply;
  } catch (err) {
    if (err.statusCode) throw err;
    console.log("Groq AI error", err.message);
    throw createAiServiceError("AI Saathi is temporarily unavailable. Please try again in a moment.", 503);
  } finally {
    clearTimeout(timeout);
  }
};

export const getAiSaathiReply = async (message, history = []) => {
  if (hasEmergencyLanguage(message)) {
    return getEmergencySupportReply();
  }

  if (!process.env.GROQ_API_KEY) {
    console.log("GROQ_API_KEY is missing");
    throw createAiServiceError("AI Saathi is not configured yet. Please add GROQ_API_KEY and try again.", 503);
  }

  const firstReply = await requestGroqReply(message, history);

  if (!isRepetitiveReply(firstReply, history)) {
    return firstReply;
  }

  return requestGroqReply(message, history, "The first reply was too similar to a recent AI response");
};
