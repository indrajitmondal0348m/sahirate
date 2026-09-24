import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { getStoredUser } from "./services/api";

// Layouts
import AppLayout from "./layouts/AppLayout";
import RecyclerLayout from "./layouts/RecyclerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Recycler Pages
import RecyclerHome from "./pages/recycler/Home";
import IncomingLots from "./pages/recycler/IncomingLots";
import LotDetails from "./pages/recycler/LotDetails";
import VerifyLot from "./pages/recycler/VerifyLot";
import HandoverDetails from "./pages/recycler/HandoverDetails";
import RecyclerTransactions from "./pages/recycler/Transactions";
import RecyclerTransactionDetail from "./pages/recycler/TransactionDetail";

// Admin Pages
import AdminHome from "./pages/admin/Home";
import AdminTransactions from "./pages/admin/Transactions";
import AdminTransactionDetail from "./pages/admin/TransactionDetail";
import AdminVerification from "./pages/admin/Verification";
import AdminAlerts from "./pages/admin/Alerts";
import AdminAudit from "./pages/admin/Audit";
import AdminDatasets from "./pages/admin/Datasets";

function RootRedirect() {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === "ADMIN" ? "/admin" : "/recycler"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Root Redirect - strictly checks authentication */}
        <Route index element={<RootRedirect />} />

        {/* Authentication Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected Recycler Routes */}
        <Route
          path="recycler"
          element={
            <ProtectedRoute requiredRole="RECYCLER">
              <RecyclerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RecyclerHome />} />
          <Route path="lots" element={<IncomingLots />} />
          <Route path="transactions" element={<RecyclerTransactions />} />
        </Route>

        {/* Recycler Standalone screens (Protected) */}
        <Route
          path="recycler/lot/:id"
          element={
            <ProtectedRoute requiredRole="RECYCLER">
              <LotDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="recycler/lots/:id"
          element={
            <ProtectedRoute requiredRole="RECYCLER">
              <LotDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="recycler/lot/:id/verify"
          element={
            <ProtectedRoute requiredRole="RECYCLER">
              <VerifyLot />
            </ProtectedRoute>
          }
        />
        <Route
          path="recycler/lots/:id/verify"
          element={
            <ProtectedRoute requiredRole="RECYCLER">
              <VerifyLot />
            </ProtectedRoute>
          }
        />
        <Route
          path="recycler/handover/:id"
          element={
            <ProtectedRoute requiredRole="RECYCLER">
              <HandoverDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="recycler/transactions/:id"
          element={
            <ProtectedRoute requiredRole="RECYCLER">
              <RecyclerTransactionDetail />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="transactions/:id" element={<AdminTransactionDetail />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="datasets" element={<AdminDatasets />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Route>
    </Routes>
  );
}
