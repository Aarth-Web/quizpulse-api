import { QuizSessionSchema } from '#database/schema'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Quiz from '#models/quiz'
import SessionParticipant from '#models/session_participant'

export default class QuizSession extends QuizSessionSchema {
  static table = 'quiz_sessions'

  @belongsTo(() => Quiz)
  declare quiz: BelongsTo<typeof Quiz>

  @hasMany(() => SessionParticipant, {
    foreignKey: 'sessionId',
    localKey: 'id',
  })
  declare participants: HasMany<typeof SessionParticipant>
}
