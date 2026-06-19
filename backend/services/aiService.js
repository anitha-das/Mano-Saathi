import { config } from "dotenv";
config();

const AI_TIMEOUT = Number(process.env.GEMINI_TIMEOUT_MS) || 12000;
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  ...(process.env.GEMINI_FALLBACK_MODELS || "gemini-2.0-flash,gemini-1.5-flash")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean),
]
  .filter(Boolean)
  .filter((model, index, models) => models.indexOf(model) === index);

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

const getGeminiApiUrl = (model) => {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
};

const parseGeminiError = async (response) => {
  const errorText = await response.text();

  try {
    const errorJson = JSON.parse(errorText);
    return {
      raw: errorText,
      message: errorJson?.error?.message,
      status: errorJson?.error?.status,
      retryDelay: errorJson?.error?.details?.find((detail) => detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo")?.retryDelay,
    };
  } catch {
    return { raw: errorText };
  }
};

const normalizeHistory = (message, history = []) => {
  const normalized = [];
  const latestMessage = String(message).trim();
  const cleanHistory = Array.isArray(history) ? history.slice(-16) : [];

  for (const item of cleanHistory) {
    const role = item?.role === "model" ? "model" : item?.role === "user" ? "user" : null;
    const text = String(item?.text || "").trim();

    if (!role || !text) continue;
    if (role === "user" && text === latestMessage) continue;
    if (normalized.length === 0 && role === "model") continue;

    const previous = normalized[normalized.length - 1];
    if (previous?.role === role) {
      previous.text = `${previous.text}\n${text}`.slice(0, 2200);
    } else {
      normalized.push({ role, text: text.slice(0, 1800) });
    }
  }

  return normalized.slice(-12);
};

const getRecentModelReplies = (history = []) => {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => item?.role === "model" && item?.text)
    .slice(-4)
    .map((item) => String(item.text).trim())
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
  const recentReplies = getRecentModelReplies(history);
  const normalizedReply = normalizeForComparison(reply);

  if (!normalizedReply) return true;

  return recentReplies.some((previousReply) => {
    return normalizeForComparison(previousReply) === normalizedReply || getSimilarity(previousReply, reply) > 0.82;
  });
};

const buildContents = (message, history = [], retryReason = "") => {
  const cleanHistory = normalizeHistory(message, history);

  const contents = cleanHistory.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));

  const recentModelReplies = getRecentModelReplies(history);
  const repetitionInstruction = recentModelReplies.length
    ? `\n\nDo not repeat these recent AI Saathi replies. Use them only as context:\n${recentModelReplies.map((reply, index) => `${index + 1}. ${reply.slice(0, 500)}`).join("\n")}`
    : "";

  const retryInstruction = retryReason
    ? `\n\nPrevious generation problem: ${retryReason}. Generate a fresh response with different wording and direct attention to the latest message.`
    : "";

  contents.push({
    role: "user",
    parts: [
      {
        text: `Latest student message:\n${String(message).slice(0, 2200)}${repetitionInstruction}${retryInstruction}\n\nReply as AI Saathi.`,
      },
    ],
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

const requestGeminiReply = async (model, message, history, retryReason = "") => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const response = await fetch(getGeminiApiUrl(model), {
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
        contents: buildContents(message, history, retryReason),
        generationConfig: {
          temperature: retryReason ? 0.95 : 0.85,
          topP: 0.95,
          maxOutputTokens: 420,
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
      const errorDetails = await parseGeminiError(response);
      console.log("Gemini API error", response.status, model, errorDetails.raw);

      if (response.status === 429) {
        const quotaError = createAiServiceError("Gemini quota exceeded for the current model.", 429);
        quotaError.isQuotaError = true;
        quotaError.model = model;
        quotaError.retryDelay = errorDetails.retryDelay;
        throw quotaError;
      }

      throw createAiServiceError("AI Saathi is temporarily unavailable. Please try again in a moment.", 503);
    }

    const data = await response.json();
    const reply = extractReply(data);

    if (!reply) {
      throw createAiServiceError("AI Saathi could not generate a response right now. Please try again.", 503);
    }

    return reply;
  } catch (err) {
    if (err.statusCode) throw err;
    console.log("AI Saathi error", err.message);
    throw createAiServiceError("AI Saathi is temporarily unavailable. Please try again in a moment.", 503);
  } finally {
    clearTimeout(timeout);
  }
};

export const getAiSaathiReply = async (message, history = []) => {
  if (!process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY is missing");
    throw createAiServiceError("AI Saathi is not configured yet. Please add the Gemini API key and try again.", 503);
  }

  let lastQuotaError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const firstReply = await requestGeminiReply(model, message, history);

      if (!isRepetitiveReply(firstReply, history)) {
        return firstReply;
      }

      const retryReply = await requestGeminiReply(model, message, history, "The first reply was too similar to a recent AI response");
      return retryReply;
    } catch (err) {
      if (!err.isQuotaError) throw err;
      lastQuotaError = err;
    }
  }

  const retryText = lastQuotaError?.retryDelay ? ` Please try again after ${lastQuotaError.retryDelay}.` : " Please try again later.";
  throw createAiServiceError(`AI Saathi has reached the Gemini quota for now.${retryText}`, 429);
};
