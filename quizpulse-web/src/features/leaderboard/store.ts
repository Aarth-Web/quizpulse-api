import { create } from "zustand";
import { getLeaderboard } from "../../lib/api";
import { getApiErrorMessage } from "../../types/api";
import type { LeaderboardEntry } from "./types";

type LeaderboardState = {
  topPlayers: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  fetchLeaderboard: () => Promise<void>;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }
  return fallback;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  topPlayers: [],
  isLoading: false,
  error: null,
  fetchLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getLeaderboard();
      if (result.error) {
        set({
          isLoading: false,
          topPlayers: [],
          error: getApiErrorMessage(
            result.error,
            "Unable to load leaderboard.",
          ),
        });
        return;
      }

      set({
        isLoading: false,
        error: null,
        topPlayers: result.data ?? [],
      });
    } catch (error) {
      set({
        isLoading: false,
        topPlayers: [],
        error: getErrorMessage(error, "Unable to load leaderboard."),
      });
    }
  },
}));
