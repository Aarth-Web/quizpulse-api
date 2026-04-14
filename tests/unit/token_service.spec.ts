import { test } from '@japa/runner'
import jwt from 'jsonwebtoken'
import redis from '@adonisjs/redis/services/main'
import TokenService from '#services/token_service'
import RedisKeys from '#constants/redis_keys'
import env from '#start/env'

test.group('TokenService', (group) => {
  group.teardown(async () => {
    await redis.flushdb()
  })

  test('issueAccessToken returns JWT with correct sub and role', ({ assert }) => {
    const token = TokenService.issueAccessToken('user-123', 'user')
    const decoded = jwt.verify(token, env.get('JWT_SECRET')) as jwt.JwtPayload

    assert.equal(decoded.sub, 'user-123')
    assert.equal(decoded.role, 'user')
    assert.isDefined(decoded.exp)
  })

  test('issueGuestToken returns JWT with role=guest and no sub', ({ assert }) => {
    const token = TokenService.issueGuestToken()
    const decoded = jwt.verify(token, env.get('JWT_SECRET')) as jwt.JwtPayload

    assert.equal(decoded.role, 'guest')
    assert.isUndefined(decoded.sub)
  })

  test('issueRefreshToken stores hash in Redis and returns base64url token', async ({ assert }) => {
    const raw = await TokenService.issueRefreshToken('user-456')

    assert.isString(raw)
    assert.isTrue(raw.length > 0)

    const decoded = Buffer.from(raw, 'base64url').toString()
    const [userId, tokenId] = decoded.split(':')
    assert.equal(userId, 'user-456')

    const stored = await redis.get(RedisKeys.refreshToken(userId, tokenId))
    assert.isNotNull(stored)
  })

  test('rotateRefreshToken deletes old key and returns new pair', async ({ assert }) => {
    const raw = await TokenService.issueRefreshToken('user-789')
    const result = await TokenService.rotateRefreshToken(raw)

    assert.isString(result.accessToken)
    assert.isString(result.refreshToken)

    const decoded = Buffer.from(raw, 'base64url').toString()
    const [userId, tokenId] = decoded.split(':')
    const oldKey = await redis.get(RedisKeys.refreshToken(userId, tokenId))
    assert.isNull(oldKey)
  })

  test('rotateRefreshToken throws on invalid token', async ({ assert }) => {
    const fakeToken = Buffer.from('bad:data:hex').toString('base64url')

    await assert.rejects(
      () => TokenService.rotateRefreshToken(fakeToken),
      'Invalid or expired refresh token'
    )
  })

  test('rotateRefreshToken throws on tampered secret', async ({ assert }) => {
    const raw = await TokenService.issueRefreshToken('user-tamper')
    const decoded = Buffer.from(raw, 'base64url').toString()
    const parts = decoded.split(':')
    parts[2] = 'ff'.repeat(32)
    const tampered = Buffer.from(parts.join(':')).toString('base64url')

    await assert.rejects(
      () => TokenService.rotateRefreshToken(tampered),
      'Invalid or expired refresh token'
    )
  })
})
