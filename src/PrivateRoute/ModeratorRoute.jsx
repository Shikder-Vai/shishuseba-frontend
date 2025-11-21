import { Navigate } from "react-router-dom";
import { useAuth } from "../main";
import Loader from "../components/Loader";
import { useRole } from "../hooks/useRole";

export default function ModeratorRoute({ children }) {
  const { user, loading } = useAuth();
  const role = useRole();

  if (loading) return <Loader></Loader>;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin" && role !== "moderator") return <Navigate to="/access-denied" replace />;

  return children;
}
