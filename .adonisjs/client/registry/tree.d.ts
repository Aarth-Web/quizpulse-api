/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    refresh: typeof routes['auth.refresh']
    guest: typeof routes['auth.guest']
    googleRedirect: typeof routes['auth.google_redirect']
    googleCallback: typeof routes['auth.google_callback']
  }
  quiz: {
    index: typeof routes['quiz.index']
    show: typeof routes['quiz.show']
  }
  leaderboard: {
    index: typeof routes['leaderboard.index']
  }
  user: {
    show: typeof routes['user.show']
    update: typeof routes['user.update']
  }
  session: {
    create: typeof routes['session.create']
    join: typeof routes['session.join']
    show: typeof routes['session.show']
    start: typeof routes['session.start']
    submitAnswer: typeof routes['session.submit_answer']
  }
}
