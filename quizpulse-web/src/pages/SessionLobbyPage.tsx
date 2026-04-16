import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SectionHeader } from "../components/SectionHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useToastStore } from "../components/toastStore";
import { useAuthStore } from "../features/auth/store";
import { useSessionStore } from "../features/session/store";
import type { SessionSocketEvent } from "../lib/ws/sessionSocket";
import { useSessionWebSocket } from "../lib/ws/useSessionWebSocket";

export function SessionLobbyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const authMode = useAuthStore((state) => state.authMode);
  const currentUser = useAuthStore((state) => state.currentUser);
  const currentSession = useSessionStore((state) => state.currentSession);
  const isLoading = useSessionStore((state) => state.isLoading);
  const isActionLoading = useSessionStore((state) => state.isActionLoading);
  const error = useSessionStore((state) => state.error);
  const startHostedSession = useSessionStore(
    (state) => state.startHostedSession,
  );
  const addToast = useToastStore((state) => state.addToast);

  const isParticipant = useMemo(() => {
    if (!currentUser || !currentSession) {
      return false;
    }
    return currentSession.participants.some(
      (participant) => participant.userId === currentUser.id,
    );
  }, [currentSession, currentUser]);

  const wsLobbyEnabled = Boolean(
    id &&
    authMode === "user" &&
    isParticipant &&
    currentSession?.status === "WAITING",
  );

  const socketStatus = useSessionWebSocket(id, wsLobbyEnabled, {
    onEvent: (event: SessionSocketEvent) => {
      if (!id) {
        return;
      }
      if (
        event.event === "player:joined" ||
        event.event === "player:left" ||
        event.event === "session:update"
      ) {
        void useSessionStore.getState().fetchSession(id);
      }
    },
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    void useSessionStore.getState().fetchSession(id);
  }, [id]);

  useEffect(() => {
    if (!id || authMode !== "user") {
      return;
    }

    const intervalMs = socketStatus === "connected" ? 20000 : 8000;
    const interval = window.setInterval(() => {
      void useSessionStore.getState().fetchSession(id);
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [authMode, id, socketStatus]);

  if (!id) {
    return (
      <div className="empty-state">
        <p>Session id is missing from route.</p>
      </div>
    );
  }

  if (authMode !== "user") {
    return (
      <div className="empty-state">
        <p>Guest mode cannot use session lobby lifecycle actions.</p>
        <p>Please Login/Register using a user account and try again.</p>
      </div>
    );
  }

  const isHost = Boolean(
    currentUser &&
    currentSession &&
    (currentSession.hostUserId === currentUser.id ||
      currentSession.participants.some(
        (participant) =>
          participant.userId === currentUser.id && participant.isHost,
      )),
  );

  async function handleStartSession() {
    if (!id) {
      addToast("Missing session id.", "error");
      return;
    }

    const result = await startHostedSession(id);
    if (!result.ok) {
      addToast(result.error ?? "Could not start session.", "error");
      return;
    }
    addToast("Session started.", "success");
    navigate(`/sessions/${id}/play`);
  }

  return (
    <section>
      <SectionHeader
        title="Session Lobby"
        subtitle="Invite players and start when ready."
      />

      {isLoading ? (
        <div className="panel">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="skeleton-row" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="empty-state">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void useSessionStore.getState().fetchSession(id)}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !error && currentSession ? (
        <div className="panel">
          <div className="inline-meta">
            <StatusBadge
              label={`Invite: ${currentSession.inviteCode}`}
              tone="success"
            />
            <StatusBadge label={`Status: ${currentSession.status}`} />
            <StatusBadge label={`WS: ${socketStatus}`} />
            <StatusBadge
              label={`${currentSession.participants.length} participants`}
            />
          </div>

          <div className="lobby-actions">
            <button
              type="button"
              onClick={() => void useSessionStore.getState().fetchSession(id)}
              disabled={isActionLoading}
            >
              Refresh Lobby
            </button>
            <button
              type="button"
              onClick={() => navigate(`/sessions/${id}/play`)}
            >
              Open Play Screen
            </button>
            <button
              type="button"
              onClick={handleStartSession}
              disabled={
                isActionLoading ||
                !isHost ||
                currentSession.status !== "WAITING"
              }
            >
              {isActionLoading ? "Starting..." : "Start Session"}
            </button>
          </div>

          {!isHost ? (
            <p className="feedback-error">
              Only the host can start this session. You can wait for host to
              begin.
            </p>
          ) : null}

          <ul className="participant-list">
            {currentSession.participants.map((participant) => (
              <li key={participant.id} className="participant-item">
                <span>
                  {participant.name ?? participant.userId ?? participant.id}
                </span>
                <div className="inline-meta">
                  {participant.isHost ? (
                    <StatusBadge label="Host" tone="warning" />
                  ) : null}
                  {participant.userId === currentUser?.id ? (
                    <StatusBadge label="You" tone="success" />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
