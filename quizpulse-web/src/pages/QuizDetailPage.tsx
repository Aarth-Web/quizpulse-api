import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SectionHeader } from "../components/SectionHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useToastStore } from "../components/toastStore";
import { useAuthStore } from "../features/auth/store";
import { useQuizStore } from "../features/quiz/store";
import { useSessionStore } from "../features/session/store";

export function QuizDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const selectedQuiz = useQuizStore((state) => state.selectedQuiz);
  const isLoadingDetail = useQuizStore((state) => state.isLoadingDetail);
  const detailError = useQuizStore((state) => state.detailError);
  const fetchQuizById = useQuizStore((state) => state.fetchQuizById);
  const authMode = useAuthStore((state) => state.authMode);
  const createSessionForQuiz = useSessionStore(
    (state) => state.createSessionForQuiz,
  );
  const isSessionActionLoading = useSessionStore(
    (state) => state.isActionLoading,
  );
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (!id) {
      return;
    }
    void fetchQuizById(id);
  }, [fetchQuizById, id]);

  if (!id) {
    return (
      <div className="empty-state">
        <p>Quiz identifier is missing.</p>
        <Link to="/quizzes" className="inline-link">
          Back to quizzes
        </Link>
      </div>
    );
  }

  async function handleCreateSession() {
    if (!id) {
      addToast("Missing quiz id for session creation.", "error");
      return;
    }

    if (authMode !== "user") {
      addToast("Only registered users can host a quiz session.", "error");
      return;
    }

    const result = await createSessionForQuiz(id);
    if (!result.ok || !result.sessionId) {
      addToast(result.error ?? "Failed to create session.", "error");
      return;
    }

    addToast("Session created. Invite players from the lobby.", "success");
    navigate(`/sessions/${result.sessionId}`);
  }

  return (
    <section>
      <SectionHeader
        title={selectedQuiz?.title ?? "Quiz details"}
        subtitle="Preview the questions before starting gameplay."
      />

      {isLoadingDetail ? (
        <div className="panel">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="skeleton-row" />
          ))}
        </div>
      ) : null}

      {!isLoadingDetail && detailError ? (
        <div className="empty-state">
          <p>{detailError}</p>
          <button type="button" onClick={() => void fetchQuizById(id)}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoadingDetail && !detailError && selectedQuiz ? (
        <div className="panel">
          <div className="inline-meta">
            <StatusBadge label={selectedQuiz.difficulty ?? "unknown"} />
            <StatusBadge
              label={`${selectedQuiz.questions.length} question previews`}
              tone="success"
            />
          </div>
          <div className="session-cta">
            {authMode === "guest" ? (
              <p className="feedback-error">
                Guest mode cannot create sessions. Login/Register as a user to
                host.
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleCreateSession}
              disabled={isSessionActionLoading}
            >
              {isSessionActionLoading ? "Creating Session..." : "Host Session"}
            </button>
          </div>

          {selectedQuiz.questions.length === 0 ? (
            <div className="empty-state compact">
              <p>No question previews available for this quiz.</p>
            </div>
          ) : (
            <ol className="question-list">
              {selectedQuiz.questions.map((question) => (
                <li key={question.id} className="question-list-item">
                  <span>{question.text}</span>
                  <StatusBadge label={`${question.points ?? 0} pts`} />
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}
    </section>
  );
}
