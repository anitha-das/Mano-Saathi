import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { cardClass, headingClass, bodyText, mutedText, primaryBtn, secondaryBtn } from "../styles/common";

const sessions = [
  { type: "DEEP_BREATHING", title: "Deep Breathing", minutes: 5 },
  { type: "FOCUS_MEDITATION", title: "Focus Meditation", minutes: 10 },
  { type: "ANXIETY_RELIEF", title: "Anxiety Relief", minutes: 8 },
  { type: "RELAXATION", title: "Relaxation", minutes: 12 },
];

function Meditation() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const completionHandledRef = useRef(false);
  const timerEndsAtRef = useRef(null);

  const totalSeconds = useMemo(() => (activeSession ? activeSession.minutes * 60 : 0), [activeSession]);
  const progress = totalSeconds ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  const getMeditationData = async () => {
    try {
      const statsRes = await axios.get(`${API_BASE_URL}/meditation-api/stats`, { withCredentials: true });
      const historyRes = await axios.get(`${API_BASE_URL}/meditation-api/sessions`, { withCredentials: true });
      setStats(statsRes.data.payload);
      setHistory(historyRes.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load meditation data");
    }
  };

  useEffect(() => {
    getMeditationData();
  }, []);

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return;

    if (!timerEndsAtRef.current) {
      timerEndsAtRef.current = Date.now() + remainingSeconds * 1000;
    }

    const timerId = window.setInterval(() => {
      const nextRemainingSeconds = Math.max(0, Math.ceil((timerEndsAtRef.current - Date.now()) / 1000));
      setRemainingSeconds(nextRemainingSeconds);
    }, 250);

    return () => window.clearInterval(timerId);
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (!activeSession || remainingSeconds !== 0 || !isRunning || completionHandledRef.current) return;

    completionHandledRef.current = true;
    setIsRunning(false);
    timerEndsAtRef.current = null;
    completeSession(activeSession);
  }, [activeSession, remainingSeconds, isRunning]);

  const playCompletionSound = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
    gainNode.connect(audioContext.destination);

    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.18);
      oscillator.connect(gainNode);
      oscillator.start(audioContext.currentTime + index * 0.18);
      oscillator.stop(audioContext.currentTime + 1.25);
    });
  };

  const completeSession = async (sessionObj) => {
    try {
      playCompletionSound();
      const res = await axios.post(`${API_BASE_URL}/meditation-api/sessions`, { sessionType: sessionObj.type, durationInMinutes: sessionObj.minutes }, { withCredentials: true });
      setStats(res.data.payload.stats);
      setCompletionMessage("Session complete. Your streak has been updated.");
      await getMeditationData();
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete session");
    }
  };

  const startSession = (sessionObj) => {
    setActiveSession(sessionObj);
    setRemainingSeconds(sessionObj.minutes * 60);
    setIsRunning(true);
    setCompletionMessage("");
    timerEndsAtRef.current = Date.now() + sessionObj.minutes * 60 * 1000;
    completionHandledRef.current = false;
  };

  const resetTimer = () => {
    setRemainingSeconds(totalSeconds);
    setIsRunning(false);
    setCompletionMessage("");
    timerEndsAtRef.current = null;
    completionHandledRef.current = false;
  };

  const stopTimer = () => {
    setActiveSession(null);
    setRemainingSeconds(0);
    setIsRunning(false);
    setCompletionMessage("");
    timerEndsAtRef.current = null;
    completionHandledRef.current = false;
  };

  const toggleTimer = () => {
    if (remainingSeconds === 0) return;

    if (isRunning) {
      timerEndsAtRef.current = null;
      setIsRunning(false);
      return;
    }

    timerEndsAtRef.current = Date.now() + remainingSeconds * 1000;
    setIsRunning(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not started yet";
    return new Date(dateValue).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const streakMessage = (stats?.currentStreak || 0) > 0
    ? `You are on a ${stats.currentStreak}-day mindful streak. Keep showing up gently.`
    : "Complete one meditation session today to begin your streak.";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className={`${cardClass} sm:col-span-2 bg-[linear-gradient(120deg,#FFFDF7,#EDF4E8)]`}>
          <p className={mutedText}>Current Streak</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0E4A37] text-2xl text-white">🔥</div>
            <div>
              <h2 className="text-4xl font-semibold text-[#0E4A37]">{stats?.currentStreak || 0} days</h2>
              <p className={`${bodyText} mt-1`}>{streakMessage}</p>
            </div>
          </div>
        </div>
        <div className={cardClass}><p className={mutedText}>Highest Streak</p><h2 className="text-3xl font-semibold text-[#0E4A37]">{stats?.longestStreak || 0}</h2></div>
        <div className={cardClass}><p className={mutedText}>Total Sessions</p><h2 className="text-3xl font-semibold text-[#0E4A37]">{stats?.totalSessions || 0}</h2></div>
      </div>

      <div className={cardClass}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className={mutedText}>Last Meditation Date</p>
            <h2 className={`${headingClass} mt-2`}>{formatDate(stats?.lastSessionDate)}</h2>
          </div>
          <div className="w-full lg:max-w-md">
            <div className="flex justify-between text-xs font-bold text-[#214F3F] mb-2">
              <span>Consecutive day progress</span>
              <span>{Math.min(stats?.currentStreak || 0, 7)}/7</span>
            </div>
            <div className="h-3 rounded-full bg-[#EDF4E8] overflow-hidden border border-[#DDE7D8]">
              <div className="h-full rounded-full bg-[#0E4A37] transition-all duration-500" style={{ width: `${Math.min(((stats?.currentStreak || 0) / 7) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className={headingClass}>Meditation Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5">
          {sessions.map((sessionObj) => (
            <div key={sessionObj.type} className={cardClass}>
              <h3 className="font-semibold text-[#123F31]">{sessionObj.title}</h3>
              <p className={`${bodyText} mt-2`}>{sessionObj.minutes} peaceful minutes</p>
              <button className={`${primaryBtn} mt-5 w-full`} onClick={() => startSession(sessionObj)}>Start Timer</button>
            </div>
          ))}
        </div>
      </div>

      {activeSession && (
        <div className="rounded-lg border border-[#DDE7D8] bg-[#FFFDF7] p-6 sm:p-8 shadow-[0_16px_38px_rgba(24,76,56,0.10)]">
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-8 items-center">
            <div className="mx-auto h-64 w-64 rounded-full bg-[conic-gradient(#0E4A37_var(--progress),#EDF4E8_0)] p-3" style={{ "--progress": `${progress}%` }}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#FFFDF7] border border-[#DDE7D8] text-center">
                <p className={mutedText}>{activeSession.title}</p>
                <p className="mt-3 text-5xl font-semibold text-[#0E4A37] tracking-tight">{formatTime(remainingSeconds)}</p>
                <p className={`${bodyText} mt-3 text-sm`}>{isRunning ? "Breathe slowly and stay with the moment." : "Paused.    Resume when you are ready."}</p>
              </div>
            </div>

            <div>
              <p className={mutedText}>Guided timer</p>
              <h2 className={`${headingClass} mt-2`}>{activeSession.minutes} minute session</h2>
              <div className="mt-5 h-3 rounded-full bg-[#EDF4E8] overflow-hidden border border-[#DDE7D8]">
                <div className="h-full rounded-full bg-[#0E4A37] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              {completionMessage && <p className="mt-4 rounded-lg border border-[#D4E2CE] bg-[#EDF4E8] px-4 py-3 text-sm font-bold text-[#0E4A37]">{completionMessage}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <button className={primaryBtn} onClick={toggleTimer} disabled={remainingSeconds === 0}>
                  {isRunning ? "Pause" : "Resume"}
                </button>
                <button className={secondaryBtn} onClick={resetTimer}>Reset</button>
                <button className={secondaryBtn} onClick={stopTimer}>Stop</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={cardClass}>
        <h2 className={headingClass}>History</h2>
        <div className="space-y-3 mt-4">
          {history.slice(0, 8).map((item) => (
            <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE7D8] pb-3">
              <p className="font-medium text-[#123F31]">{item.sessionType}</p>
              <p className={mutedText}>{item.durationInMinutes} min • {formatDate(item.completedAt)}</p>
            </div>
          ))}
          {history.length === 0 && <p className={mutedText}>No sessions yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default Meditation;
