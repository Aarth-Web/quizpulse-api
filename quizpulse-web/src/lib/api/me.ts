import type { UpdateMeRequest, UserProfile } from "../../features/auth/types";
import type { ApiResponse } from "../../types/api";
import { apiClient } from "./client";

export async function getMe() {
  const response = await apiClient.get<ApiResponse<UserProfile>>("/me");
  return response.data;
}

export async function updateMe(payload: UpdateMeRequest) {
  const response = await apiClient.put<ApiResponse<UserProfile>>(
    "/me",
    payload,
    {
      notifySuccessMessage: "Profile updated.",
    },
  );
  return response.data;
}
