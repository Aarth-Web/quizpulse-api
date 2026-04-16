import { create } from "zustand";
import { getQuizById, getQuizzes } from "../../lib/api";
import { getApiErrorMessage } from "../../types/api";
import type { QuizDetail, QuizSummary } from "./types";

type QuizState = {
  quizzes: QuizSummary[];
  selectedQuiz: QuizDetail | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  listError: string | null;
  detailError: string | null;
  fetchQuizzes: () => Promise<void>;
  fetchQuizById: (quizId: string) => Promise<void>;
};

const fallbackError = "Unable to load quizzes.";
const detailFallbackError = "Unable to load quiz details.";

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

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  selectedQuiz: null,
  isLoadingList: false,
  isLoadingDetail: false,
  listError: null,
  detailError: null,
  fetchQuizzes: async () => {
    set({ isLoadingList: true, listError: null });
    try {
      const result = await getQuizzes();
      if (result.error) {
        set({
          isLoadingList: false,
          quizzes: [],
          listError: getApiErrorMessage(result.error, fallbackError),
        });
        return;
      }

      set({
        quizzes: result.data ?? [],
        isLoadingList: false,
        listError: null,
      });
    } catch (error) {
      set({
        isLoadingList: false,
        quizzes: [],
        listError: getErrorMessage(error, fallbackError),
      });
    }
  },
  fetchQuizById: async (quizId) => {
    set({ isLoadingDetail: true, detailError: null, selectedQuiz: null });
    try {
      const result = await getQuizById(quizId);
      if (result.error || !result.data) {
        set({
          isLoadingDetail: false,
          selectedQuiz: null,
          detailError: getApiErrorMessage(result.error, detailFallbackError),
        });
        return;
      }

      set({
        selectedQuiz: result.data,
        isLoadingDetail: false,
        detailError: null,
      });
    } catch (error) {
      set({
        isLoadingDetail: false,
        selectedQuiz: null,
        detailError: getErrorMessage(error, detailFallbackError),
      });
    }
  },
}));
