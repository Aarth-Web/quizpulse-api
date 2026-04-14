import { test } from '@japa/runner'
import User from '#models/user'
import TokenService from '#services/token_service'

test.group('User endpoints', (group) => {
  let userId: string
  let accessToken: string
  const testEmail = `user-test-${Date.now()}@example.com`

  group.setup(async () => {
    const user = await User.create({
      email: testEmail,
      passwordHash: 'plaintext-will-be-hashed',
      name: 'User Test',
      provider: 'local',
    })
    userId = user.id
    accessToken = TokenService.issueAccessToken(userId, 'user')
  })

  group.teardown(async () => {
    await User.query().where('id', userId).delete()
  })

  test('GET /me returns user profile', async ({ client, assert }) => {
    const res = await client
      .get('/api/v1/me')
      .header('Authorization', `Bearer ${accessToken}`)

    res.assertStatus(200)
    assert.equal(res.body().data.email, testEmail)
  })

  test('PUT /me updates name and avatar', async ({ client, assert }) => {
    const res = await client
      .put('/api/v1/me')
      .header('Authorization', `Bearer ${accessToken}`)
      .json({ name: 'New Name', avatarIndex: 5 })

    res.assertStatus(200)
    assert.equal(res.body().data.name, 'New Name')
    assert.equal(res.body().data.avatarIndex, 5)
  })

  test('GET /me without auth returns 401', async ({ client }) => {
    const res = await client.get('/api/v1/me')

    res.assertStatus(401)
  })
})
