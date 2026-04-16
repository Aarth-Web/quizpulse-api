import type {
  AuthTokenPayload,
  GuestAuthRequest,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  UserProfile,
} from "../../features/auth/types";
import type { ApiResponse } from "../../types/api";
import { apiClient } from "./client";

type AuthResult = AuthTokenPayload & {
  user?: UserProfile;
};

export async function registerAuth(payload: RegisterRequest) {
  const response = await apiClient.post<ApiResponse<AuthResult>>(
    "/auth/register",
    payload,
    {
      notifySuccessMessage: "Account created successfully.",
    },
  );
  return response.data;
}

export async function loginAuth(payload: LoginRequest) {
  const response = await apiClient.post<ApiResponse<AuthResult>>(
    "/auth/login",
    payload,
    {
      notifySuccessMessage: "Logged in successfully.",
    },
  );
  return response.data;
}

export async function refreshAuth(payload: RefreshRequest) {
  const response = await apiClient.post<ApiResponse<AuthTokenPayload>>(
    "/auth/refresh",
    payload,
    {
      skipGlobalErrorToast: true,
    },
  );
  return response.data;
}

export async function guestAuth(payload: GuestAuthRequest = {}) {
  const response = await apiClient.post<ApiResponse<AuthResult>>(
    "/auth/guest",
    payload,
    {
      notifySuccessMessage: "Guest session started.",
    },
  );
  return response.data;
}
