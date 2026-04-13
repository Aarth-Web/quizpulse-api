import type { HttpContext } from '@adonisjs/core/http'
import LeaderboardService from '#services/leaderboard_service'

export default class LeaderboardController {
  async index({ response }: HttpContext) {
    const leaderboard = await LeaderboardService.getTopN()
    return response.json({ data: leaderboard, error: null })
  }
}
