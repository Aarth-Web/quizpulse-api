import { test } from '@japa/runner'
import User from '#models/user'
import Quiz from '#models/quiz'
import QuizSession from '#models/quiz_session'
import SessionParticipant from '#models/session_participant'
import TokenService from '#services/token_service'

test.group('Session endpoints', (group) => {
  let hostId: string
  let hostToken: string
  let quizId: string
  let sessionId: string
  const hostEmail = `session-host-${Date.now()}@example.com`

  group.setup(async () => {
    const host = await User.create({
      email: hostEmail,
      passwordHash: 'testpassword',
      name: 'Session Host',
      provider: 'local',
    })
    hostId = host.id
    hostToken = TokenService.issueAccessToken(hostId, 'user')

    const quiz = await Quiz.query().firstOrFail()
    quizId = quiz.id
  })

  group.teardown(async () => {
    if (sessionId) {
      await SessionParticipant.query().where('sessionId', sessionId).delete()
      await QuizSession.query().where('id', sessionId).delete()
    }
    await User.query().where('id', hostId).delete()
  })

  test('POST /sessions creates session with invite code', async ({ client, assert }) => {
    const res = await client
      .post('/api/v1/sessions')
      .header('Authorization', `Bearer ${hostToken}`)
      .json({ quizId })

    res.assertStatus(201)
    assert.isString(res.body().data.inviteCode)
    assert.equal(res.body().data.status, 'WAITING')
    sessionId = res.body().data.id
  })

  test('POST /sessions/join joins via invite code', async ({ client, assert }) => {
    const session = await QuizSession.findOrFail(sessionId)

    const player = await User.create({
      email: `session-player-${Date.now()}@example.com`,
      passwordHash: 'testpassword',
      name: 'Player',
      provider: 'local',
    })
    const playerToken = TokenService.issueAccessToken(player.id, 'user')

    const res = await client
      .post('/api/v1/sessions/join')
      .header('Authorization', `Bearer ${playerToken}`)
      .json({ inviteCode: session.inviteCode })

    res.assertStatus(200)
    assert.equal(res.body().data.id, sessionId)

    await SessionParticipant.query()
      .where({ sessionId, userId: player.id })
      .delete()
    await player.delete()
  })

  test('GET /sessions/:id returns session with participants', async ({ client, assert }) => {
    const res = await client
      .get(`/api/v1/sessions/${sessionId}`)
      .header('Authorization', `Bearer ${hostToken}`)

    res.assertStatus(200)
    const body: any = res.body()
    assert.equal(body.data.id, sessionId)
    assert.isArray(body.data.participants)
  })

  test('guest token cannot create session', async ({ client }) => {
    const guestToken = TokenService.issueGuestToken()

    const res = await client
      .post('/api/v1/sessions')
      .header('Authorization', `Bearer ${guestToken}`)
      .json({ quizId })

    res.assertStatus(401)
  })
})
