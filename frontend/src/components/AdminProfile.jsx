import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { pageWrapper, panelClass, tabWrap, activeTab, idleTab, cardClass, mutedText, dangerBtn, successBtn, inputClass, primaryBtn } from "../styles/common";

function AdminProfile() {
  const currentUser = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [reports, setReports] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activity, setActivity] = useState(null);
  const [active, setActive] = useState("activity");
  const [quoteText, setQuoteText] = useState("");

  const loadAdminData = async () => {
    try {
      const [usersRes, counselorsRes, reportsRes, quotesRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin-api/users`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/admin-api/counselors`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/admin-api/reports`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/admin-api/quotes`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/admin-api/activity`, { withCredentials: true }),
      ]);
      setUsers(usersRes.data.payload || []);
      setCounselors(counselorsRes.data.payload || []);
      setReports(reportsRes.data.payload || []);
      setQuotes(quotesRes.data.payload || []);
      setActivity(activityRes.data.payload);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admin dashboard");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleUserStatus = async (userObj) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/admin-api/users`, { userId: userObj._id, isUserActive: !userObj.isUserActive }, { withCredentials: true });
      setUsers(users.map((user) => (user._id === userObj._id ? res.data.payload : user)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  const reviewReport = async (reportId, status) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/admin-api/reports`, { reportId, status, adminNote: "Reviewed by admin" }, { withCredentials: true });
      setReports(reports.map((report) => (report._id === reportId ? res.data.payload : report)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to review report");
    }
  };

  const createQuote = async () => {
    try {
      if (!quoteText) return;
      const res = await axios.post(`${API_BASE_URL}/admin-api/quotes`, { quote: quoteText, category: "Mind Balance" }, { withCredentials: true });
      setQuotes([res.data.payload, ...quotes]);
      setQuoteText("");
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create quote");
    }
  };

  return (
    <div className={pageWrapper}>
      <div className={`${panelClass} mb-8 flex items-center justify-between`}>
        <div>
          <p className="text-sm text-[#486C84]">Admin Dashboard</p>
          <h2 className="text-xl font-semibold text-[#3C5A78]">{currentUser?.firstName}</h2>
        </div>
        <button className={dangerBtn} onClick={onLogout}>Logout</button>
      </div>

      <div className={tabWrap}>
        {['activity','users','counselors','reports','quotes'].map((tab) => (
          <button key={tab} className={active === tab ? activeTab : idleTab} onClick={() => setActive(tab)}>{tab}</button>
        ))}
      </div>

      {active === "activity" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {activity && Object.entries(activity).map(([key, value]) => (
            <div key={key} className={cardClass}>
              <p className={mutedText}>{key}</p>
              <h3 className="text-3xl font-semibold text-[#489888] mt-2">{value}</h3>
            </div>
          ))}
        </div>
      )}

      {active === "users" && <AdminList items={users} action={toggleUserStatus} actionText={(item) => item.isUserActive ? "Block" : "Unblock"} />}
      {active === "counselors" && <CounselorAdminList items={counselors} />}

      {active === "reports" && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className={cardClass}>
              <p className="font-semibold text-[#3C5A78]">{report.reason}</p>
              <p className={mutedText}>{report.targetType} - {report.status}</p>
              <p className="text-sm text-[#486C84] mt-2">{report.post?.content}</p>
              <div className="flex gap-2 mt-4">
                <button className={successBtn} onClick={() => reviewReport(report._id, "REVIEWED")}>Review</button>
                <button className={dangerBtn} onClick={() => reviewReport(report._id, "DISMISSED")}>Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {active === "quotes" && (
        <div>
          <div className="flex gap-3 mb-5">
            <input className={inputClass} placeholder="Add motivational quote" value={quoteText} onChange={(e) => setQuoteText(e.target.value)} />
            <button className={primaryBtn} onClick={createQuote}>Add</button>
          </div>
          <div className="space-y-3">
            {quotes.map((quote) => <div key={quote._id} className={cardClass}><p className="text-[#3C5A78] font-medium">{quote.quote}</p><p className={mutedText}>{quote.category}</p></div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function CounselorAdminList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item._id} className={`${cardClass} flex flex-col sm:flex-row justify-between gap-4`}>
          <div>
            <h3 className="font-semibold text-[#3C5A78]">{item.firstName} {item.lastName}</h3>
            <p className={mutedText}>{item.email}</p>
            <p className={mutedText}>{item.counselorProfile?.qualifications || "Counselor"}</p>
            <p className="text-xs font-bold text-[#489888] mt-2">Active immediately after registration</p>
          </div>
          <span className="h-fit rounded-full bg-[#E4F1EB] border border-[#C9E0DA] px-4 py-2 text-sm font-bold text-[#489888]">
            Active
          </span>
        </div>
      ))}
    </div>
  );
}
function AdminList({ items, action, actionText }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item._id} className={`${cardClass} flex flex-col sm:flex-row justify-between gap-4`}>
          <div>
            <h3 className="font-semibold text-[#3C5A78]">{item.firstName} {item.lastName}</h3>
            <p className={mutedText}>{item.email}</p>
            <p className={mutedText}>{item.role}</p>
          </div>
          <button className={item.isUserActive === false ? successBtn : dangerBtn} onClick={() => action(item)}>{actionText(item)}</button>
        </div>
      ))}
    </div>
  );
}

export default AdminProfile;



