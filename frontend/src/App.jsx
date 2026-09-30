import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/guards.jsx";
import AppShell from "./components/AppShell.jsx";
import ComingSoon from "./components/ComingSoon.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import RegisterPage from "./features/auth/RegisterPage.jsx";
import DashboardPage from "./features/dashboard/DashboardPage.jsx";
import AdminPage from "./features/admin/AdminPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["owner", "staff"]} />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bills" element={<ComingSoon title="Bills" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["owner"]} />}>
        <Route element={<AppShell />}>
          <Route path="/reports" element={<ComingSoon title="Reports" />} />
          <Route path="/setup" element={<ComingSoon title="Setup" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["superadmin"]} />}>
        <Route element={<AppShell />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
