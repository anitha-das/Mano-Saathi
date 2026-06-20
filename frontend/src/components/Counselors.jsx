import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { headingClass, bodyText, mutedText, primaryBtn, secondaryBtn, emptyStateClass, tagClass } from "../styles/common";

const getArticleCounselorId = (articleObj) => {
  return articleObj?.counselor?._id || articleObj?.counselor;
};

const getCounselorName = (counselorObj) => {
  return `${counselorObj?.firstName || ""} ${counselorObj?.lastName || ""}`.trim() || "Counselor";
};

const formatArticleDate = (dateValue) => {
  if (!dateValue) return "Date not available";

  return new Date(dateValue).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function Counselors() {
  const [counselors, setCounselors] = useState([]);
  const [articles, setArticles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  const selectedCounselorArticles = useMemo(() => {
    if (!selectedCounselor?._id) return [];

    return articles.filter((articleObj) => String(getArticleCounselorId(articleObj)) === String(selectedCounselor._id));
  }, [articles, selectedCounselor]);

  const getCounselors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student-api/counselors`, { withCredentials: true });
      setCounselors(res.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load counselors");
    }
  };

  const getArticles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student-api/articles`, { withCredentials: true });
      setArticles(res.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load articles");
    }
  };

  const getRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student-api/chat-requests`, { withCredentials: true });
      setRequests(res.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load counselor requests");
    }
  };

  useEffect(() => {
    getCounselors();
    getArticles();
    getRequests();
  }, []);

  const requestCounselor = async (counselorId) => {
    try {
      const existingStatus = getRequestStatus(counselorId);

      if (existingStatus === "PENDING") {
        return toast.error("Request already pending.");
      }

      if (existingStatus === "ACCEPTED") {
        return toast.error("You are already connected with this counsellor.");
      }

      const message = window.prompt("Write a short message for the counselor") || "I want private support.";
      const res = await axios.post(`${API_BASE_URL}/student-api/chat-requests`, { counselor: counselorId, message }, { withCredentials: true });
      setRequests((prev) => [res.data.payload, ...prev]);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request counselor");
    }
  };

  const getRequestStatus = (counselorId) => {
    const activeRequest = requests.find((requestObj) => {
      const requestCounselorId = requestObj.counselor?._id || requestObj.counselor;
      return String(requestCounselorId) === String(counselorId) && ["PENDING", "ACCEPTED"].includes(requestObj.status);
    });

    return activeRequest?.status;
  };

  const getButtonLabel = (status) => {
    if (status === "PENDING") return "Request Pending";
    if (status === "ACCEPTED") return "Connected";
    return "Connect with Counsellor";
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-lg border border-[#D4E2CE] bg-[linear-gradient(120deg,#FFFDF7,#EDF4E8)] p-7 sm:p-10 shadow-[0_16px_38px_rgba(24,76,56,0.10)]">
        <div className="relative max-w-3xl">
          <p className={tagClass}>Counselor Sessions</p>
          <h2 className={`${headingClass} mt-3`}>Choose a counselor who feels right for you.</h2>
          <p className={`${bodyText} mt-4 text-lg`}>
            Browse supportive professionals, review their expertise, and request a private conversation whenever you feel ready.
          </p>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className={headingClass}>Available Counselors</h2>
            <p className={`${mutedText} mt-2`}>Counselors are active immediately after registration.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 mt-7">
          {counselors.map((counselorObj) => {
            const requestStatus = getRequestStatus(counselorObj._id);
            const isRequestDisabled = requestStatus === "PENDING" || requestStatus === "ACCEPTED";

            return (
              <div key={counselorObj._id} className="group relative overflow-hidden rounded-lg border border-[#DDE7D8] bg-[#FFFDF7] shadow-[0_14px_32px_rgba(24,76,56,0.10)] hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(24,76,56,0.16)] transition duration-300">
                <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(120deg,#EDF4E8,#FFFDF7)]" />
                <div className="relative p-6 sm:p-7">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {counselorObj.profileImageUrl ? (
                      <img src={counselorObj.profileImageUrl} className="w-24 h-24 rounded-lg object-cover border-4 border-[#FFFDF7] shadow-[0_10px_24px_rgba(24,76,56,0.16)]" alt="counselor" />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-[#EDF4E8] border-4 border-[#FFFDF7] text-[#123F31] flex items-center justify-center text-3xl font-bold shadow-[0_10px_24px_rgba(24,76,56,0.16)]">
                        {counselorObj.firstName?.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-semibold text-[#123F31] [font-family:Georgia,serif]">
                            {counselorObj.firstName} {counselorObj.lastName}
                          </h3>
                          <p className="text-sm font-semibold text-[#214F3F] mt-1">{counselorObj.counselorProfile?.qualifications || "Professional Counselor"}</p>
                        </div>
                        <span className="rounded-full bg-[#EDF4E8] border border-[#D4E2CE] px-3 py-1 text-xs font-bold text-[#1F7A58]">
                          {counselorObj.counselorProfile?.availabilityStatus || "AVAILABLE"}
                        </span>
                      </div>

                      <p className={`${bodyText} mt-4`}>
                        {counselorObj.counselorProfile?.bio || "Supportive counselor focused on student emotional wellness and calm guidance."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(counselorObj.counselorProfile?.expertise?.length ? counselorObj.counselorProfile.expertise : ["Stress", "Anxiety", "Student wellness"]).map((item) => (
                      <span key={item} className="rounded-full bg-[#F7F8F1] border border-[#DDE7D8] px-3 py-1 text-xs font-semibold text-[#123F31]">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-[#DDE7D8] pt-5">
                    <p className={mutedText}>{counselorObj.counselorProfile?.yearsOfExperience || 0} years experience</p>
                    <div className="w-full lg:w-auto">
                      <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button className={`${secondaryBtn} w-full sm:w-auto`} onClick={() => setSelectedCounselor(counselorObj)}>
                          View Articles
                        </button>
                        <button
                          className={`${primaryBtn} w-full sm:w-auto disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_12px_24px_rgba(14,74,55,0.26)]`}
                          disabled={isRequestDisabled}
                          onClick={() => requestCounselor(counselorObj._id)}
                        >
                          {getButtonLabel(requestStatus)}
                        </button>
                      </div>
                      {requestStatus === "PENDING" && <p className={`${mutedText} mt-2 text-center sm:text-right`}>Request already pending.</p>}
                      {requestStatus === "ACCEPTED" && <p className={`${mutedText} mt-2 text-center sm:text-right`}>You are already connected with this counsellor.</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {counselors.length === 0 && <p className={emptyStateClass}>No counselors available yet.</p>}
        </div>
      </section>

      {selectedCounselor && (
        <div className="fixed inset-0 z-[80] bg-[#10281F]/55 backdrop-blur-sm px-4 py-6 sm:py-10 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="max-w-4xl mx-auto rounded-lg border border-[#DDE7D8] bg-[#FFFDF7] shadow-[0_28px_70px_rgba(16,40,31,0.28)] overflow-hidden">
            <div className="bg-[linear-gradient(120deg,#EDF4E8,#FFFDF7)] border-b border-[#DDE7D8] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className={tagClass}>Counselor Articles</p>
                  <h2 className={`${headingClass} mt-2`}>{getCounselorName(selectedCounselor)}</h2>
                  <p className={`${mutedText} mt-2`}>Articles published by this counselor only.</p>
                </div>
                <button className="rounded-lg border border-[#9CB9A7] bg-[#FFFDF7] px-4 py-2 text-sm font-bold text-[#123F31] hover:bg-[#EDF4E8] transition" onClick={() => setSelectedCounselor(null)}>
                  Close
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {selectedCounselorArticles.length === 0 && (
                <p className="rounded-lg border border-dashed border-[#C7D7C3] bg-[#F7F8F1] p-7 text-center text-sm font-semibold text-[#65756D]">
                  No articles published by this counselor yet.
                </p>
              )}

              {selectedCounselorArticles.map((articleObj) => (
                <article key={articleObj._id} className="rounded-lg border border-[#DDE7D8] bg-[#FFFDF7] p-5 sm:p-6 shadow-[0_12px_28px_rgba(24,76,56,0.08)]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F7A58]">{articleObj.category}</p>
                      <h3 className="mt-2 text-xl font-semibold text-[#123F31] [font-family:Georgia,serif]">{articleObj.title}</h3>
                    </div>
                    <p className="text-xs font-semibold text-[#65756D]">{formatArticleDate(articleObj.createdAt)}</p>
                  </div>
                  <p className={`${bodyText} mt-4 whitespace-pre-wrap`}>{articleObj.content}</p>
                  <p className={`${mutedText} mt-5`}>By {getCounselorName(articleObj.counselor || selectedCounselor)}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Counselors;
