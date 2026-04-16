import type { LeaderboardEntry } from "../../features/leaderboard/types";
import type { ApiResponse } from "../../types/api";
import { apiClient } from "./client";

export async function getLeaderboard() {
  const response =
    await apiClient.get<ApiResponse<LeaderboardEntry[]>>("/leaderboard");
  return response.data;
}
