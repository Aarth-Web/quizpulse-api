import { SessionParticipantSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import QuizSession from '#models/quiz_session'
import User from '#models/user'

export default class SessionParticipant extends SessionParticipantSchema {
  static table = 'session_participants'

  @belongsTo(() => QuizSession)
  declare session: BelongsTo<typeof QuizSession>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
