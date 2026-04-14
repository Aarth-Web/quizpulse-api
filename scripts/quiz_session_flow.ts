import { api, assert, section, summary, randomEmail, connectWs, sleep } from './helpers.js'

async function main() {
  console.log('\n=== QUIZ SESSION FLOW E2E TEST ===\n')

  // ── Register two users ────────────────────────────────────
  section('Register Host & Player')

  const hostEmail = randomEmail()
  const playerEmail = randomEmail()

  const hostReg = await api('POST', '/auth/register', {
    email: hostEmail,
    password: 'password123',
    name: 'Host',
  })
  assert(hostReg.status === 201, 'Host registered')
  const hostToken = hostReg.data.data.accessToken
  const hostUserId = hostReg.data.data.user.id

  const playerReg = await api('POST', '/auth/register', {
    email: playerEmail,
    password: 'password123',
    name: 'Player',
  })
  assert(playerReg.status === 201, 'Player registered')
  const playerToken = playerReg.data.data.accessToken

  // ── Get quizzes and pick one ──────────────────────────────
  section('Fetch Quizzes')

  const quizList = await api('GET', '/quizzes', undefined, hostToken)
  assert(quizList.status === 200, 'GET /quizzes returns 200')
  assert(quizList.data.data.length > 0, 'At least one quiz exists')

  const quizId = quizList.data.data[0].id

  // ── Create session ────────────────────────────────────────
  section('Create Session')

  const createRes = await api('POST', '/sessions', { quizId }, hostToken)
  assert(createRes.status === 201, `Session created (${createRes.status})`)
  const sessionId = createRes.data.data.id
  const inviteCode = createRes.data.data.inviteCode
  assert(!!inviteCode, `Invite code: ${inviteCode}`)

  // ── Player joins session ──────────────────────────────────
  section('Player Joins')

  const joinRes = await api('POST', '/sessions/join', { inviteCode }, playerToken)
  assert(joinRes.status === 200, `Player joined session (${joinRes.status})`)

  // ── Verify session shows 2 participants ───────────────────
  const showRes = await api('GET', `/sessions/${sessionId}`, undefined, hostToken)
  assert(showRes.status === 200, 'GET session returns 200')
  assert(showRes.data.data.participants.length === 2, `2 participants in session`)

  // ── Connect WebSockets ────────────────────────────────────
  section('WebSocket Connect')

  const hostWs = await connectWs(hostToken, sessionId)
  assert(true, 'Host WS connected')

  const playerWs = await connectWs(playerToken, sessionId)
  assert(true, 'Player WS connected')

  await sleep(500)

  // ── Start session ─────────────────────────────────────────
  section('Start Session')

  const startRes = await api('POST', `/sessions/${sessionId}/start`, undefined, hostToken)
  assert(startRes.status === 200, `Session started (${startRes.status})`)

  const hostStart = await hostWs.waitForEvent('quiz:start')
  assert(!!hostStart, 'Host received quiz:start')
  assert(hostStart.sessionId === sessionId, 'quiz:start has correct sessionId')

  const playerStart = await playerWs.waitForEvent('quiz:start')
  assert(!!playerStart, 'Player received quiz:start')

  // ── Fetch questions ───────────────────────────────────────
  section('Fetch Questions')

  const quizDetail = await api('GET', `/quizzes/${quizId}`, undefined, hostToken)
  assert(quizDetail.status === 200, 'GET quiz detail returns 200')
  const questions = quizDetail.data.data.questions
  assert(questions.length > 0, `${questions.length} questions available`)

  // ── Answer all questions ──────────────────────────────────
  section('Answer Questions')

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]

    const hostAnswer = await api(
      'POST',
      `/sessions/${sessionId}/answers`,
      { questionId: q.id, chosenIndex: q.correctIndex },
      hostToken
    )
    assert(hostAnswer.status === 200, `Host answered Q${i + 1} (correct)`)

    const playerAnswer = await api(
      'POST',
      `/sessions/${sessionId}/answers`,
      { questionId: q.id, chosenIndex: (q.correctIndex + 1) % 4 },
      playerToken
    )
    assert(playerAnswer.status === 200, `Player answered Q${i + 1} (wrong)`)
  }

  // ── Wait for quiz:end ─────────────────────────────────────
  section('Quiz End')

  const endPayload = await hostWs.waitForEvent('quiz:end', 10000)
  assert(!!endPayload, 'Host received quiz:end')
  assert(endPayload.finalRanks.length === 2, 'Final ranks has 2 entries')

  const winner = endPayload.finalRanks[0]
  assert(winner.userId === hostUserId, `Winner is host (all correct answers)`)
  assert(winner.rank === 1, 'Winner has rank 1')

  // ── Check leaderboard ─────────────────────────────────────
  section('Leaderboard')

  await sleep(500)
  const lb = await api('GET', '/leaderboard', undefined, hostToken)
  assert(lb.status === 200, `GET /leaderboard returns 200 (${lb.status})`)
  assert(lb.data.data.length > 0, 'Leaderboard has entries')

  // ── Cleanup ───────────────────────────────────────────────
  hostWs.close()
  playerWs.close()

  const passed = summary()
  process.exit(passed ? 0 : 1)
}

main().catch((err) => {
  console.error('\nFATAL:', err.message)
  process.exit(1)
})
