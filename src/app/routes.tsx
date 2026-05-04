import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";
import ChurchSearch from "./components/pages/ChurchSearch";
import ChurchDetail from "./components/pages/ChurchDetail";
import UserDashboard from "./components/pages/UserDashboard";
import ExpertDashboard from "./components/pages/ExpertDashboard";
import AdminDashboard from "./components/pages/AdminDashboard";
import ChurchManagement from "./components/pages/ChurchManage";
import NotFound from "./components/pages/NotFound";
import { AdminRoute } from "./components/AdminRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "search", Component: ChurchSearch },
      { path: "church/:id", Component: ChurchDetail },
      { path: "dashboard", Component: UserDashboard },
      { path: "expert-dashboard", Component: ExpertDashboard },
      { path: "church-management", Component: ChurchManagement },
      { path: "admin-dashboard", Component: AdminDashboard },
      { path: "*", Component: NotFound },
    ],
  },

]);
