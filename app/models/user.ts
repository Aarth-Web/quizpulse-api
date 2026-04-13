import bcrypt from 'bcrypt'
import { UserSchema } from '#database/schema'
import { beforeCreate, beforeSave, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AVATARS from '#constants/avatars'
import RefreshToken from '#models/refresh_token'

export default class User extends UserSchema {
  @hasMany(() => RefreshToken)
  declare refreshTokens: HasMany<typeof RefreshToken>

  get avatarUrl(): string {
    return AVATARS[this.avatarIndex]
  }

  get initials(): string {
    const [first, last] = this.name ? this.name.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }

  @beforeCreate()
  static assignAvatar(user: User) {
    if (user.avatarIndex == null) {
      user.avatarIndex = Math.floor(Math.random() * 10)
    }
  }

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.passwordHash) {
      user.passwordHash = await bcrypt.hash(user.passwordHash!, 12)
    }
  }
}
