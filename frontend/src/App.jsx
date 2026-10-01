import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/guards.jsx";
import AppShell from "./components/AppShell.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import RegisterPage from "./features/auth/RegisterPage.jsx";
import DashboardPage from "./features/dashboard/DashboardPage.jsx";
import AdminPage from "./features/admin/AdminPage.jsx";
import SetupPage from "./features/setup/SetupPage.jsx";
import BillsPage from "./features/bills/BillsPage.jsx";
import ReportsPage from "./features/reports/ReportsPage.jsx";
import LandingPage from "./features/landing/LandingPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["owner", "staff"]} />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bills" element={<BillsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["owner"]} />}>
        <Route element={<AppShell />}>
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["superadmin"]} />}>
        <Route element={<AppShell />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
