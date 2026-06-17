import { NavLink } from "react-router";
import { useAuth } from "../store/authStore";
import {
  navbarClass,
  navContainerClass,
  navBrandClass,
  navLinksClass,
  navLinkClass,
  navLinkActiveClass,
} from "../styles/common";
import logoIcon from "../assets/mano-saathi-logo.png";

function Header() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const user = useAuth((state) => state.currentUser);

  const getProfilePath = () => {
    if (!user) return "/";

    switch (user.role) {
      case "COUNSELOR":
        return "/counselor-profile";
      case "ADMIN":
        return "/admin-profile";
      default:
        return "/student-profile";
    }
  };

  const linkState = ({ isActive }) => (isActive ? navLinkActiveClass : navLinkClass);
  const utilityLink =
    "text-sm font-extrabold rounded-lg border border-[#9CB9A7] px-4 py-2 text-[#123F31] hover:bg-[#EDF4E8] hover:border-[#1F7A58] transition";
  const primaryUtilityLink =
    "text-sm font-extrabold rounded-lg bg-[#0E4A37] px-5 py-2.5 text-white shadow-[0_12px_24px_rgba(14,74,55,0.24)] hover:bg-[#166044] transition";

  return (
    <nav className={navbarClass}>
      <div className={navContainerClass}>
        <NavLink
          to="/"
          className={`${navBrandClass} flex items-center gap-3`}
        >
       <img
  src={logoIcon}
  alt="Mano Saathi logo"
  className="h-14 sm:h-16 w-auto object-contain rounded-full border-4 border-green-600 drop-shadow-[0_6px_12px_rgba(24,76,56,0.18)]"
/>


          <span className="leading-tight">
            Mano Saathi
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#1F7A58]">
              Student Wellness
            </span>
          </span>
        </NavLink>

        <ul className={navLinksClass}>
          <li>
            <NavLink
              to="/"
              end
              className={linkState}
            >
              Home
            </NavLink>
          </li>

          <li>
            <a href="/#community" className={navLinkClass}>
              Community
            </a>
          </li>

          <li>
            <a href="/#wellness" className={navLinkClass}>
              Wellness
            </a>
          </li>

          <li>
            <a href="/#counselors" className={navLinkClass}>
              Counselors
            </a>
          </li>

          {!isAuthenticated && (
            <>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive ? `${primaryUtilityLink} ring-2 ring-[#BFD8C4]` : primaryUtilityLink
                  }
                >
                  Register
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? `${utilityLink} bg-[#EDF4E8] border-[#1F7A58]` : utilityLink
                  }
                >
                  Login
                </NavLink>
              </li>
            </>
          )}

          {isAuthenticated && (
            <>
              <li>
                <NavLink
                  to={getProfilePath()}
                  className={linkState}
                >
                  Profile
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/notifications"
                  className={linkState}
                >
                  Notifications
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Header;
