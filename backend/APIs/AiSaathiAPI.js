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

  const reply = await getAiSaathiReply(String(message).trim(), history);

  res.status(200).json({ message: "AI Saathi response", payload: { reply } });
});
