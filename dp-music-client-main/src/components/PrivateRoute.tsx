import { Navigate, Outlet } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useUserStore } from "../hooks/useUserStore";

export const PrivateRoute = observer(() => {
  const { user } = useUserStore();
  const isAuthenticated = Boolean(user?.id);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
});
