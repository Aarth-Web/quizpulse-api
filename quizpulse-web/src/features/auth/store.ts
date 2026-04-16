import { create } from "zustand";
import {
  guestAuth,
  loginAuth,
  refreshAuth,
  registerAuth,
} from "../../lib/api/auth";
import { getMe } from "../../lib/api/me";
import { getApiErrorMessage } from "../../types/api";
import type {
  AuthMode,
  GuestAuthRequest,
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from "./types";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: UserProfile | null;
  authMode: AuthMode | null;
  isHydrated: boolean;
  setCurrentUser: (user: UserProfile | null) => void;
  setTokens: (payload: {
    accessToken: string;
    refreshToken?: string | null;
    authMode: AuthMode;
  }) => void;
  register: (
    payload: RegisterRequest,
  ) => Promise<{ ok: boolean; error?: string }>;
  login: (payload: LoginRequest) => Promise<{ ok: boolean; error?: string }>;
  loginGuest: (
    payload?: GuestAuthRequest,
  ) => Promise<{ ok: boolean; error?: string }>;
  fetchCurrentUser: () => Promise<{ ok: boolean; error?: string }>;
  refreshUserSession: () => Promise<boolean>;
  logout: () => void;
  hydrate: () => void;
};

type PersistedAuthState = Pick<
  AuthState,
  "accessToken" | "refreshToken" | "currentUser" | "authMode"
>;

const AUTH_STORAGE_KEY = "quizpulse.auth";

function normalizeUserProfile(user: UserProfile): UserProfile {
  const candidate = user as UserProfile & {
    username?: string;
    fullName?: string;
  };

  return {
    ...user,
    name: user.name ?? candidate.username ?? candidate.fullName ?? "User",
  };
}

function parseErrorMessage(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
}

function saveAuthState(state: PersistedAuthState) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function loadAuthState(): PersistedAuthState | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedAuthState;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function clearAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  currentUser: null,
  authMode: null,
  isHydrated: false,
  setCurrentUser: (user) => {
    const normalizedUser = user ? normalizeUserProfile(user) : null;
    set({ currentUser: normalizedUser });
    const state = get();
    saveAuthState({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      currentUser: normalizedUser,
      authMode: state.authMode,
    });
  },
  setTokens: ({ accessToken, refreshToken, authMode }) => {
    set({
      accessToken,
      refreshToken: authMode === "user" ? (refreshToken ?? null) : null,
      authMode,
    });

    const state = get();
    saveAuthState({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      currentUser: state.currentUser,
      authMode: state.authMode,
    });
  },
  register: async (payload) => {
    try {
      const result = await registerAuth(payload);
      if (result.error || !result.data) {
        return {
          ok: false,
          error: getApiErrorMessage(result.error, "Registration failed."),
        };
      }

      get().setTokens({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        authMode: "user",
      });
      if (result.data.user) {
        get().setCurrentUser(result.data.user);
      } else {
        const meResult = await get().fetchCurrentUser();
        if (!meResult.ok) {
          return {
            ok: false,
            error:
              meResult.error ??
              "Registration succeeded but profile fetch failed.",
          };
        }
      }
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: parseErrorMessage(error, "Registration failed."),
      };
    }
  },
  login: async (payload) => {
    try {
      const result = await loginAuth(payload);
      if (result.error || !result.data) {
        return {
          ok: false,
          error: getApiErrorMessage(result.error, "Login failed."),
        };
      }

      get().setTokens({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        authMode: "user",
      });
      if (result.data.user) {
        get().setCurrentUser(result.data.user);
      } else {
        const meResult = await get().fetchCurrentUser();
        if (!meResult.ok) {
          return {
            ok: false,
            error:
              meResult.error ?? "Login succeeded but profile fetch failed.",
          };
        }
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, error: parseErrorMessage(error, "Login failed.") };
    }
  },
  loginGuest: async (payload = {}) => {
    try {
      const result = await guestAuth(payload);
      if (result.error || !result.data) {
        return {
          ok: false,
          error: getApiErrorMessage(result.error, "Guest login failed."),
        };
      }

      get().setTokens({
        accessToken: result.data.accessToken,
        authMode: "guest",
      });
      if (result.data.user) {
        get().setCurrentUser(result.data.user);
      } else {
        const meResult = await get().fetchCurrentUser();
        if (!meResult.ok) {
          return {
            ok: false,
            error:
              meResult.error ??
              "Guest login succeeded but profile fetch failed.",
          };
        }
      }
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: parseErrorMessage(error, "Guest login failed."),
      };
    }
  },
  fetchCurrentUser: async () => {
    try {
      const result = await getMe();
      if (result.error || !result.data) {
        return {
          ok: false,
          error: getApiErrorMessage(result.error, "Unable to load profile."),
        };
      }

      get().setCurrentUser(normalizeUserProfile(result.data));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: parseErrorMessage(error, "Unable to load profile."),
      };
    }
  },
  refreshUserSession: async () => {
    const { refreshToken, authMode } = get();
    if (!refreshToken || authMode !== "user") {
      return false;
    }

    try {
      const result = await refreshAuth({ refreshToken });
      if (result.error || !result.data?.accessToken) {
        return false;
      }

      get().setTokens({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken ?? refreshToken,
        authMode: "user",
      });
      return true;
    } catch {
      return false;
    }
  },
  logout: () => {
    clearAuthState();
    set({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      authMode: null,
    });
  },
  hydrate: () => {
    if (get().isHydrated) {
      return;
    }

    const persisted = loadAuthState();
    if (persisted) {
      set({
        accessToken: persisted.accessToken,
        refreshToken: persisted.refreshToken,
        currentUser: persisted.currentUser,
        authMode: persisted.authMode,
      });
    }

    set({ isHydrated: true });
  },
}));
