import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./components/RootLayout";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import StudentProfile from "./components/StudentProfile";
import StudentDashboard from "./components/StudentDashboard";
import CommunityForum from "./components/CommunityForum";
import Counselors from "./components/Counselors";
import Meditation from "./components/Meditation";
import StudentChats from "./components/StudentChats";
import CounselorProfile from "./components/CounselorProfile";
import CounselorArticles from "./components/CounselorArticles";
import WriteArticle from "./components/WriteArticle";
import CounselorRequests from "./components/CounselorRequests";
import CounselorChats from "./components/CounselorChats";
import CounselorSettings from "./components/CounselorSettings";
import AdminProfile from "./components/AdminProfile";
import Notifications from "./components/Notifications";
import Unauthorized from "./components/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "", element: <Home /> },
        { path: "register", element: <Register /> },
        { path: "login", element: <Login /> },
        {
          path: "student-profile",
          element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentProfile />
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <StudentDashboard /> },
            { path: "dashboard", element: <StudentDashboard /> },
            { path: "community", element: <CommunityForum /> },
            { path: "counselors", element: <Counselors /> },
            { path: "meditation", element: <Meditation /> },
            { path: "chats", element: <StudentChats /> },
          ],
        },
        {
          path: "counselor-profile",
          element: (
            <ProtectedRoute allowedRoles={["COUNSELOR"]}>
              <CounselorProfile />
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <CounselorArticles /> },
            { path: "articles", element: <CounselorArticles /> },
            { path: "write-article", element: <WriteArticle /> },
            { path: "requests", element: <CounselorRequests /> },
            { path: "chats", element: <CounselorChats /> },
            { path: "settings", element: <CounselorSettings /> },
          ],
        },
        {
          path: "admin-profile",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          ),
        },
        {
          path: "notifications",
          element: (
            <ProtectedRoute allowedRoles={["STUDENT", "COUNSELOR", "ADMIN"]}>
              <Notifications />
            </ProtectedRoute>
          ),
        },
        { path: "unauthorized", element: <Unauthorized /> },
      ],
    },
  ]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={routerObj} />
    </div>
  );
}

export default App;

