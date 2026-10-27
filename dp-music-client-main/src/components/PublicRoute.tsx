import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useUserStore } from "../hooks/useUserStore";

export const PublicRoute = observer(
  ({ children }: { children: ReactElement }) => {
    const { user } = useUserStore();
    const isAuthenticated = Boolean(user?.id);

    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return children;
  }
);
