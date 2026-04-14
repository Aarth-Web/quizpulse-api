import { api, assert, section, summary, randomEmail, connectWs, sleep } from './helpers.js'

async function main() {
  console.log('\n=== ERROR FLOW E2E TEST ===\n')

  // ── Setup: register two users, create quiz session ────────
  section('Setup')

  const hostEmail = randomEmail()
  const playerEmail = randomEmail()
  const outsiderEmail = randomEmail()

  const hostReg = await api('POST', '/auth/register', {
    email: hostEmail,
    password: 'password123',
    name: 'Error Host',
  })
  const hostToken = hostReg.data.data.accessToken

  const playerReg = await api('POST', '/auth/register', {
    email: playerEmail,
    password: 'password123',
    name: 'Error Player',
  })
  const playerToken = playerReg.data.data.accessToken

  const outsiderReg = await api('POST', '/auth/register', {
    email: outsiderEmail,
    password: 'password123',
    name: 'Outsider',
  })
  const outsiderToken = outsiderReg.data.data.accessToken

  const quizList = await api('GET', '/quizzes', undefined, hostToken)
  const quizId = quizList.data.data[0].id

  const createRes = await api('POST', '/sessions', { quizId }, hostToken)
  const sessionId = createRes.data.data.id
  const inviteCode = createRes.data.data.inviteCode
  assert(createRes.status === 201, 'Session created for error tests')

  // ── 1. Start session with only 1 player -> 400 ───────────
  section('Start with 1 Player')

  const hostWs = await connectWs(hostToken, sessionId)
  await sleep(300)

  const start1 = await api('POST', `/sessions/${sessionId}/start`, undefined, hostToken)
  assert(start1.status === 400, `Start with 1 player returns 400 (got ${start1.status})`)

  hostWs.close()

  // ── 2. Invalid JWT -> 401 ─────────────────────────────────
  section('Invalid JWT')

  const badJwt = await api('GET', '/me', undefined, 'not-a-real-token')
  assert(badJwt.status === 401, `Invalid JWT returns 401 (got ${badJwt.status})`)

  const noAuth = await api('GET', '/me')
  assert(noAuth.status === 401, `No auth header returns 401 (got ${noAuth.status})`)

  // ── 3. Validation errors -> 422 ───────────────────────────
  section('Validation Errors')

  const badRegister = await api('POST', '/auth/register', { email: 'not-an-email', password: '1' })
  assert(badRegister.status === 422, `Bad register returns 422 (got ${badRegister.status})`)

  const badSession = await api('POST', '/sessions', { quizId: 'not-a-uuid' }, hostToken)
  assert(badSession.status === 422, `Bad quizId returns 422 (got ${badSession.status})`)

  // ── 4. Non-participant tries to answer -> 403 ────────────
  section('Non-Participant Answer')

  // First let's start a proper session with 2 players
  const joinRes = await api('POST', '/sessions/join', { inviteCode }, playerToken)
  assert(joinRes.status === 200, 'Player joined session')

  const hostWs2 = await connectWs(hostToken, sessionId)
  const playerWs = await connectWs(playerToken, sessionId)
  await sleep(500)

  const startRes = await api('POST', `/sessions/${sessionId}/start`, undefined, hostToken)
  assert(startRes.status === 200, 'Session started with 2 players')

  await hostWs2.waitForEvent('quiz:start')

  const quizDetail = await api('GET', `/quizzes/${quizId}`, undefined, hostToken)
  const questionId = quizDetail.data.data.questions[0].id

  const outsiderAnswer = await api(
    'POST',
    `/sessions/${sessionId}/answers`,
    { questionId, chosenIndex: 0 },
    outsiderToken
  )
  assert(outsiderAnswer.status === 403, `Non-participant answer returns 403 (got ${outsiderAnswer.status})`)

  // ── 5. Duplicate answer -> 409 ────────────────────────────
  section('Duplicate Answer')

  const first = await api(
    'POST',
    `/sessions/${sessionId}/answers`,
    { questionId, chosenIndex: 0 },
    hostToken
  )
  assert(first.status === 200, 'First answer accepted')

  const duplicate = await api(
    'POST',
    `/sessions/${sessionId}/answers`,
    { questionId, chosenIndex: 1 },
    hostToken
  )
  assert(duplicate.status === 409, `Duplicate answer returns 409 (got ${duplicate.status})`)

  // ── Cleanup ───────────────────────────────────────────────
  hostWs2.close()
  playerWs.close()

  const passed = summary()
  process.exit(passed ? 0 : 1)
}

main().catch((err) => {
  console.error('\nFATAL:', err.message)
  process.exit(1)
})
