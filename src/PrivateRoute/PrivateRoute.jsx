import { Navigate } from "react-router-dom";
import { useAuth } from "../main";
import Loader from "../components/Loader";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader></Loader>;
  if (!user) return <Navigate to="/login-admin" replace />;

  return children;
}
