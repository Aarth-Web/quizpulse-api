import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import bcrypt from 'bcrypt'
import User from '#models/user'
import TokenService from '#services/token_service'
import { registerValidator } from '#validators/auth/register'
import { loginValidator } from '#validators/auth/login'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const { email, password, name } = await request.validateUsing(registerValidator)

    const existing = await User.query().where({ email }).first()
    if (existing) {
      throw new Exception('Validation failed', {
        status: 422,
        code: 'E_VALIDATION_ERROR',
      })
    }

    const user = await User.create({
      email,
      passwordHash: password,
      name,
      provider: 'local',
    })

    const accessToken = TokenService.issueAccessToken(user.id, 'user')
    const refreshToken = await TokenService.issueRefreshToken(user.id)

    return response.status(201).json({
      data: { user, accessToken, refreshToken },
      error: null,
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.query().where({ email }).first()
    if (!user || !user.passwordHash) {
      throw new Exception('Invalid credentials', { status: 401, code: 'E_INVALID_CREDENTIALS' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new Exception('Invalid credentials', { status: 401, code: 'E_INVALID_CREDENTIALS' })
    }

    const accessToken = TokenService.issueAccessToken(user.id, 'user')
    const refreshToken = await TokenService.issueRefreshToken(user.id)

    return response.json({
      data: { user, accessToken, refreshToken },
      error: null,
    })
  }

  async refresh({ request, response }: HttpContext) {
    const { refreshToken } = request.only(['refreshToken'])
    if (!refreshToken) {
      throw new Exception('Missing refresh token', { status: 400, code: 'E_MISSING_TOKEN' })
    }

    const tokens = await TokenService.rotateRefreshToken(refreshToken)

    return response.json({ data: tokens, error: null })
  }

  async guest({ response }: HttpContext) {
    const token = TokenService.issueGuestToken()
    return response.json({ data: { accessToken: token }, error: null })
  }

  async googleRedirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async googleCallback({ ally, response }: HttpContext) {
    const google = ally.use('google')
    const googleUser = await google.user()

    const user = await User.updateOrCreate(
      { email: googleUser.email },
      {
        name: googleUser.name,
        provider: 'google',
        providerId: googleUser.id,
      }
    )

    const accessToken = TokenService.issueAccessToken(user.id, 'user')
    const refreshToken = await TokenService.issueRefreshToken(user.id)

    return response.json({
      data: { user, accessToken, refreshToken },
      error: null,
    })
  }
}
