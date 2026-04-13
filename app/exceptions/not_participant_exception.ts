import { Exception } from '@adonisjs/core/exceptions'

export default class NotParticipantException extends Exception {
  static status = 403
  static code = 'E_NOT_PARTICIPANT'
  static message = 'You are not a participant of this session'

  constructor() {
    super(NotParticipantException.message, {
      status: NotParticipantException.status,
      code: NotParticipantException.code,
    })
  }
}
