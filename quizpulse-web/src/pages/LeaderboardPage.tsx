import { useEffect } from "react";
import { DataCard } from "../components/DataCard";
import { SectionHeader } from "../components/SectionHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useLeaderboardStore } from "../features/leaderboard/store";

export function LeaderboardPage() {
  const topPlayers = useLeaderboardStore((state) => state.topPlayers);
  const isLoading = useLeaderboardStore((state) => state.isLoading);
  const error = useLeaderboardStore((state) => state.error);
  const fetchLeaderboard = useLeaderboardStore(
    (state) => state.fetchLeaderboard,
  );

  useEffect(() => {
    if (topPlayers.length > 0) {
      return;
    }
    void fetchLeaderboard();
  }, [fetchLeaderboard, topPlayers.length]);

  return (
    <section>
      <SectionHeader
        title="Leaderboard"
        subtitle="Track top scores across all sessions."
      />

      {isLoading ? (
        <div className="panel">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="skeleton-row" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="empty-state">
          <p>{error}</p>
          <button type="button" onClick={() => void fetchLeaderboard()}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !error && topPlayers.length === 0 ? (
        <div className="empty-state">
          <p>No leaderboard entries yet.</p>
          <button type="button" onClick={() => void fetchLeaderboard()}>
            Refresh
          </button>
        </div>
      ) : null}

      {!isLoading && !error && topPlayers.length > 0 ? (
        <div className="card-grid">
          {topPlayers.map((player, index) => (
            <DataCard
              key={player.userId}
              title={player.name}
              subtitle={`Rank #${index + 1} | ${player.wins ?? 0} wins`}
              action={
                <StatusBadge
                  label={`${player.totalScore} pts`}
                  tone="success"
                />
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
