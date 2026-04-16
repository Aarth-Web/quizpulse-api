export type ApiError = {
  code?: string;
  message: string;
  details?: Record<string, string[]>;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | string | null;
  code?: string;
};

export function getApiErrorMessage(
  error: ApiError | string | null | undefined,
  fallback: string,
) {
  if (!error) {
    return fallback;
  }
  if (typeof error === "string") {
    return error;
  }
  return error.message || fallback;
}
