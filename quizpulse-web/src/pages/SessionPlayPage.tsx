import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SectionHeader } from "../components/SectionHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useToastStore } from "../components/toastStore";
import { useAuthStore } from "../features/auth/store";
import { useQuizStore } from "../features/quiz/store";
import type { QuizQuestionPreview } from "../features/quiz/types";
import type { SubmitAnswerResult } from "../features/session/types";
import { useSessionStore } from "../features/session/store";
import { submitSessionAnswer } from "../lib/api";
import type { SessionSocketEvent } from "../lib/ws/sessionSocket";
import { useSessionWebSocket } from "../lib/ws/useSessionWebSocket";
import { getApiErrorMessage } from "../types/api";

function getAnswerErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 403) {
      return "You are not a participant in this session.";
    }
    if (status === 409) {
      return "You already submitted an answer for this question.";
    }
    if (status === 401) {
      return "Your session expired. Login again and rejoin the session.";
    }

    const backendError = (
      error.response?.data as { error?: unknown } | undefined
    )?.error;
    const backendMessage =
      typeof backendError === "string"
        ? backendError
        : (backendError as { message?: string } | undefined)?.message;
    if (backendMessage) {
      return backendMessage;
    }
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Could not submit answer. Please try again.";
}

function findNextQuestionIndex(
  questions: QuizQuestionPreview[],
  submittedQuestionIds: Record<string, true>,
) {
  const nextIndex = questions.findIndex(
    (question) => !submittedQuestionIds[question.id],
  );
  return nextIndex >= 0 ? nextIndex : questions.length;
}

export function SessionPlayPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const authMode = useAuthStore((state) => state.authMode);
  const currentUser = useAuthStore((state) => state.currentUser);
  const currentSession = useSessionStore((state) => state.currentSession);
  const isSessionLoading = useSessionStore((state) => state.isLoading);
  const selectedQuiz = useQuizStore((state) => state.selectedQuiz);
  const isQuizLoading = useQuizStore((state) => state.isLoadingDetail);
  const quizLoadError = useQuizStore((state) => state.detailError);
  const addToast = useToastStore((state) => state.addToast);

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [questionFeedback, setQuestionFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<
    Record<string, true>
  >({});
  const [isCompleted, setIsCompleted] = useState(false);

  const isParticipant = useMemo(() => {
    if (!currentUser || !currentSession) {
      return false;
    }
    return currentSession.participants.some(
      (participant) => participant.userId === currentUser.id,
    );
  }, [currentSession, currentUser]);

  const quizQuestions = useMemo(
    () => selectedQuiz?.questions ?? [],
    [selectedQuiz?.questions],
  );
  const currentQuestionIndex = useMemo(
    () => findNextQuestionIndex(quizQuestions, submittedQuestionIds),
    [quizQuestions, submittedQuestionIds],
  );
  const displayedQuestion =
    currentQuestionIndex < quizQuestions.length
      ? quizQuestions[currentQuestionIndex]
      : null;
  const isSessionActive = currentSession?.status === "ACTIVE";
  const completedState = isCompleted || currentSession?.status === "COMPLETED";
  const hasSubmittedCurrentQuestion = Boolean(
    displayedQuestion && submittedQuestionIds[displayedQuestion.id],
  );

  const wsEnabled = Boolean(
    id && authMode === "user" && isParticipant && !completedState,
  );

  const socketStatus = useSessionWebSocket(id, wsEnabled, {
    onEvent: (event: SessionSocketEvent) => {
      if (!id) {
        return;
      }

      if (event.event === "quiz:end") {
        setIsCompleted(true);
        setQuestionFeedback("Quiz completed. Great run!");
      }

      if (event.event === "quiz:start") {
        setQuestionFeedback("Quiz started. Submit your answers.");
        void useSessionStore.getState().fetchSession(id);
      }

      if (event.event === "score:update") {
        setQuestionFeedback("Score updated.");
      }

      if (event.event === "player:joined" || event.event === "player:left") {
        void useSessionStore.getState().fetchSession(id);
      }
    },
  });

  useEffect(() => {
    if (!id || authMode !== "user") {
      return;
    }

    void useSessionStore.getState().fetchSession(id);
  }, [id, authMode]);

  useEffect(() => {
    if (!id || authMode !== "user") {
      return;
    }

    const intervalMs = socketStatus === "connected" ? 20000 : 10000;
    const interval = window.setInterval(() => {
      void useSessionStore.getState().fetchSession(id);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [id, authMode, socketStatus]);

  useEffect(() => {
    const quizId = currentSession?.quizId;
    if (!quizId) {
      return;
    }

    void useQuizStore.getState().fetchQuizById(quizId);
  }, [currentSession?.quizId]);

  async function handleSubmitAnswer() {
    if (!id || !displayedQuestion || selectedOptionIndex === null) {
      return;
    }

    if (hasSubmittedCurrentQuestion) {
      setSubmitError("You already submitted an answer for this question.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await submitSessionAnswer(id, {
        questionId: displayedQuestion.id,
        chosenIndex: selectedOptionIndex,
      });

      if (response.error || !response.data) {
        const message = getApiErrorMessage(
          response.error,
          "Could not submit answer.",
        );
        setSubmitError(message);
        addToast(message, "error");
        setIsSubmitting(false);
        return;
      }

      const result = response.data as SubmitAnswerResult;
      setSubmittedQuestionIds((state) => ({
        ...state,
        [displayedQuestion.id]: true,
      }));
      setQuestionFeedback(
        result.isCorrect == null
          ? "Answer submitted."
          : result.isCorrect
            ? "Correct answer submitted."
            : "Answer submitted.",
      );
      setSelectedOptionIndex(null);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      const message = getAnswerErrorMessage(error);
      setSubmitError(message);
      addToast(message, "error");
    }
  }

  if (!id) {
    return (
      <div className="empty-state">
        <p>Missing session id.</p>
      </div>
    );
  }

  if (authMode !== "user") {
    return (
      <div className="empty-state">
        <p>Quiz play requires a user account.</p>
        <p>Guest tokens are not allowed for answer submission.</p>
      </div>
    );
  }

  if ((isSessionLoading && !currentSession) || isQuizLoading) {
    return (
      <div className="panel">
        <div className="skeleton-row" />
        <div className="skeleton-row" />
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <div className="empty-state">
        <p>You are not part of this session.</p>
        <button type="button" onClick={() => navigate("/")}>
          Back Home
        </button>
      </div>
    );
  }

  return (
    <section>
      <SectionHeader
        title="Active Quiz Play"
        subtitle="Answer each question before time runs out."
      />

      <div className="inline-meta">
        <StatusBadge label={`WS: ${socketStatus}`} />
        <StatusBadge
          label={`Session: ${currentSession?.status ?? "unknown"}`}
        />
        <StatusBadge
          label={`Progress: ${Math.min(currentQuestionIndex + 1, quizQuestions.length)} / ${quizQuestions.length || "-"}`}
          tone="success"
        />
      </div>

      {completedState ? (
        <div className="empty-state">
          <p>Quiz complete. Check leaderboard for updated rankings.</p>
          <button type="button" onClick={() => navigate("/leaderboard")}>
            View Leaderboard
          </button>
        </div>
      ) : null}

      {!completedState && !isSessionActive ? (
        <div className="empty-state">
          <p>Waiting for host to start session from lobby.</p>
          <button
            type="button"
            onClick={() => void useSessionStore.getState().fetchSession(id)}
          >
            Refresh
          </button>
        </div>
      ) : null}

      {!completedState && isSessionActive && quizLoadError ? (
        <div className="empty-state">
          <p>{quizLoadError}</p>
          <button
            type="button"
            onClick={() => {
              if (currentSession?.quizId) {
                void useQuizStore
                  .getState()
                  .fetchQuizById(currentSession.quizId);
              }
            }}
          >
            Retry quiz load
          </button>
        </div>
      ) : null}

      {!completedState &&
      isSessionActive &&
      !quizLoadError &&
      !displayedQuestion &&
      quizQuestions.length > 0 ? (
        <div className="empty-state">
          <p>You have submitted all questions. Waiting for other players.</p>
        </div>
      ) : null}

      {!completedState && isSessionActive && displayedQuestion ? (
        <div className="panel">
          <h3>{displayedQuestion.text}</h3>
          <div className="option-list">
            {(displayedQuestion.options ?? []).map((option, optionIndex) => (
              <button
                type="button"
                key={`${displayedQuestion.id}-${optionIndex}`}
                className={
                  selectedOptionIndex === optionIndex
                    ? "option-button selected"
                    : "option-button"
                }
                onClick={() => setSelectedOptionIndex(optionIndex)}
                disabled={hasSubmittedCurrentQuestion || isSubmitting}
              >
                {option}
              </button>
            ))}
          </div>

          {questionFeedback ? (
            <p className="feedback-success">{questionFeedback}</p>
          ) : null}
          {submitError ? <p className="feedback-error">{submitError}</p> : null}

          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={
              selectedOptionIndex === null ||
              hasSubmittedCurrentQuestion ||
              isSubmitting
            }
          >
            {isSubmitting
              ? "Submitting..."
              : hasSubmittedCurrentQuestion
                ? "Answer Submitted"
                : "Submit Answer"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
