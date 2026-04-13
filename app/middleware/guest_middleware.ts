import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { verifyJwt, type JwtPayload } from '#middleware/jwt_middleware'

export default class GuestMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const header = ctx.request.header('authorization')

    if (!header) {
      ctx.jwtPayload = {
        role: 'guest',
        isGuest: true,
      } as JwtPayload
      return next()
    }

    ctx.jwtPayload = verifyJwt(header)
    return next()
  }
}
