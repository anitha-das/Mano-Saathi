import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/baseURL";

const repeatedFallbackText = "I am here with you. Take one slow breath, pause for a moment, and focus on the next small step. If this feels too heavy, please talk to a trusted person or counselor today.";

const getClientFallbackReply = (message, history = []) => {
  const lowerMessage = message.toLowerCase();
  const recentUserMessages = history
    .filter((item) => item.role === "user")
    .slice(-3)
    .map((item) => item.text.toLowerCase())
    .join(" ");

  if (/\b(same message|repeat|repeated|again same|why again)\b/.test(lowerMessage)) {
    return "You are right to point that out. I should not keep repeating the same line. Tell me what you need right now, and I will respond to that directly. If you were testing me, yes, I understand: you want a fresh and relevant answer, not generic advice.";
  }

  if (/^(hi|hii|hello|hey|namaste)\b/.test(lowerMessage.trim())) {
    return "Hi, I am here with you. What would you like to talk about today: stress, studies, sleep, mood, or something else?";
  }

  if (/\b(exam|test|marks|study|studying|syllabus|assignment)\b/.test(lowerMessage)) {
    return "Exam stress can feel intense. Let us make it practical: choose one subject, study one small topic for 25 minutes, then take a 5-minute break. If you tell me which exam or topic is worrying you most, I can help you plan the next step.";
  }

  if (/\b(sleep|insomnia|tired|can't sleep|cannot sleep|wake up)\b/.test(lowerMessage)) {
    const linkToStress = /\b(exam|stress|stressed|anxious|study)\b/.test(recentUserMessages)
      ? " Since you mentioned stress earlier, your mind may still be in study-alert mode at night."
      : "";
    return `${linkToStress} For tonight, try a simple reset: stop scrolling, write tomorrow's first task on paper, dim the lights, and breathe slowly for two minutes. Do not force sleep; just make your body feel safe enough to rest.`;
  }

  if (/\b(tomorrow|morning|routine|plan|schedule)\b/.test(lowerMessage)) {
    return "Tomorrow morning, keep it light and specific: drink water, freshen up, take 3 slow breaths, write your top 3 tasks, and start with the easiest useful one for 20 minutes. A calm start is better than a perfect start.";
  }

  if (/\b(anxious|anxiety|panic|overthinking|stressed|stress)\b/.test(lowerMessage)) {
    return "That sounds stressful. Try naming the exact worry in one sentence, then choose one controllable action for the next 10 minutes. If your body feels tense, relax your shoulders and take five slow breaths before starting.";
  }

  if (/\b(lonely|alone|isolated|no friends)\b/.test(lowerMessage)) {
    return "Feeling alone can be really heavy. A small step could be messaging one safe person with: 'Can we talk for a few minutes?' If that feels too much, you can also share anonymously in the community first.";
  }

  return "I hear you. Let me respond to what you said instead of giving generic advice: what feels most important here, the emotion you are feeling, the problem you need to solve, or what to do next?";
};

const shouldReplaceReply = (reply, previousMessages) => {
  const normalizedReply = String(reply || "").trim();
  const previousAssistantReply = [...previousMessages].reverse().find((item) => item.role === "model")?.text?.trim();

  return !normalizedReply || normalizedReply === repeatedFallbackText || normalizedReply === previousAssistantReply;
};

function AiSaathiWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: "Hi, I am AI Saathi. I am here to listen gently." },
  ]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    const nextMessages = [...messages, { role: "user", text: userText }];
    setMessages(nextMessages);
    setInput("");

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/ai-saathi-api/chat`,
        { message: userText, history: messages.slice(-8) },
        { withCredentials: true },
      );
      const apiReply = res.data.payload.reply;
      const reply = shouldReplaceReply(apiReply, messages) ? getClientFallbackReply(userText, messages) : apiReply;
      setMessages([...nextMessages, { role: "model", text: reply }]);
    } catch (err) {
      setMessages([...nextMessages, { role: "model", text: err.response?.data?.message || getClientFallbackReply(userText, messages) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-[min(92vw,380px)] h-[540px] bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg shadow-[0_26px_80px_rgba(24,76,56,0.18)] overflow-hidden mb-3 flex flex-col transition duration-300">
          <div className="relative bg-[#EDF4E8] px-5 py-5 border-b border-[#DDE7D8] overflow-hidden">
            <p className="relative font-semibold text-[#123F31]">AI Saathi</p>
            <p className="relative text-xs text-[#8A866F] mt-1">Calm emotional support</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#F7F8F1] space-y-3">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={
                  msg.role === "user"
                    ? "ml-auto bg-[#0E4A37] text-white rounded-lg px-4 py-3 max-w-[85%] shadow-[0_10px_24px_rgba(14,74,55,0.18)]"
                    : "bg-[#FFFDF7] border border-[#DDE7D8] text-[#123F31] rounded-lg px-4 py-3 max-w-[85%] shadow-[0_8px_22px_rgba(24,76,56,0.06)]"
                }
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            ))}
            {loading && <p className="text-xs text-[#8A866F]">AI Saathi is thinking gently...</p>}
          </div>

          <div className="p-3 border-t border-[#DDE7D8] flex gap-2 bg-[#FFFDF7]">
            <input className="flex-1 bg-[#F7F8F1] border border-[#C7D7C3] rounded-lg px-4 py-2.5 text-sm outline-none text-[#123F31] placeholder:text-[#65756D] focus:border-[#1F7A58] transition" placeholder="Talk to AI Saathi..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
            <button className="bg-[#0E4A37] text-white px-4 rounded-lg text-sm font-bold hover:bg-[#166044] transition" onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      <button className="bg-[#0E4A37] text-white rounded-lg px-5 py-3 font-bold shadow-[0_16px_38px_rgba(14,74,55,0.28)] hover:bg-[#166044] hover:-translate-y-0.5 transition duration-300" onClick={() => setOpen(!open)}>
        {open ? "Close" : "AI Saathi"}
      </button>
    </div>
  );
}

export default AiSaathiWidget;

