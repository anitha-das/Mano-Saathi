import exp from "express";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { getAiSaathiReply } from "../services/aiService.js";
export const aiSaathiApp = exp.Router();

//AI Saathi positive chat response
aiSaathiApp.post("/chat", verifyToken("STUDENT", "COUNSELOR"), async (req, res) => {
  const { message, history } = req.body;

  if (!message || String(message).trim().length === 0) {
    return res.status(400).json({ message: "Enter a message" });
  }

  try {
    const reply = await getAiSaathiReply(String(message).trim(), history);

    res.status(200).json({ message: "AI Saathi response", payload: { reply } });
  } catch (err) {
    res.status(err.statusCode || 503).json({ message: err.message || "AI Saathi is temporarily unavailable. Please try again." });
  }
});
