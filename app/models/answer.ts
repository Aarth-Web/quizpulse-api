import { AnswerSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import SessionParticipant from '#models/session_participant'
import Question from '#models/question'

export default class Answer extends AnswerSchema {
  static table = 'answers'

  @belongsTo(() => SessionParticipant)
  declare participant: BelongsTo<typeof SessionParticipant>

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>
}
