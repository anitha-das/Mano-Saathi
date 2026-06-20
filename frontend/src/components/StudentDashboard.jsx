import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import {
  cardClass,
  dashboardGrid,
  subHeadingClass,
  bodyText,
  mutedText,
  inputClass,
  submitBtn,
  labelClass,
  loadingClass,
} from "../styles/common";

const DAILY_QUOTE_SESSION_KEY = "manoSaathiDailyQuoteSession";
const DAILY_QUOTE_HISTORY_KEY = "manoSaathiDailyQuoteHistory";

const getTodayKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
};

const readStoredJson = (storage, key) => {
  try {
    return JSON.parse(storage.getItem(key));
  } catch {
    storage.removeItem(key);
    return null;
  }
};

const getStoredDailyQuote = () => {
  const storedQuote = readStoredJson(sessionStorage, DAILY_QUOTE_SESSION_KEY);

  if (storedQuote?.date === getTodayKey() && storedQuote?.quote?.quote) {
    return storedQuote.quote;
  }

  sessionStorage.removeItem(DAILY_QUOTE_SESSION_KEY);
  return null;
};

const getPreviousQuoteId = () => {
  const quoteHistory = readStoredJson(localStorage, DAILY_QUOTE_HISTORY_KEY);
  return quoteHistory?.quoteId || null;
};

const rememberDailyQuote = (quote) => {
  if (!quote?.quote) return;

  const quoteRecord = { date: getTodayKey(), quote };
  sessionStorage.setItem(DAILY_QUOTE_SESSION_KEY, JSON.stringify(quoteRecord));
  localStorage.setItem(DAILY_QUOTE_HISTORY_KEY, JSON.stringify({ date: quoteRecord.date, quoteId: quote._id || quote.quote }));
};

const getMillisecondsUntilNextDay = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);

  return tomorrow.getTime() - now.getTime() + 1000;
};

const fetchDailyQuote = async () => {
  const storedQuote = getStoredDailyQuote();
  if (storedQuote) return storedQuote;

  const quoteRes = await axios.get(`${API_BASE_URL}/auth/daily-quote`, {
    params: { excludeQuoteId: getPreviousQuoteId() },
    withCredentials: true,
  });
  const selectedQuote = quoteRes.data.payload;
  rememberDailyQuote(selectedQuote);

  return selectedQuote;
};

const BotanicalLeafCluster = ({ position = "left" }) => {
  const isRight = position.includes("right");
  const isBottom = position.includes("bottom");
  const clusterPosition = isRight ? "right-[-42px]" : "left-[-42px]";
  const verticalPosition = isBottom ? "bottom-[-34px]" : "top-[-34px]";
  const mirror = isRight ? "scale-x-[-1]" : "";
  const tilt = isBottom ? "rotate-[10deg]" : "-rotate-[8deg]";

  return (
    <div className={["pointer-events-none absolute", verticalPosition, clusterPosition, "h-36 w-44 sm:h-44 sm:w-56 opacity-45", mirror, tilt].join(" ")} aria-hidden="true">
      <span className="absolute left-16 top-8 h-32 w-[3px] origin-bottom rotate-[28deg] rounded-full bg-[#6F9678]/35 blur-[0.2px]" />
      <span className="absolute left-7 top-11 h-16 w-8 rotate-[-26deg] rounded-[70%_10%_70%_10%] bg-[radial-gradient(circle_at_35%_30%,#DDEDDD,#7DA487_70%)] shadow-[inset_7px_0_16px_rgba(18,63,49,0.08)] blur-[0.1px]" />
      <span className="absolute left-23 top-4 h-20 w-10 rotate-[13deg] rounded-[70%_12%_70%_12%] bg-[radial-gradient(circle_at_35%_30%,#E6F1E2,#86AA8E_74%)] shadow-[inset_8px_0_18px_rgba(18,63,49,0.08)] blur-[0.1px]" />
      <span className="absolute left-21 top-25 h-24 w-14 rotate-[46deg] rounded-[72%_14%_72%_14%] bg-[radial-gradient(circle_at_38%_30%,#D9EADA,#5E8E75_78%)] shadow-[inset_10px_0_20px_rgba(18,63,49,0.10)] blur-[0.1px]" />
      <span className="absolute left-1 top-24 h-20 w-16 rotate-[72deg] rounded-[76%_18%_76%_18%] bg-[radial-gradient(circle_at_40%_30%,#E6F1E2,#7DA487_76%)] shadow-[inset_10px_0_20px_rgba(18,63,49,0.08)] blur-[0.2px]" />
    </div>
  );
};

const QuoteCardVisual = ({ text }) => {
  return (
    <div className="relative isolate overflow-hidden rounded-lg border border-[#D7E4D1] bg-[radial-gradient(circle_at_center,#FFFDF7_0%,#F2F7EC_48%,#E4EFE2_100%)] px-5 py-8 sm:px-10 sm:py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_26px_rgba(24,76,56,0.08)] transition duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_16px_32px_rgba(24,76,56,0.11)]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,253,247,0.82),rgba(237,244,232,0.38),rgba(255,253,247,0.78))]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-[0.16] bg-[radial-gradient(circle_at_20%_20%,#9CB9A7_0_1px,transparent_1px),radial-gradient(circle_at_75%_35%,#9CB9A7_0_1px,transparent_1px)] bg-[length:18px_18px,22px_22px]" aria-hidden="true" />
      <BotanicalLeafCluster position="top-left" />
      <BotanicalLeafCluster position="bottom-left" />
      <BotanicalLeafCluster position="top-right" />
      <BotanicalLeafCluster position="bottom-right" />

      <div className="relative z-10 mx-auto flex min-h-28 max-w-2xl items-center justify-center text-center">
        <p className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-[1.45] tracking-[0.08em] text-[#123F31] [font-family:Georgia,serif]">
          <span className="text-[#1F7A58]/80">&quot;</span>
          {text}
          <span className="text-[#1F7A58]/80">&quot;</span>
        </p>
      </div>
    </div>
  );
};

function StudentDashboard() {
  const [quote, setQuote] = useState(null);
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const [selectedQuote, statsRes, articleRes] = await Promise.all([
        fetchDailyQuote(),
        axios.get(`${API_BASE_URL}/meditation-api/stats`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/student-api/articles`, { withCredentials: true }),
      ]);

      setQuote(selectedQuote);
      setStats(statsRes.data.payload);
      setArticles(articleRes.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let quoteRefreshTimer;

    const refreshQuoteOnDateChange = async () => {
      sessionStorage.removeItem(DAILY_QUOTE_SESSION_KEY);

      try {
        const selectedQuote = await fetchDailyQuote();
        setQuote(selectedQuote);
      } catch (err) {
        console.warn("Daily quote refresh failed", err);
      } finally {
        quoteRefreshTimer = setTimeout(refreshQuoteOnDateChange, getMillisecondsUntilNextDay());
      }
    };

    getDashboardData();
    quoteRefreshTimer = setTimeout(refreshQuoteOnDateChange, getMillisecondsUntilNextDay());

    return () => clearTimeout(quoteRefreshTimer);
  }, []);

  const onMoodSubmit = async (moodObj) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/student-api/mood`, moodObj, { withCredentials: true });
      toast.success(res.data.message);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save mood");
    }
  };

  if (loading) {
    return <p className={loadingClass}>Loading your wellness space...</p>;
  }

  return (
    <div>
      <div className={dashboardGrid}>
        <div className={`${cardClass} lg:col-span-2`}>
          <QuoteCardVisual text={quote?.quote || "Small daily efforts create meaningful growth."} />
        </div>

        <div className={cardClass}>
          <p className={mutedText}>Meditation Streak</p>
          <h2 className="text-4xl font-semibold text-[#0E4A37] mt-3">{stats?.currentStreak || 0} days</h2>
          <p className={`${bodyText} mt-2`}>Longest streak: {stats?.longestStreak || 0}</p>
          <p className={mutedText}>Total sessions: {stats?.totalSessions || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className={cardClass}>
          <h3 className={subHeadingClass}>Mood Check-In</h3>
          <form onSubmit={handleSubmit(onMoodSubmit)} className="mt-4">
            <label className={labelClass}>How are you feeling?</label>
            <select className={inputClass} {...register("mood", { required: true })}>
              <option value="CALM">Calm</option>
              <option value="HAPPY">Happy</option>
              <option value="STRESSED">Stressed</option>
              <option value="LONELY">Lonely</option>
              <option value="MOTIVATED">Motivated</option>
              <option value="ANXIOUS">Anxious</option>
            </select>
            <label className={`${labelClass} mt-4`}>Optional note</label>
            <textarea className={`${inputClass} min-h-24`} placeholder="Write gently..." {...register("note")} />
            <button className={submitBtn}>Save Mood</button>
          </form>
        </div>

        <div className={`${cardClass} lg:col-span-2`}>
          <h3 className={subHeadingClass}>Latest Counselor Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {articles.slice(0, 4).map((articleObj) => (
              <div key={articleObj._id} className="bg-[#F7F8F1] rounded-lg p-4 border border-[#DDE7D8] shadow-[0_8px_22px_rgba(24,76,56,0.05)]">
                <p className="font-semibold text-[#123F31]">{articleObj.title}</p>
                <p className={`${bodyText} text-sm mt-2`}>{articleObj.content?.slice(0, 110)}...</p>
                <p className={mutedText}>By {articleObj.counselor?.firstName || "Counselor"}</p>
              </div>
            ))}
            {articles.length === 0 && <p className={mutedText}>No articles available yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
