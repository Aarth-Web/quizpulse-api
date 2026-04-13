import type { HttpContext } from '@adonisjs/core/http'
import Quiz from '#models/quiz'

export default class QuizController {
  async index({ response }: HttpContext) {
    const quizzes = await Quiz.all()
    return response.json({ data: quizzes, error: null })
  }

  async show({ params, response }: HttpContext) {
    const quiz = await Quiz.query()
      .where({ id: params.id })
      .preload('questions')
      .firstOrFail()

    return response.json({ data: quiz, error: null })
  }
}
