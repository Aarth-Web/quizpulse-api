import { randomBytes, randomUUID, createHash } from 'node:crypto'
import jwt, { type SignOptions } from 'jsonwebtoken'
import redis from '@adonisjs/redis/services/main'
import env from '#start/env'
import RedisKeys from '#constants/redis_keys'

type Role = 'user' | 'guest'

interface TokenPair {
  accessToken: string
  refreshToken: string
}

export default class TokenService {
  private static get jwtSecret(): string {
    return env.get('JWT_SECRET')
  }

  private static get jwtExpiresIn(): string {
    return env.get('JWT_EXPIRES_IN')
  }

  /** REFRESH_TOKEN_EXPIRES_IN is stored as seconds in the env */
  private static get refreshTtl(): number {
    return env.get('REFRESH_TOKEN_EXPIRES_IN')
  }

  /**
   * Sign a short-lived JWT containing the user id and role.
   */
  static issueAccessToken(userId: string, role: Role): string {
    return jwt.sign({ sub: userId, role }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as SignOptions)
  }

  /**
   * Create a cryptographically random refresh token, persist its
   * SHA-256 hash in Redis with a TTL, and return the raw token
   * (base64url-encoded) to the caller.
   *
   * Token format (before encoding): `userId:tokenId:secretHex`
   */
  static async issueRefreshToken(userId: string): Promise<string> {
    const tokenId = randomUUID()
    const secret = randomBytes(32)
    const hash = createHash('sha256').update(secret).digest('hex')

    await redis.set(RedisKeys.refreshToken(userId, tokenId), hash, 'EX', this.refreshTtl)

    return Buffer.from(`${userId}:${tokenId}:${secret.toString('hex')}`).toString('base64url')
  }

  /**
   * Validate a refresh token, revoke it (delete from Redis), and
   * return a fresh access + refresh token pair.
   */
  static async rotateRefreshToken(rawToken: string): Promise<TokenPair> {
    const decoded = Buffer.from(rawToken, 'base64url').toString()
    const [userId, tokenId, ...secretParts] = decoded.split(':')
    const secretHex = secretParts.join(':')

    if (!userId || !tokenId || !secretHex) {
      throw new Error('Invalid refresh token format')
    }

    const hash = createHash('sha256').update(Buffer.from(secretHex, 'hex')).digest('hex')
    const key = RedisKeys.refreshToken(userId, tokenId)

    const stored = await redis.get(key)
    if (!stored || stored !== hash) {
      throw new Error('Invalid or expired refresh token')
    }

    await redis.del(key)

    const accessToken = this.issueAccessToken(userId, 'user')
    const refreshToken = await this.issueRefreshToken(userId)

    return { accessToken, refreshToken }
  }

  /**
   * Issue a stateless guest JWT (no userId, 24 h expiry).
   */
  static issueGuestToken(): string {
    return jwt.sign({ role: 'guest' as Role }, this.jwtSecret, {
      expiresIn: '24h',
    })
  }
}
