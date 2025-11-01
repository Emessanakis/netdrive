import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import Login from "../Login/Login";
import Dashboard from "../Dashboard/Dashboard";
import Privacy from "../Privacy/Privacy";
import Terms from "../Terms/Terms";
import Loader from "../Loader/Loader";

export default function CoreRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen loading={true} />;
  }

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={user || isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={user || isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/" element={<Navigate to={user || isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}