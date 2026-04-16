import type { QuizDetail, QuizSummary } from "../../features/quiz/types";
import type { ApiResponse } from "../../types/api";
import { apiClient } from "./client";

export async function getQuizzes() {
  const response = await apiClient.get<ApiResponse<QuizSummary[]>>("/quizzes");
  return response.data;
}

export async function getQuizById(id: string) {
  const response = await apiClient.get<ApiResponse<QuizDetail>>(
    `/quizzes/${id}`,
  );
  return response.data;
}
