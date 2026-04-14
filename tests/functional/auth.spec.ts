import { test } from '@japa/runner'
import User from '#models/user'
import TokenService from '#services/token_service'

test.group('Auth endpoints', (group) => {
  const testEmail = `auth-test-${Date.now()}@example.com`

  group.teardown(async () => {
    await User.query().where('email', testEmail).delete()
  })

  test('POST /auth/register returns 201 with tokens', async ({ client, assert }) => {
    const res = await client.post('/api/v1/auth/register').json({
      email: testEmail,
      password: 'password123',
      name: 'Auth Test',
    })

    res.assertStatus(201)
    assert.isString(res.body().data.accessToken)
    assert.isString(res.body().data.refreshToken)
    assert.equal(res.body().data.user.email, testEmail)
  })

  test('POST /auth/register with duplicate email returns 422', async ({ client }) => {
    const res = await client.post('/api/v1/auth/register').json({
      email: testEmail,
      password: 'password123',
      name: 'Duplicate',
    })

    res.assertStatus(422)
  })

  test('POST /auth/login with valid creds returns tokens', async ({ client, assert }) => {
    const res = await client.post('/api/v1/auth/login').json({
      email: testEmail,
      password: 'password123',
    })

    res.assertStatus(200)
    assert.isString(res.body().data.accessToken)
    assert.isString(res.body().data.refreshToken)
  })

  test('POST /auth/login with wrong password returns 401', async ({ client }) => {
    const res = await client.post('/api/v1/auth/login').json({
      email: testEmail,
      password: 'wrongpassword',
    })

    res.assertStatus(401)
  })

  test('POST /auth/refresh rotates tokens', async ({ client, assert }) => {
    const user = await User.query().where('email', testEmail).firstOrFail()
    const refreshToken = await TokenService.issueRefreshToken(user.id)

    const res = await client.post('/api/v1/auth/refresh').json({ refreshToken })

    res.assertStatus(200)
    assert.isString(res.body().data.accessToken)
    assert.isString(res.body().data.refreshToken)
    assert.notEqual(res.body().data.refreshToken, refreshToken)
  })

  test('POST /auth/guest returns a guest JWT', async ({ client, assert }) => {
    const res = await client.post('/api/v1/auth/guest')

    res.assertStatus(200)
    assert.isString(res.body().data.accessToken)
  })
})
