import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import FullPageSpinner from "../components/FullPageSpinner.jsx";
import { homePathFor } from "../utils/paths.js";

// Pages that need a logged-in user (optionally with specific roles)
export function ProtectedRoute({ roles }) {
  const { status, user, loggedOut } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageSpinner />;
  if (status !== "authenticated") {
    // Pressed logout: go to the home page. Session expired: go to login and come back after.
    if (loggedOut) return <Navigate to="/" replace />;
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }
  return <Outlet />;
}

// Login and register: logged-in users are sent to their home page instead
export function PublicOnlyRoute() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageSpinner />;
  if (status === "authenticated") {
    const from = location.state?.from?.pathname;
    return <Navigate to={from ?? homePathFor(user.role)} replace />;
  }
  return <Outlet />;
}
