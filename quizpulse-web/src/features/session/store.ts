import { create } from "zustand";
import {
  createSession,
  getSessionById,
  joinSession,
  startSession,
} from "../../lib/api";
import { getApiErrorMessage } from "../../types/api";
import type { Session } from "./types";

/** Create/join responses may omit `participants`; normalize before storing. */
function normalizeSession(session: Session): Session {
  const participants = session.participants;
  return {
    ...session,
    participants: Array.isArray(participants) ? participants : [],
  };
}

type SessionState = {
  currentSession: Session | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  clearError: () => void;
  createSessionForQuiz: (
    quizId: string,
  ) => Promise<{ ok: boolean; error?: string; sessionId?: string }>;
  joinSessionByInviteCode: (
    inviteCode: string,
  ) => Promise<{ ok: boolean; error?: string; sessionId?: string }>;
  fetchSession: (sessionId: string) => Promise<{ ok: boolean; error?: string }>;
  startHostedSession: (
    sessionId: string,
  ) => Promise<{ ok: boolean; error?: string }>;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
  setSession: (session) => set({ currentSession: session }),
  clearError: () => set({ error: null }),
  createSessionForQuiz: async (quizId) => {
    set({ isActionLoading: true, error: null });
    try {
      const result = await createSession({ quizId });
      if (result.error || !result.data) {
        const message = getApiErrorMessage(
          result.error,
          "Unable to create session.",
        );
        set({ isActionLoading: false, error: message });
        return { ok: false, error: message };
      }

      set({
        isActionLoading: false,
        currentSession: normalizeSession(result.data),
      });
      return { ok: true, sessionId: result.data.id };
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create session.");
      set({ isActionLoading: false, error: message });
      return { ok: false, error: message };
    }
  },
  joinSessionByInviteCode: async (inviteCode) => {
    set({ isActionLoading: true, error: null });
    try {
      const result = await joinSession({ inviteCode });
      if (result.error || !result.data) {
        const message = getApiErrorMessage(
          result.error,
          "Unable to join session.",
        );
        set({ isActionLoading: false, error: message });
        return { ok: false, error: message };
      }

      set({
        isActionLoading: false,
        currentSession: normalizeSession(result.data),
      });
      return { ok: true, sessionId: result.data.id };
    } catch (error) {
      const message = getErrorMessage(error, "Unable to join session.");
      set({ isActionLoading: false, error: message });
      return { ok: false, error: message };
    }
  },
  fetchSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getSessionById(sessionId);
      if (result.error || !result.data) {
        const message = getApiErrorMessage(
          result.error,
          "Unable to fetch session state.",
        );
        set({ isLoading: false, currentSession: null, error: message });
        return { ok: false, error: message };
      }

      set({
        isLoading: false,
        currentSession: normalizeSession(result.data),
        error: null,
      });
      return { ok: true };
    } catch (error) {
      const message = getErrorMessage(error, "Unable to fetch session state.");
      set({ isLoading: false, currentSession: null, error: message });
      return { ok: false, error: message };
    }
  },
  startHostedSession: async (sessionId) => {
    set({ isActionLoading: true, error: null });
    try {
      const result = await startSession(sessionId);
      if (result.error || !result.data) {
        const message = getApiErrorMessage(
          result.error,
          "Unable to start session.",
        );
        set({ isActionLoading: false, error: message });
        return { ok: false, error: message };
      }

      const previous = get().currentSession;
      set({
        isActionLoading: false,
        currentSession: normalizeSession(
          previous ? { ...previous, ...result.data } : result.data,
        ),
        error: null,
      });
      return { ok: true };
    } catch (error) {
      const message = getErrorMessage(error, "Unable to start session.");
      set({ isActionLoading: false, error: message });
      return { ok: false, error: message };
    }
  },
}));
