import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/store";
import { useToastStore } from "../components/toastStore";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const loginGuest = useAuthStore((state) => state.loginGuest);
  const currentUser = useAuthStore((state) => state.currentUser);
  const authMode = useAuthStore((state) => state.authMode);
  const addToast = useToastStore((state) => state.addToast);

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [guestNickname, setGuestNickname] = useState("");
  const [loadingAction, setLoadingAction] = useState<
    "register" | "login" | "guest" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const redirectTo =
    typeof (location.state as { redirectTo?: unknown } | null)?.redirectTo ===
    "string"
      ? (location.state as { redirectTo: string }).redirectTo
      : null;

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoadingAction("register");

    const result = await register(registerForm);
    setLoadingAction(null);

    if (!result.ok) {
      const message = result.error ?? "Unable to register right now.";
      setError(message);
      addToast(message, "error");
      return;
    }

    addToast("Registration successful.", "success");
    navigate(redirectTo ?? "/profile", { replace: true });
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoadingAction("login");

    const result = await login(loginForm);
    setLoadingAction(null);

    if (!result.ok) {
      const message = result.error ?? "Unable to login right now.";
      setError(message);
      addToast(message, "error");
      return;
    }

    addToast("Logged in successfully.", "success");
    navigate(redirectTo ?? "/profile", { replace: true });
  }

  async function handleGuestLogin() {
    setError(null);
    setLoadingAction("guest");

    const result = await loginGuest({ nickname: guestNickname || undefined });
    setLoadingAction(null);

    if (!result.ok) {
      const message = result.error ?? "Unable to continue as guest.";
      setError(message);
      addToast(message, "error");
      return;
    }

    addToast("Guest session started.", "success");
    navigate("/quizzes");
  }

  return (
    <section className="auth-page">
      <h2>Login/Register</h2>
      {currentUser ? (
        <p>
          Signed in as {currentUser.email ?? currentUser.name} ({authMode})
        </p>
      ) : (
        <p>Sign in to continue or start as a guest.</p>
      )}

      {error ? (
        <p id="auth-error" className="feedback-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="auth-grid">
        <form
          onSubmit={handleRegister}
          className="panel"
          aria-describedby={error ? "auth-error" : undefined}
        >
          <h3>Register</h3>
          <label>
            Name
            <input
              required
              autoComplete="username"
              value={registerForm.name}
              onChange={(event) =>
                setRegisterForm((state) => ({
                  ...state,
                  name: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={registerForm.email}
              onChange={(event) =>
                setRegisterForm((state) => ({
                  ...state,
                  email: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="new-password"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((state) => ({
                  ...state,
                  password: event.target.value,
                }))
              }
            />
          </label>
          <button type="submit" disabled={loadingAction === "register"}>
            {loadingAction === "register"
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <form
          onSubmit={handleLogin}
          className="panel"
          aria-describedby={error ? "auth-error" : undefined}
        >
          <h3>Login</h3>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm((state) => ({
                  ...state,
                  email: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((state) => ({
                  ...state,
                  password: event.target.value,
                }))
              }
            />
          </label>
          <button type="submit" disabled={loadingAction === "login"}>
            {loadingAction === "login" ? "Logging in..." : "Login"}
          </button>
        </form>

        <section className="panel">
          <h3>Guest</h3>
          <label>
            Nickname (optional)
            <input
              value={guestNickname}
              onChange={(event) => setGuestNickname(event.target.value)}
              placeholder="Guest123"
            />
          </label>
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loadingAction === "guest"}
          >
            {loadingAction === "guest"
              ? "Starting guest session..."
              : "Continue as Guest"}
          </button>
        </section>
      </div>
    </section>
  );
}
