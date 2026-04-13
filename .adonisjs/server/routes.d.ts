import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.guest': { paramsTuple?: []; params?: {} }
    'auth.google_redirect': { paramsTuple?: []; params?: {} }
    'auth.google_callback': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
    'quiz.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leaderboard.index': { paramsTuple?: []; params?: {} }
    'user.show': { paramsTuple?: []; params?: {} }
    'user.update': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.join': { paramsTuple?: []; params?: {} }
    'session.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.start': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.submit_answer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'auth.google_redirect': { paramsTuple?: []; params?: {} }
    'auth.google_callback': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
    'quiz.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leaderboard.index': { paramsTuple?: []; params?: {} }
    'user.show': { paramsTuple?: []; params?: {} }
    'session.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'auth.google_redirect': { paramsTuple?: []; params?: {} }
    'auth.google_callback': { paramsTuple?: []; params?: {} }
    'quiz.index': { paramsTuple?: []; params?: {} }
    'quiz.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leaderboard.index': { paramsTuple?: []; params?: {} }
    'user.show': { paramsTuple?: []; params?: {} }
    'session.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.guest': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.join': { paramsTuple?: []; params?: {} }
    'session.start': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.submit_answer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'user.update': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}