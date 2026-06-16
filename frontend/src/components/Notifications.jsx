import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { useAuth } from "../store/authStore";
import { pageWrapper, cardClass, headingClass, bodyText, mutedText, ghostBtn, emptyStateClass, primaryBtn, secondaryBtn } from "../styles/common";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const currentUser = useAuth((state) => state.currentUser);

  const unreadNotifications = useMemo(() => notifications.filter((item) => !item.isRead), [notifications]);

  const getNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notification-api/notifications`, { withCredentials: true });
      const notificationList = res.data.payload || [];
      setNotifications(notificationList);
      setUnreadCount(res.data.unreadCount ?? notificationList.filter((item) => !item.isRead).length);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load notifications");
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const getFallbackPath = (notification) => {
    if (notification.actionPath) return notification.actionPath;

    if (notification.type === "CHAT_REQUEST") {
      return currentUser?.role === "COUNSELOR" ? "/counselor-profile/requests" : "/student-profile/chats";
    }

    if (notification.type === "COUNSELOR_REPLY") {
      return currentUser?.role === "COUNSELOR" ? "/counselor-profile/chats" : "/student-profile/chats";
    }

    if (notification.type === "COMMUNITY_ALERT") return "/student-profile/community";
    if (notification.type === "MEDITATION_REMINDER") return "/student-profile/meditation";
    if (notification.type === "REPORT_UPDATE") return currentUser?.role === "ADMIN" ? "/admin-profile" : "/";
    return "/";
  };

  const removeReadNotification = (notificationId, nextUnreadCount) => {
    setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
    setUnreadCount((prev) => Math.max(0, nextUnreadCount ?? prev - 1));
  };

  const markRead = async (notificationId) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/notification-api/notifications`, { notificationId }, { withCredentials: true });
      removeReadNotification(notificationId, res.data.unreadCount);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update notification");
    }
  };

  const viewNotification = async (notification) => {
    const destination = getFallbackPath(notification);

    try {
      if (!notification.isRead) {
        const res = await axios.patch(`${API_BASE_URL}/notification-api/notifications`, { notificationId: notification._id }, { withCredentials: true });
        removeReadNotification(notification._id, res.data.unreadCount);
      }
      navigate(destination);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to open notification");
    }
  };

  return (
    <div className={pageWrapper}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className={headingClass}>Notifications</h1>
          <p className={`${mutedText} mt-2`}>{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
        </div>
        <button className={secondaryBtn} onClick={getNotifications}>Refresh</button>
      </div>

      <div className="space-y-4 mt-6">
        {unreadNotifications.map((item) => (
          <div key={item._id} className={cardClass}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#123F31]">{item.title}</h3>
                <p className={`${bodyText} mt-1`}>{item.message}</p>
                <p className={mutedText}>{item.type}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className={primaryBtn} onClick={() => viewNotification(item)}>View</button>
                <button className={ghostBtn} onClick={() => markRead(item._id)}>Mark as Read</button>
              </div>
            </div>
          </div>
        ))}
        {unreadNotifications.length === 0 && <p className={emptyStateClass}>No unread notifications.</p>}
      </div>
    </div>
  );
}

export default Notifications;
