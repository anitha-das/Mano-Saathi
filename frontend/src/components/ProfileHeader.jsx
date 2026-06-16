import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { dangerBtn, panelClass } from "../styles/common";

function ProfileHeader({ title, subtitle }) {
  const currentUser = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  //call this function on logout
  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`${panelClass} mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5`}>
      <div className="flex items-center gap-4">
        {currentUser?.profileImageUrl ? (
          <img src={currentUser.profileImageUrl} className="w-16 h-16 rounded-full object-cover border border-[#DDE7D8] shadow-[0_10px_24px_rgba(24,76,56,0.08)]" alt="profile" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#EDF4E8] text-[#214F3F] flex items-center justify-center text-xl font-semibold shadow-[0_10px_24px_rgba(24,76,56,0.06)]">
            {currentUser?.firstName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm text-[#6E725F]">{subtitle || "Welcome back"}</p>
          <h2 className="text-xl font-semibold text-[#123F31]">{title || currentUser?.firstName}</h2>
          <p className="text-xs text-[#8A866F] mt-1">{currentUser?.role}</p>
        </div>
      </div>

      <button className={dangerBtn} onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default ProfileHeader;

