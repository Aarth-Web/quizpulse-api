import { RefreshTokenSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class RefreshToken extends RefreshTokenSchema {
  static table = 'refresh_tokens'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
