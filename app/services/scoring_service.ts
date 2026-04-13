import redis from '@adonisjs/redis/services/main'
import { DateTime } from 'luxon'
import RedisKeys from '#constants/redis_keys'
import SessionParticipant from '#models/session_participant'
import QuizSession from '#models/quiz_session'
import wsService from '#services/ws_service'
import LeaderboardService from '#services/leaderboard_service'

export interface RankEntry {
  userId: string
  score: number
  rank: number
  finishedAt: number | null
}

export default class ScoringService {
  static async addPoints(sessionId: string, userId: string, points: number) {
    const newScore = await redis.hincrby(RedisKeys.sessionScores(sessionId), userId, points)

    const ranks = await this.recalculateRanks(sessionId)

    await SessionParticipant.query()
      .where({ sessionId, userId })
      .increment('score', points)

    wsService.broadcast(sessionId, 'score:update', {
      userId,
      newScore,
      ranks,
    })
  }

  static async recalculateRanks(sessionId: string): Promise<RankEntry[]> {
    const scores = await redis.hgetall(RedisKeys.sessionScores(sessionId))
    const finishTimes = await redis.hgetall(RedisKeys.sessionFinishTimes(sessionId))

    const entries = Object.entries(scores).map(([userId, scoreStr]) => ({
      userId,
      score: Number(scoreStr),
      finishedAt: finishTimes[userId] ? Number(finishTimes[userId]) : null,
    }))

    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const aTime = a.finishedAt ?? Infinity
      const bTime = b.finishedAt ?? Infinity
      return aTime - bTime
    })

    return entries.map((entry, i) => ({
      ...entry,
      rank: i + 1,
    }))
  }

  static async markFinished(sessionId: string, userId: string) {
    await redis.hset(RedisKeys.sessionFinishTimes(sessionId), userId, String(Date.now()))

    await SessionParticipant.query()
      .where({ sessionId, userId })
      .update({ finishedAt: DateTime.now().toSQL() })
  }

  static async finalizeSession(sessionId: string) {
    const ranks = await this.recalculateRanks(sessionId)
    const winner = ranks[0]

    const session = await QuizSession.findOrFail(sessionId)
    session.status = 'DONE'
    session.endedAt = DateTime.now()
    await session.save()

    for (const entry of ranks) {
      await SessionParticipant.query()
        .where({ sessionId, userId: entry.userId })
        .update({
          rank: entry.rank,
          isWinner: entry.rank === 1,
        })
    }

    await LeaderboardService.updateOnSessionEnd(sessionId, ranks)

    wsService.broadcast(sessionId, 'quiz:end', {
      winner,
      finalRanks: ranks,
    })

    await redis.del(
      RedisKeys.sessionStatus(sessionId),
      RedisKeys.sessionScores(sessionId),
      RedisKeys.sessionFinishTimes(sessionId)
    )

    const participants = await SessionParticipant.query().where({ sessionId })
    for (const p of participants) {
      await redis.del(RedisKeys.sessionAnswered(sessionId, p.userId))
    }

    return ranks
  }

  static async checkSessionComplete(sessionId: string, totalQuestions: number) {
    const participants = await SessionParticipant.query().where({ sessionId })

    for (const p of participants) {
      const answeredCount = await redis.scard(RedisKeys.sessionAnswered(sessionId, p.userId))
      if (answeredCount < totalQuestions) {
        return
      }
    }

    await this.finalizeSession(sessionId)
  }
}
