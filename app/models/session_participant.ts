import { SessionParticipantSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import QuizSession from '#models/quiz_session'
import User from '#models/user'

export default class SessionParticipant extends SessionParticipantSchema {
  static table = 'session_participants'

  @belongsTo(() => QuizSession, {
    foreignKey: 'sessionId',
    localKey: 'id',
  })
  declare session: BelongsTo<typeof QuizSession>

  @belongsTo(() => User, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  declare user: BelongsTo<typeof User>
}
