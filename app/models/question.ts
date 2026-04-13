import { QuestionSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import Quiz from '#models/quiz'

export default class Question extends QuestionSchema {
  static table = 'questions'

  @belongsTo(() => Quiz)
  declare quiz: BelongsTo<typeof Quiz>
}
