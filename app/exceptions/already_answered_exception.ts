import { Exception } from '@adonisjs/core/exceptions'

export default class AlreadyAnsweredException extends Exception {
  static status = 409
  static code = 'E_ALREADY_ANSWERED'
  static message = 'You have already answered this question'

  constructor() {
    super(AlreadyAnsweredException.message, {
      status: AlreadyAnsweredException.status,
      code: AlreadyAnsweredException.code,
    })
  }
}
