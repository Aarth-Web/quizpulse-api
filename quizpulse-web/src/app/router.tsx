import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import {
  GuestOrUserRoute,
  PublicOnlyRoute,
  UserOnlyRoute,
} from "../components/ProtectedRoute";

const AuthPage = lazy(() =>
  import("../pages/AuthPage").then((m) => ({ default: m.AuthPage })),
);
const HomePage = lazy(() =>
  import("../pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const LeaderboardPage = lazy(() =>
  import("../pages/LeaderboardPage").then((m) => ({
    default: m.LeaderboardPage,
  })),
);
const ProfilePage = lazy(() =>
  import("../pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const QuizDetailPage = lazy(() =>
  import("../pages/QuizDetailPage").then((m) => ({
    default: m.QuizDetailPage,
  })),
);
const QuizzesPage = lazy(() =>
  import("../pages/QuizzesPage").then((m) => ({ default: m.QuizzesPage })),
);
const SessionLobbyPage = lazy(() =>
  import("../pages/SessionLobbyPage").then((m) => ({
    default: m.SessionLobbyPage,
  })),
);
const SessionPlayPage = lazy(() =>
  import("../pages/SessionPlayPage").then((m) => ({
    default: m.SessionPlayPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function RouteFallback() {
  return <p className="route-loading">Loading page...</p>;
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          <Route element={<GuestOrUserRoute />}>
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quizzes/:id" element={<QuizDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/sessions/:id" element={<SessionLobbyPage />} />
            <Route path="/sessions/:id/play" element={<SessionPlayPage />} />
          </Route>
          <Route element={<UserOnlyRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
