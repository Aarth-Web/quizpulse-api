import { LeaderboardSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class Leaderboard extends LeaderboardSchema {
  static table = 'leaderboards'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
