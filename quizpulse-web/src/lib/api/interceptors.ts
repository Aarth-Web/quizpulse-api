import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { notifyError, notifySuccess } from "../notify";
import { apiClient } from "./client";

type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
  authMode: "guest" | "user";
};

type RefreshResult = {
  accessToken: string;
  refreshToken?: string;
};

type InterceptorOptions = {
  getTokens: () => Tokens;
  refreshUserTokens: (refreshToken: string) => Promise<RefreshResult | null>;
  onRefreshSuccess: (tokens: RefreshResult) => void;
  onLogout: () => void;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let initialized = false;

export function setupApiInterceptors(options: InterceptorOptions) {
  if (initialized) {
    return;
  }

  initialized = true;

  let pendingRefresh: Promise<RefreshResult | null> | null = null;

  apiClient.interceptors.request.use((config) => {
    const { accessToken } = options.getTokens();
    const headers = config.headers;

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      headers.delete("Authorization");
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      if (response.config.notifySuccessMessage) {
        notifySuccess(response.config.notifySuccessMessage);
      }
      return response;
    },
    async (error: AxiosError) => {
      const request = error.config as RetriableRequestConfig | undefined;
      const backendError = (
        error.response?.data as { error?: unknown } | undefined
      )?.error;
      const backendMessage =
        typeof backendError === "string"
          ? backendError
          : (backendError as { message?: string } | undefined)?.message;
      const fallbackMessage =
        backendMessage ?? "Request failed. Please try again.";

      if (!request || request._retry || error.response?.status !== 401) {
        if (!request?.skipGlobalErrorToast) {
          notifyError(fallbackMessage);
        }
        return Promise.reject(error);
      }

      const { authMode, refreshToken } = options.getTokens();
      if (authMode !== "user" || !refreshToken) {
        if (!request.skipGlobalErrorToast) {
          notifyError("Login required to continue.");
        }
        return Promise.reject(error);
      }

      request._retry = true;

      if (!pendingRefresh) {
        pendingRefresh = options
          .refreshUserTokens(refreshToken)
          .then((tokens) => {
            if (!tokens?.accessToken) {
              options.onLogout();
              return null;
            }

            options.onRefreshSuccess(tokens);
            return tokens;
          })
          .catch(() => {
            options.onLogout();
            return null;
          })
          .finally(() => {
            pendingRefresh = null;
          });
      }

      const refreshed = await pendingRefresh;
      if (!refreshed) {
        if (!request.skipGlobalErrorToast) {
          notifyError("Session expired. Please login again.");
        }
        return Promise.reject(error);
      }

      request.headers.set("Authorization", `Bearer ${refreshed.accessToken}`);
      return apiClient(request);
    },
  );
}
