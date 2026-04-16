import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../components/toastStore";
import { useAuthStore } from "../features/auth/store";
import { useSessionStore } from "../features/session/store";

export function HomePage() {
  const navigate = useNavigate();
  const authMode = useAuthStore((state) => state.authMode);
  const joinSessionByInviteCode = useSessionStore(
    (state) => state.joinSessionByInviteCode,
  );
  const isActionLoading = useSessionStore((state) => state.isActionLoading);
  const addToast = useToastStore((state) => state.addToast);

  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  async function handleJoinByInviteCode() {
    setJoinError(null);

    if (authMode !== "user") {
      const message =
        "Session join requires a registered user account. Please login/register.";
      setJoinError(message);
      addToast(message, "error");
      return;
    }

    if (!inviteCode.trim()) {
      setJoinError("Enter an invite code to join a session.");
      return;
    }

    const result = await joinSessionByInviteCode(inviteCode.trim());
    if (!result.ok || !result.sessionId) {
      const message =
        result.error ?? "Unable to join the session. Verify your invite code.";
      setJoinError(message);
      addToast(message, "error");
      return;
    }

    addToast("Joined session lobby.", "success");
    navigate(`/sessions/${result.sessionId}`);
  }

  return (
    <section>
      <h2>Home</h2>
      <p>
        Welcome to QuizPulse. Start a quiz session and challenge the
        leaderboard.
      </p>
      <div className="panel home-actions">
        <h3>Join Session</h3>
        <label>
          Invite Code
          <input
            value={inviteCode}
            onChange={(event) =>
              setInviteCode(event.target.value.toUpperCase())
            }
            placeholder="ABCD12"
          />
        </label>
        {joinError ? <p className="feedback-error">{joinError}</p> : null}
        {authMode === "guest" ? (
          <p className="feedback-error">
            Guest mode cannot join or start sessions. Login/Register as a user.
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleJoinByInviteCode}
          disabled={isActionLoading}
        >
          {isActionLoading ? "Joining..." : "Join by Invite Code"}
        </button>
      </div>
    </section>
  );
}
