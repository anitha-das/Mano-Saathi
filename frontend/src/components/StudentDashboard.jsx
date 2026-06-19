import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import {
  cardClass,
  dashboardGrid,
  headingClass,
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
          <p className={mutedText}>Daily Mind Balance</p>
          <h2 className={`${headingClass} mt-3`}>{quote?.quote || "Small daily efforts create meaningful growth."}</h2>
          <p className={`${bodyText} mt-4`}>{quote?.category || "Mind Balance"}</p>
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
