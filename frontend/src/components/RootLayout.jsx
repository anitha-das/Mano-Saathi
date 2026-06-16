import Header from "./Header";
import Footer from "./Footer";
import AiSaathiWidget from "./AiSaathiWidget";
import { Outlet } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../store/authStore";

function RootLayout() {
  //import check checkAuth
  let checkAuth = useAuth((state) => state.checkAuth);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="bg-[#F7F8F1] min-h-screen">
      <Header />
      <div className="min-h-screen">
        <Outlet />
      </div>
      {isAuthenticated && <AiSaathiWidget />}
      <Footer />
    </div>
  );
}

export default RootLayout;

