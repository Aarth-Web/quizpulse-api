export type QuizSummary = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard" | string;
  questionCount?: number;
};

export type QuizQuestionPreview = {
  id: string;
  text: string;
  options?: string[];
  correctIndex?: number;
  points?: number;
};

export type QuizDetail = QuizSummary & {
  questions: QuizQuestionPreview[];
};
