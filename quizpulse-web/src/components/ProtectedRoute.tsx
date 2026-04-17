import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/store";

export function PublicOnlyRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUser = useAuthStore((state) => state.currentUser);
  const authMode = useAuthStore((state) => state.authMode);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return <p>Checking session...</p>;
  }

  if (accessToken && (authMode === "guest" || currentUser)) {
    return (
      <Navigate to={authMode === "user" ? "/profile" : "/quizzes"} replace />
    );
  }

  return <Outlet />;
}

export function GuestOrUserRoute() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authMode = useAuthStore((state) => state.authMode);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return <p>Checking session...</p>;
  }

  if (!accessToken || !authMode) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ redirectTo: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}

export function UserOnlyRoute() {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authMode = useAuthStore((state) => state.authMode);
  const currentUser = useAuthStore((state) => state.currentUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return <p>Checking session...</p>;
  }

  if (!accessToken || !currentUser || authMode !== "user") {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ redirectTo: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}
