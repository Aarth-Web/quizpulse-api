import redis from '@adonisjs/redis/services/main'
import RedisKeys from '#constants/redis_keys'
import Leaderboard from '#models/leaderboard'
import AVATARS from '#constants/avatars'
import type { RankEntry } from '#services/scoring_service'

interface LeaderboardEntry {
  userId: string
  name: string | null
  avatarUrl: string
  totalScore: number
  wins: number
  gamesPlayed: number
}

export default class LeaderboardService {
  static async updateOnSessionEnd(_sessionId: string, rankings: RankEntry[]) {
    for (const entry of rankings) {
      const row = await Leaderboard.firstOrCreate(
        { userId: entry.userId },
        { totalScore: 0, wins: 0, gamesPlayed: 0 }
      )

      row.totalScore += entry.score
      row.gamesPlayed += 1
      if (entry.rank === 1) {
        row.wins += 1
      }

      await row.save()
    }

    await redis.del(RedisKeys.leaderboardCache())
  }

  static async getTopN(limit: number = 50): Promise<LeaderboardEntry[]> {
    const cached = await redis.get(RedisKeys.leaderboardCache())
    if (cached) {
      return JSON.parse(cached)
    }

    const rows = await Leaderboard.query()
      .preload('user', (q) => q.select(['id', 'name', 'avatarIndex']))
      .orderBy('totalScore', 'desc')
      .limit(limit)

    const result: LeaderboardEntry[] = rows.map((row) => ({
      userId: row.userId,
      name: row.user.name,
      avatarUrl: AVATARS[row.user.avatarIndex],
      totalScore: row.totalScore,
      wins: row.wins,
      gamesPlayed: row.gamesPlayed,
    }))

    await redis.setex(RedisKeys.leaderboardCache(), 60, JSON.stringify(result))

    return result
  }
}
