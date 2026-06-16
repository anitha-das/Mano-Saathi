import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/baseURL";

function AiSaathiWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: "Hi, I am AI Saathi. I am here to listen gently." },
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const nextMessages = [...messages, { role: "user", text: userText }];
    setMessages(nextMessages);
    setInput("");

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/ai-saathi-api/chat`,
        { message: userText, history: nextMessages.slice(-6) },
        { withCredentials: true },
      );
      setMessages([...nextMessages, { role: "model", text: res.data.payload.reply }]);
    } catch (err) {
      setMessages([...nextMessages, { role: "model", text: err.response?.data?.message || "I am here with you. Please try again slowly." }]);
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

