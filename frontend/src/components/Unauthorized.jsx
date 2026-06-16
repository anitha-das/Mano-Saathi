import { NavLink } from "react-router";
import { pageWrapper, pageTitleClass, bodyText, primaryBtn } from "../styles/common";

function Unauthorized() {
  return (
    <div className={`${pageWrapper} text-center`}>
      <h1 className={pageTitleClass}>Access not allowed</h1>
      <p className={`${bodyText} mt-4`}>This space is protected for a different MANO-SAATHI role.</p>
      <NavLink to="/" className={`${primaryBtn} inline-block mt-8`}>
        Go Home
      </NavLink>
    </div>
  );
}

export default Unauthorized;

