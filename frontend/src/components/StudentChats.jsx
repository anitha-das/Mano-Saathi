import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { useAuth } from "../store/authStore";
import { cardClass, headingClass, bodyText, mutedText, inputClass, primaryBtn, emptyStateClass } from "../styles/common";

function StudentChats() {
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const currentUser = useAuth((state) => state.currentUser);
  const currentUserId = currentUser?._id || currentUser?.id;

  const getChatData = async () => {
    try {
      const reqRes = await axios.get(`${API_BASE_URL}/student-api/chat-requests`, { withCredentials: true });
      const chatRes = await axios.get(`${API_BASE_URL}/student-api/chats`, { withCredentials: true });
      const chatList = chatRes.data.payload || [];
      const selectedChatId = new URLSearchParams(location.search).get("chatId");

      setRequests(reqRes.data.payload || []);
      setChats(chatList);

      if (chatList.length > 0) {
        const nextActive = selectedChatId ? chatList.find((chat) => chat._id === selectedChatId) : activeChat && chatList.find((chat) => chat._id === activeChat._id);
        setActiveChat(nextActive || chatList[0]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load chats");
    }
  };

  useEffect(() => {
    getChatData();
  }, [location.search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages?.length]);

  const sendMessage = async () => {
    try {
      if (!message.trim() || !activeChat) return;
      const res = await axios.put(`${API_BASE_URL}/student-api/chats`, { chatId: activeChat._id, message: message.trim() }, { withCredentials: true });
      const updatedChat = { ...activeChat, ...res.data.payload, counselor: activeChat.counselor };
      setActiveChat(updatedChat);
      setChats(chats.map((chat) => (chat._id === activeChat._id ? updatedChat : chat)));
      setMessage("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  const getMessageTime = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={cardClass}>
        <h2 className={headingClass}>Requests</h2>
        <div className="space-y-3 mt-4">
          {requests.map((requestObj) => (
            <div key={requestObj._id} className="bg-[#F7F8F1] rounded-lg p-4 border border-[#DDE7D8]">
              <p className="font-semibold text-[#123F31]">{requestObj.counselor?.firstName} {requestObj.counselor?.lastName}</p>
              <p className={mutedText}>{requestObj.status}</p>
            </div>
          ))}
          {requests.length === 0 && <p className={emptyStateClass}>No requests yet.</p>}
        </div>
      </div>

      <div className={`${cardClass} lg:col-span-2`}>
        <h2 className={headingClass}>Private Counselor Chat</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          {chats.map((chatObj) => (
            <button
              key={chatObj._id}
              className={activeChat?._id === chatObj._id ? "bg-[#0E4A37] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-[0_8px_20px_rgba(14,74,55,0.18)]" : "bg-[#EDF4E8] text-[#214F3F] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#FFFDF7] transition"}
              onClick={() => setActiveChat(chatObj)}
            >
              {chatObj.counselor?.firstName || "Counselor"}
            </button>
          ))}
        </div>

        {!activeChat && <p className={emptyStateClass}>Accepted chats will appear here.</p>}
        {activeChat && (
          <div className="mt-5 overflow-hidden rounded-lg border border-[#DDE7D8] bg-[#F7F8F1] shadow-inner">
            <div className="border-b border-[#DDE7D8] bg-[#FFFDF7] px-5 py-4">
              <p className="font-bold text-[#123F31]">{activeChat.counselor?.firstName || "Counselor"} {activeChat.counselor?.lastName || ""}</p>
              <p className={mutedText}>Private support conversation</p>
            </div>

            <div className="min-h-80 max-h-[32rem] overflow-y-auto scroll-smooth p-4 sm:p-5 space-y-4">
              {activeChat.messages?.map((msg) => {
                const isOwnMessage = String(msg.sender) === String(currentUserId);
                return (
                  <div key={msg._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-3 shadow-[0_8px_22px_rgba(24,76,56,0.08)] ${isOwnMessage ? "rounded-br-sm bg-[#0E4A37] text-white" : "rounded-bl-sm bg-[#FFFDF7] border border-[#DDE7D8] text-[#123F31]"}`}>
                      <p className={`text-xs font-bold mb-1 ${isOwnMessage ? "text-[#D9EADB]" : "text-[#1F7A58]"}`}>
                        {isOwnMessage ? "You" : activeChat.counselor?.firstName || "Counselor"}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={`mt-2 text-[0.68rem] text-right ${isOwnMessage ? "text-white/70" : "text-[#65756D]"}`}>{getMessageTime(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
              {activeChat.messages?.length === 0 && <p className={mutedText}>Start with a gentle message.</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t border-[#DDE7D8] bg-[#FFFDF7] p-4">
              <input className={inputClass} placeholder="Write privately..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
              <button className={primaryBtn} onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentChats;
