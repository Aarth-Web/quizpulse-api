import { QuizSchema } from '#database/schema'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { hasMany } from '@adonisjs/lucid/orm'
import Question from '#models/question'

export default class Quiz extends QuizSchema {
  static table = 'quizzes'

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>
}
