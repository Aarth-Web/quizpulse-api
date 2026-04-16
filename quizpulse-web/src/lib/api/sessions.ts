import type {
  CreateSessionRequest,
  JoinSessionRequest,
  Session,
  SubmitAnswerRequest,
  SubmitAnswerResult,
} from "../../features/session/types";
import type { ApiResponse } from "../../types/api";
import { apiClient } from "./client";

export async function createSession(payload: CreateSessionRequest) {
  const response = await apiClient.post<ApiResponse<Session>>(
    "/sessions",
    payload,
    {
      notifySuccessMessage: "Session created successfully.",
    },
  );
  return response.data;
}

export async function joinSession(payload: JoinSessionRequest) {
  const response = await apiClient.post<ApiResponse<Session>>(
    "/sessions/join",
    payload,
    {
      notifySuccessMessage: "Joined session successfully.",
    },
  );
  return response.data;
}

export async function getSessionById(sessionId: string) {
  const response = await apiClient.get<ApiResponse<Session>>(
    `/sessions/${sessionId}`,
  );
  return response.data;
}

export async function startSession(sessionId: string) {
  const response = await apiClient.post<ApiResponse<Session>>(
    `/sessions/${sessionId}/start`,
    {},
    {
      notifySuccessMessage: "Session started.",
      headers: {
        Accept: "application/json",
      },
    },
  );
  return response.data;
}

export async function submitSessionAnswer(
  sessionId: string,
  payload: SubmitAnswerRequest,
) {
  const response = await apiClient.post<ApiResponse<SubmitAnswerResult>>(
    `/sessions/${sessionId}/answers`,
    payload,
    { notifySuccessMessage: "Answer submitted." },
  );
  return response.data;
}
