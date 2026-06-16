import { NavLink, Outlet } from "react-router";
import ProfileHeader from "./ProfileHeader";
import { pageWrapper, tabWrap, activeTab, idleTab, divider } from "../styles/common";

function StudentProfile() {
  return (
    <div className={pageWrapper}>
      <ProfileHeader subtitle="Your calm wellness space" />

      <div className={tabWrap}>
        <NavLink to="dashboard" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Dashboard</NavLink>
        <NavLink to="community" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Community</NavLink>
        <NavLink to="counselors" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Counselors</NavLink>
        <NavLink to="meditation" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Meditation</NavLink>
        <NavLink to="chats" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Chats</NavLink>
      </div>

      <div className={divider}></div>
      <Outlet />
    </div>
  );
}

export default StudentProfile;

