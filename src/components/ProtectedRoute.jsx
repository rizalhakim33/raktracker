import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "../hooks/useAuth.js";
import { SkeletonBlock } from "./Skeleton.jsx";

export default function ProtectedRoute() {
  const { user, loading, admin } = useAuthState();

  if (loading) return (
    <div className="max-w-md mx-auto space-y-4 pt-8">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-32 w-full" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (!admin) return <Navigate to="/scan" replace />;

  return <Outlet />;
}
