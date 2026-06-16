import { NavLink, Outlet } from "react-router";
import ProfileHeader from "./ProfileHeader";
import { pageWrapper, tabWrap, activeTab, idleTab, divider } from "../styles/common";

function CounselorProfile() {
  return (
    <div className={pageWrapper}>
      <ProfileHeader subtitle="Professional support dashboard" />

      <div className={tabWrap}>
        <NavLink to="articles" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Articles</NavLink>
        <NavLink to="write-article" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Write Article</NavLink>
        <NavLink to="requests" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Requests</NavLink>
        <NavLink to="chats" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Chats</NavLink>
        <NavLink to="settings" className={({ isActive }) => (isActive ? activeTab : idleTab)}>Profile</NavLink>
      </div>

      <div className={divider}></div>
      <Outlet />
    </div>
  );
}

export default CounselorProfile;

