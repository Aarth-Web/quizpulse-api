import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/store";

type NavLinkItem = {
  to: string;
  label: string;
  end?: boolean;
};

export function AppLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const authMode = useAuthStore((state) => state.authMode);
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = Boolean(accessToken);

  const links: NavLinkItem[] = [
    { to: "/", label: "Home", end: true },
    { to: "/quizzes", label: "Quizzes" },
    { to: "/leaderboard", label: "Leaderboard" },
    authMode === "user" && currentUser
      ? { to: "/profile", label: "Profile" }
      : { to: "/auth", label: "Login/Register" },
  ];

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="app-header">
        <div className="top-nav">
          <NavLink to="/" className="brand" aria-label="QuizPulse Home">
            <span className="brand-mark">QP</span>
            <span>QuizPulse</span>
          </NavLink>

          <nav className="app-nav" aria-label="Primary navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isLoggedIn ? (
              <button type="button" className="logout-link" onClick={logout}>
                Logout
              </button>
            ) : null}
          </nav>
        </div>
      </header>
      <main id="main-content" className="app-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
