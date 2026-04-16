import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastViewport } from "../components/ToastViewport";
import { useAuthStore } from "../features/auth/store";
import { refreshAuth, setupApiInterceptors } from "../lib/api";
import { AppRouter } from "./router";

export function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const authMode = useAuthStore((state) => state.authMode);
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setupApiInterceptors({
      getTokens: () => {
        const state = useAuthStore.getState();
        return {
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          authMode: state.authMode ?? "guest",
        };
      },
      refreshUserTokens: async (currentRefreshToken) => {
        const result = await refreshAuth({ refreshToken: currentRefreshToken });
        if (result.error || !result.data?.accessToken) {
          return null;
        }
        return {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        };
      },
      onRefreshSuccess: (tokens) => {
        setTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? refreshToken,
          authMode: "user",
        });
      },
      onLogout: () => {
        logout();
      },
    });
  }, [logout, refreshToken, setTokens]);

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (!token || currentUser) {
      return;
    }

    void fetchCurrentUser().then((result) => {
      if (!result.ok && authMode === "user" && refreshToken) {
        logout();
      }
    });
  }, [authMode, currentUser, fetchCurrentUser, logout, refreshToken]);

  return (
    <BrowserRouter>
      <AppRouter />
      <ToastViewport />
    </BrowserRouter>
  );
}
