/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.register': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register',
    tokens: [{"old":"/api/v1/auth/register","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.refresh': {
    methods: ["POST"],
    pattern: '/api/v1/auth/refresh',
    tokens: [{"old":"/api/v1/auth/refresh","type":0,"val":"api","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['auth.refresh']['types'],
  },
  'auth.guest': {
    methods: ["POST"],
    pattern: '/api/v1/auth/guest',
    tokens: [{"old":"/api/v1/auth/guest","type":0,"val":"api","end":""},{"old":"/api/v1/auth/guest","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/guest","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/guest","type":0,"val":"guest","end":""}],
    types: placeholder as Registry['auth.guest']['types'],
  },
  'auth.google_redirect': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/google',
    tokens: [{"old":"/api/v1/auth/google","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['auth.google_redirect']['types'],
  },
  'auth.google_callback': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/google/callback',
    tokens: [{"old":"/api/v1/auth/google/callback","type":0,"val":"api","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"google","end":""},{"old":"/api/v1/auth/google/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.google_callback']['types'],
  },
  'quiz.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/quizzes',
    tokens: [{"old":"/api/v1/quizzes","type":0,"val":"api","end":""},{"old":"/api/v1/quizzes","type":0,"val":"v1","end":""},{"old":"/api/v1/quizzes","type":0,"val":"quizzes","end":""}],
    types: placeholder as Registry['quiz.index']['types'],
  },
  'quiz.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/quizzes/:id',
    tokens: [{"old":"/api/v1/quizzes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/quizzes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/quizzes/:id","type":0,"val":"quizzes","end":""},{"old":"/api/v1/quizzes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['quiz.show']['types'],
  },
  'leaderboard.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/leaderboard',
    tokens: [{"old":"/api/v1/leaderboard","type":0,"val":"api","end":""},{"old":"/api/v1/leaderboard","type":0,"val":"v1","end":""},{"old":"/api/v1/leaderboard","type":0,"val":"leaderboard","end":""}],
    types: placeholder as Registry['leaderboard.index']['types'],
  },
  'user.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/me',
    tokens: [{"old":"/api/v1/me","type":0,"val":"api","end":""},{"old":"/api/v1/me","type":0,"val":"v1","end":""},{"old":"/api/v1/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['user.show']['types'],
  },
  'user.update': {
    methods: ["PUT"],
    pattern: '/api/v1/me',
    tokens: [{"old":"/api/v1/me","type":0,"val":"api","end":""},{"old":"/api/v1/me","type":0,"val":"v1","end":""},{"old":"/api/v1/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['user.update']['types'],
  },
  'session.create': {
    methods: ["POST"],
    pattern: '/api/v1/sessions',
    tokens: [{"old":"/api/v1/sessions","type":0,"val":"api","end":""},{"old":"/api/v1/sessions","type":0,"val":"v1","end":""},{"old":"/api/v1/sessions","type":0,"val":"sessions","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.join': {
    methods: ["POST"],
    pattern: '/api/v1/sessions/join',
    tokens: [{"old":"/api/v1/sessions/join","type":0,"val":"api","end":""},{"old":"/api/v1/sessions/join","type":0,"val":"v1","end":""},{"old":"/api/v1/sessions/join","type":0,"val":"sessions","end":""},{"old":"/api/v1/sessions/join","type":0,"val":"join","end":""}],
    types: placeholder as Registry['session.join']['types'],
  },
  'session.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/sessions/:id',
    tokens: [{"old":"/api/v1/sessions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/sessions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/sessions/:id","type":0,"val":"sessions","end":""},{"old":"/api/v1/sessions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['session.show']['types'],
  },
  'session.start': {
    methods: ["POST"],
    pattern: '/api/v1/sessions/:id/start',
    tokens: [{"old":"/api/v1/sessions/:id/start","type":0,"val":"api","end":""},{"old":"/api/v1/sessions/:id/start","type":0,"val":"v1","end":""},{"old":"/api/v1/sessions/:id/start","type":0,"val":"sessions","end":""},{"old":"/api/v1/sessions/:id/start","type":1,"val":"id","end":""},{"old":"/api/v1/sessions/:id/start","type":0,"val":"start","end":""}],
    types: placeholder as Registry['session.start']['types'],
  },
  'session.submit_answer': {
    methods: ["POST"],
    pattern: '/api/v1/sessions/:id/answers',
    tokens: [{"old":"/api/v1/sessions/:id/answers","type":0,"val":"api","end":""},{"old":"/api/v1/sessions/:id/answers","type":0,"val":"v1","end":""},{"old":"/api/v1/sessions/:id/answers","type":0,"val":"sessions","end":""},{"old":"/api/v1/sessions/:id/answers","type":1,"val":"id","end":""},{"old":"/api/v1/sessions/:id/answers","type":0,"val":"answers","end":""}],
    types: placeholder as Registry['session.submit_answer']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
