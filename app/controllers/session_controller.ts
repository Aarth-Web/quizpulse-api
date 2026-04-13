import type { HttpContext } from '@adonisjs/core/http'
import SessionService from '#services/session_service'
import { createSessionValidator } from '#validators/session/create_session'
import { joinSessionValidator } from '#validators/session/join_session'
import { submitAnswerValidator } from '#validators/session/submit_answer'
import QuizSession from '#models/quiz_session'
import SessionParticipant from '#models/session_participant'
import SessionNotFoundException from '#exceptions/session_not_found_exception'
import { generateInviteCode } from '#helpers/generate_invite_code'

export default class SessionController {
  async create({ request, response, jwtPayload }: HttpContext) {
    const { quizId } = await request.validateUsing(createSessionValidator)
    const userId = jwtPayload.sub!

    const session = await QuizSession.create({
      quizId,
      hostUserId: userId,
      status: 'WAITING',
      inviteCode: generateInviteCode(),
    })

    await SessionParticipant.create({
      sessionId: session.id,
      userId,
    })

    return response.status(201).json({ data: session, error: null })
  }

  async join({ request, response, jwtPayload }: HttpContext) {
    const { inviteCode } = await request.validateUsing(joinSessionValidator)
    const userId = jwtPayload.sub!

    const session = await QuizSession.query().where({ inviteCode }).first()
    if (!session) throw new SessionNotFoundException()

    const existing = await SessionParticipant.query()
      .where({ sessionId: session.id, userId })
      .first()

    if (!existing) {
      await SessionParticipant.create({
        sessionId: session.id,
        userId,
      })
    }

    return response.json({ data: session, error: null })
  }

  async show({ params, response }: HttpContext) {
    const session = await QuizSession.query()
      .where({ id: params.id })
      .preload('participants')
      .first()

    if (!session) throw new SessionNotFoundException()

    return response.json({ data: session, error: null })
  }

  async start({ params, response, jwtPayload }: HttpContext) {
    const sessionId = params.id
    const userId = jwtPayload.sub!

    const session = await SessionService.startSession(sessionId, userId)

    return response.json({ data: session, error: null, message: 'Quiz started' })
  }

  async submitAnswer({ params, request, response, jwtPayload }: HttpContext) {
    const sessionId = params.id
    const userId = jwtPayload.sub!

    const { questionId, chosenIndex } = await request.validateUsing(submitAnswerValidator)

    const result = await SessionService.submitAnswer(userId, sessionId, questionId, chosenIndex)

    return response.json({ data: result, error: null })
  }
}
