import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const QuizController = () => import('#controllers/quiz_controller')
const LeaderboardController = () => import('#controllers/leaderboard_controller')
const UserController = () => import('#controllers/user_controller')
const SessionController = () => import('#controllers/session_controller')

router.get('/', () => ({ hello: 'world' }))

router
  .group(() => {
    // ── Public (no auth) ────────────────────────────────────
    router
      .group(() => {
        router.post('register', [AuthController, 'register'])
        router.post('login', [AuthController, 'login'])
        router.post('refresh', [AuthController, 'refresh'])
        router.post('guest', [AuthController, 'guest'])
        router.get('google', [AuthController, 'googleRedirect'])
        router.get('google/callback', [AuthController, 'googleCallback'])
      })
      .prefix('auth')

    // ── Guest-accessible (user or guest JWT) ────────────────
    router
      .group(() => {
        router.get('quizzes', [QuizController, 'index'])
        router.get('quizzes/:id', [QuizController, 'show'])
        router.get('leaderboard', [LeaderboardController, 'index'])
      })
      .use(middleware.guest())

    // ── Authenticated (full JWT, no guests) ─────────────────
    router
      .group(() => {
        router.get('me', [UserController, 'show'])
        router.put('me', [UserController, 'update'])

        router.post('sessions', [SessionController, 'create'])
        router.post('sessions/join', [SessionController, 'join'])
        router.get('sessions/:id', [SessionController, 'show'])
        router.post('sessions/:id/start', [SessionController, 'start'])

        router
          .post('sessions/:id/answers', [SessionController, 'submitAnswer'])
          .use(middleware.sessionParticipant())
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')
