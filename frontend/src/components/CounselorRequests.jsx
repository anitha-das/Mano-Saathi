import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { cardClass, headingClass, mutedText, bodyText, successBtn, dangerBtn, emptyStateClass } from "../styles/common";

function CounselorRequests() {
  const [requests, setRequests] = useState([]);

  const getRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/counselor-api/chat-requests`, { withCredentials: true });
      setRequests(res.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load requests");
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  const updateRequest = async (requestId, status) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/counselor-api/chat-requests`, { requestId, status }, { withCredentials: true });
      setRequests(requests.map((request) => (request._id === requestId ? res.data.payload.request : request)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update request");
    }
  };

  return (
    <div>
      <h2 className={headingClass}>Private Support Requests</h2>
      <div className="space-y-4 mt-5">
        {requests.map((requestObj) => (
          <div key={requestObj._id} className={cardClass}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#3C5A78]">{requestObj.student?.firstName} {requestObj.student?.lastName}</h3>
                <p className={mutedText}>{requestObj.status}</p>
                <p className={`${bodyText} mt-2`}>{requestObj.message}</p>
              </div>
              {requestObj.status === "PENDING" && (
                <div className="flex gap-2">
                  <button className={successBtn} onClick={() => updateRequest(requestObj._id, "ACCEPTED")}>Accept</button>
                  <button className={dangerBtn} onClick={() => updateRequest(requestObj._id, "REJECTED")}>Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {requests.length === 0 && <p className={emptyStateClass}>No requests yet.</p>}
      </div>
    </div>
  );
}

export default CounselorRequests;

