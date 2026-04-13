import { Exception } from '@adonisjs/core/exceptions'

export default class SessionAlreadyStartedException extends Exception {
  static status = 409
  static code = 'E_SESSION_ALREADY_STARTED'
  static message = 'Session has already started'

  constructor() {
    super(SessionAlreadyStartedException.message, {
      status: SessionAlreadyStartedException.status,
      code: SessionAlreadyStartedException.code,
    })
  }
}
