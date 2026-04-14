import { test } from '@japa/runner'
import TokenService from '#services/token_service'
import Quiz from '#models/quiz'

test.group('Quiz endpoints', () => {
  test('GET /quizzes with guest token returns 200', async ({ client, assert }) => {
    const guestToken = TokenService.issueGuestToken()

    const res = await client
      .get('/api/v1/quizzes')
      .header('Authorization', `Bearer ${guestToken}`)

    res.assertStatus(200)
    assert.isArray(res.body().data)
  })

  test('GET /quizzes/:id returns quiz with questions', async ({ client, assert }) => {
    const guestToken = TokenService.issueGuestToken()
    const quiz = await Quiz.query().firstOrFail()

    const res = await client
      .get(`/api/v1/quizzes/${quiz.id}`)
      .header('Authorization', `Bearer ${guestToken}`)

    res.assertStatus(200)
    assert.equal(res.body().data.id, quiz.id)
    assert.isArray(res.body().data.questions)
  })

  test('GET /quizzes/:id with invalid id returns error', async ({ client }) => {
    const guestToken = TokenService.issueGuestToken()

    const res = await client
      .get('/api/v1/quizzes/00000000-0000-0000-0000-000000000000')
      .header('Authorization', `Bearer ${guestToken}`)

    res.assertStatus(404)
  })
})
