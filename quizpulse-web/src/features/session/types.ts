export type SessionParticipant = {
  id: string;
  userId?: string;
  sessionId?: string;
  score?: number;
  name?: string;
  isHost?: boolean;
};

export type SessionStatus = "WAITING" | "ACTIVE" | "COMPLETED" | string;

export type Session = {
  id: string;
  quizId: string;
  inviteCode: string;
  hostUserId: string;
  status: SessionStatus;
  participants: SessionParticipant[];
  currentQuestion?: SessionQuestion;
  totalQuestions?: number;
  completedAt?: string | null;
};

export type CreateSessionRequest = {
  quizId: string;
};

export type JoinSessionRequest = {
  inviteCode: string;
};

export type SessionQuestionOption = {
  id?: string;
  text?: string;
};

export type SessionQuestion = {
  id: string;
  text: string;
  options: string[];
  order?: number;
};

export type SubmitAnswerRequest = {
  questionId: string;
  chosenIndex: number;
};

export type SubmitAnswerResult = {
  isCorrect?: boolean;
  pointsAwarded?: number;
  currentScore?: number;
};
