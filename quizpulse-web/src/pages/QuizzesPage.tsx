import { useEffect } from "react";
import { Link } from "react-router-dom";
import { DataCard } from "../components/DataCard";
import { SectionHeader } from "../components/SectionHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useQuizStore } from "../features/quiz/store";

export function QuizzesPage() {
  const quizzes = useQuizStore((state) => state.quizzes);
  const isLoading = useQuizStore((state) => state.isLoadingList);
  const error = useQuizStore((state) => state.listError);
  const fetchQuizzes = useQuizStore((state) => state.fetchQuizzes);

  useEffect(() => {
    if (quizzes.length > 0) {
      return;
    }
    void fetchQuizzes();
  }, [fetchQuizzes, quizzes.length]);

  return (
    <section>
      <SectionHeader
        title="Quizzes"
        subtitle="Browse available quizzes and preview their structure."
      />

      {isLoading ? (
        <div className="card-grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="skeleton-card" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="empty-state">
          <p>{error}</p>
          <button type="button" onClick={() => void fetchQuizzes()}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !error && quizzes.length === 0 ? (
        <div className="empty-state">
          <p>No quizzes are available right now.</p>
          <button type="button" onClick={() => void fetchQuizzes()}>
            Refresh
          </button>
        </div>
      ) : null}

      {!isLoading && !error && quizzes.length > 0 ? (
        <div className="card-grid">
          {quizzes.map((quiz) => (
            <DataCard
              key={quiz.id}
              title={quiz.title}
              subtitle={quiz.category ?? "General"}
              action={
                <Link className="inline-link" to={`/quizzes/${quiz.id}`}>
                  View details
                </Link>
              }
            >
              <div className="inline-meta">
                <StatusBadge
                  label={quiz.difficulty ?? "unknown"}
                  tone={quiz.difficulty === "hard" ? "warning" : "default"}
                />
                <StatusBadge
                  label={`${quiz.questionCount ?? 0} questions`}
                  tone="success"
                />
              </div>
            </DataCard>
          ))}
        </div>
      ) : null}
    </section>
  );
}
