import { api, assert, section, summary, randomEmail } from './helpers.js'

async function main() {
  console.log('\n=== AUTH FLOW E2E TEST ===\n')

  const email = randomEmail()
  const password = 'password123'
  let accessToken: string
  let refreshToken: string

  // ── Register ──────────────────────────────────────────────
  section('Register')
  const reg = await api('POST', '/auth/register', { email, password, name: 'E2E User' })
  assert(reg.status === 201, `Register returns 201 (got ${reg.status})`)
  assert(!!reg.data.data.accessToken, 'Register returns accessToken')
  assert(!!reg.data.data.refreshToken, 'Register returns refreshToken')
  accessToken = reg.data.data.accessToken
  refreshToken = reg.data.data.refreshToken

  // ── Get Profile ───────────────────────────────────────────
  section('Get Profile')
  const profile = await api('GET', '/me', undefined, accessToken)
  assert(profile.status === 200, `GET /me returns 200 (got ${profile.status})`)
  assert(profile.data.data.email === email, 'Profile email matches')

  // ── Update Profile ────────────────────────────────────────
  section('Update Profile')
  const updated = await api('PUT', '/me', { name: 'Updated E2E', avatarIndex: 7 }, accessToken)
  assert(updated.status === 200, `PUT /me returns 200 (got ${updated.status})`)
  assert(updated.data.data.name === 'Updated E2E', 'Name updated')
  assert(updated.data.data.avatarIndex === 7, 'Avatar index updated')

  // ── Refresh Token ─────────────────────────────────────────
  section('Refresh Token')
  const refresh = await api('POST', '/auth/refresh', { refreshToken })
  assert(refresh.status === 200, `Refresh returns 200 (got ${refresh.status})`)
  assert(!!refresh.data.data.accessToken, 'Refresh returns new accessToken')
  assert(refresh.data.data.refreshToken !== refreshToken, 'Refresh token rotated')
  accessToken = refresh.data.data.accessToken

  // ── Verify new token works ────────────────────────────────
  section('Verify Rotated Token')
  const profile2 = await api('GET', '/me', undefined, accessToken)
  assert(profile2.status === 200, 'New access token works for /me')

  // ── Guest Token ───────────────────────────────────────────
  section('Guest Token')
  const guest = await api('POST', '/auth/guest')
  assert(guest.status === 200, `Guest returns 200 (got ${guest.status})`)
  const guestToken = guest.data.data.accessToken
  assert(!!guestToken, 'Guest returns accessToken')

  // ── Guest can browse quizzes ──────────────────────────────
  section('Guest Browsing')
  const quizzes = await api('GET', '/quizzes', undefined, guestToken)
  assert(quizzes.status === 200, `Guest GET /quizzes returns 200 (got ${quizzes.status})`)

  // ── Guest cannot create sessions ──────────────────────────
  section('Guest Restrictions')
  const blocked = await api('POST', '/sessions', { quizId: '00000000-0000-0000-0000-000000000000' }, guestToken)
  assert(blocked.status === 401, `Guest POST /sessions returns 401 (got ${blocked.status})`)

  // ── Login with wrong password ─────────────────────────────
  section('Login Errors')
  const badLogin = await api('POST', '/auth/login', { email, password: 'wrongpassword' })
  assert(badLogin.status === 401, `Wrong password returns 401 (got ${badLogin.status})`)

  // ── Login with correct password ───────────────────────────
  const goodLogin = await api('POST', '/auth/login', { email, password })
  assert(goodLogin.status === 200, `Correct login returns 200 (got ${goodLogin.status})`)

  // ── Summary ───────────────────────────────────────────────
  const passed = summary()
  process.exit(passed ? 0 : 1)
}

main().catch((err) => {
  console.error('\nFATAL:', err.message)
  process.exit(1)
})
