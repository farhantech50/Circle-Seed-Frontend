import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

import { useAuthStore } from "../store/authStore";
import Layout from "../layout/Main";
import WebsiteLayout from "../website/layout/WebsiteLayout";
import PageLoader from "../components/PageLoader";
import {
  websiteRoutes,
  publicRoutes,
  protectedRoutes,
  errorRoutes,
} from "../config/routeConfig";
import ScrollToTop from "../components/ScrollToTop";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, authUser } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { isLoggedIn, authUser } = useAuthStore();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Website Routes */}
        <Route element={<WebsiteLayout />}>
          {websiteRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </Route>

        {/* Public Auth Routes */}
        {publicRoutes.map(({ path, element: Element }) => (
          <Route
            key={path}
            path={path}
            element={
              isLoggedIn && (path === "/login" || path === "/register") ? (
                <Navigate
                  to={`/dashboard/${authUser?.roleName
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  replace
                />
              ) : (
                <Element />
              )
            }
          />
        ))}

        {/* Protected ERP Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {protectedRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </Route>

        {/* Error Routes */}
        {errorRoutes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
