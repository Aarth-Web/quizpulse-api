import { DateTime } from 'luxon'
import { Exception } from '@adonisjs/core/exceptions'
import redis from '@adonisjs/redis/services/main'
import RedisKeys from '#constants/redis_keys'
import QuizSession from '#models/quiz_session'
import SessionParticipant from '#models/session_participant'
import Question from '#models/question'
import Answer from '#models/answer'
import SessionNotFoundException from '#exceptions/session_not_found_exception'
import SessionAlreadyStartedException from '#exceptions/session_already_started_exception'
import NotParticipantException from '#exceptions/not_participant_exception'
import AlreadyAnsweredException from '#exceptions/already_answered_exception'
import wsService from '#services/ws_service'
import ScoringService from '#services/scoring_service'

export default class SessionService {
  static async startSession(sessionId: string, requestingUserId: string) {
    const session = await QuizSession.find(sessionId)
    if (!session) throw new SessionNotFoundException()

    if (session.hostUserId !== requestingUserId) {
      throw new Exception('Forbidden', { status: 403, code: 'E_FORBIDDEN' })
    }

    if (session.status !== 'WAITING') {
      throw new SessionAlreadyStartedException()
    }

    const participants = await SessionParticipant.query().where({ sessionId })

    if (participants.length < 2) {
      throw new Exception('Need at least 2 players', { status: 400, code: 'E_NOT_ENOUGH_PLAYERS' })
    }

    const roomSize = wsService.getRoomSize(sessionId)
    if (roomSize !== participants.length) {
      throw new Exception('Not all players have connected via WebSocket', {
        status: 400,
        code: 'E_PLAYERS_NOT_CONNECTED',
      })
    }

    session.status = 'ACTIVE'
    session.startedAt = DateTime.now()
    await session.save()

    await redis.set(RedisKeys.sessionStatus(sessionId), 'ACTIVE')

    for (const p of participants) {
      await redis.hset(RedisKeys.sessionScores(sessionId), p.userId, '0')
    }

    await session.load('quiz')

    wsService.broadcast(sessionId, 'quiz:start', {
      sessionId,
      quizId: session.quizId,
      startedAt: session.startedAt?.toISO(),
      participants: participants.map((p) => ({ userId: p.userId })),
    })

    return session
  }

  static async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    chosenIndex: number
  ) {
    const session = await QuizSession.find(sessionId)
    if (!session) throw new SessionNotFoundException()

    if (session.status !== 'ACTIVE') {
      throw new Exception('Session not active', { status: 403, code: 'E_SESSION_NOT_ACTIVE' })
    }

    const participant = await SessionParticipant.query()
      .where({ sessionId, userId })
      .first()
    if (!participant) throw new NotParticipantException()

    const alreadyAnswered = await redis.sismember(
      RedisKeys.sessionAnswered(sessionId, userId),
      questionId
    )
    if (alreadyAnswered) throw new AlreadyAnsweredException()

    const question = await Question.query()
      .where({ id: questionId, quizId: session.quizId })
      .firstOrFail()

    const isCorrect = chosenIndex === question.correctIndex

    await redis.sadd(RedisKeys.sessionAnswered(sessionId, userId), questionId)

    let pointsAwarded = 0
    if (isCorrect) {
      pointsAwarded = question.points
      await ScoringService.addPoints(sessionId, userId, pointsAwarded)
    } else {
      const ranks = await ScoringService.recalculateRanks(sessionId)
      wsService.broadcast(sessionId, 'score:update', {
        userId,
        newScore: Number(
          (await redis.hget(RedisKeys.sessionScores(sessionId), userId)) ?? '0'
        ),
        ranks,
      })
    }

    await Answer.create({
      sessionId,
      participantId: participant.id,
      questionId,
      chosenIndex,
      isCorrect,
      answeredAt: DateTime.now(),
    })

    const totalQuestions = await Question.query()
      .where({ quizId: session.quizId })
      .count('* as total')

    const total = Number(totalQuestions[0].$extras.total)

    const answeredCount = await redis.scard(RedisKeys.sessionAnswered(sessionId, userId))
    if (answeredCount >= total) {
      await ScoringService.markFinished(sessionId, userId)
    }

    await ScoringService.checkSessionComplete(sessionId, total)

    const currentScore = Number(
      (await redis.hget(RedisKeys.sessionScores(sessionId), userId)) ?? '0'
    )

    return { isCorrect, pointsAwarded, currentScore }
  }
}
