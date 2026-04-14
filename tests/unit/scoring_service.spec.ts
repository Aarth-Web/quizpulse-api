import { test } from '@japa/runner'
import redis from '@adonisjs/redis/services/main'
import ScoringService from '#services/scoring_service'
import RedisKeys from '#constants/redis_keys'

test.group('ScoringService.recalculateRanks', (group) => {
  const sessionId = 'test-session-ranks'

  group.setup(async () => {
    await redis.hset(RedisKeys.sessionScores(sessionId), {
      alice: '30',
      bob: '50',
      charlie: '50',
    })
    await redis.hset(RedisKeys.sessionFinishTimes(sessionId), {
      bob: '1000',
      charlie: '2000',
    })
  })

  group.teardown(async () => {
    await redis.del(
      RedisKeys.sessionScores(sessionId),
      RedisKeys.sessionFinishTimes(sessionId)
    )
  })

  test('sorts by score descending', async ({ assert }) => {
    const ranks = await ScoringService.recalculateRanks(sessionId)
    assert.equal(ranks[0].userId, 'bob')
    assert.equal(ranks[2].userId, 'alice')
  })

  test('tiebreaks by finishTime ascending', async ({ assert }) => {
    const ranks = await ScoringService.recalculateRanks(sessionId)
    const tied = ranks.filter((r) => r.score === 50)

    assert.lengthOf(tied, 2)
    assert.equal(tied[0].userId, 'bob')
    assert.equal(tied[1].userId, 'charlie')
  })

  test('assigns sequential rank numbers', async ({ assert }) => {
    const ranks = await ScoringService.recalculateRanks(sessionId)

    assert.equal(ranks[0].rank, 1)
    assert.equal(ranks[1].rank, 2)
    assert.equal(ranks[2].rank, 3)
  })

  test('handles empty session gracefully', async ({ assert }) => {
    const ranks = await ScoringService.recalculateRanks('empty-session-' + Date.now())
    assert.isArray(ranks)
    assert.lengthOf(ranks, 0)
  })
})
