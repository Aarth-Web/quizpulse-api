import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { Exception } from '@adonisjs/core/exceptions'
import jwt from 'jsonwebtoken'
import env from '#start/env'

export interface JwtPayload {
  sub?: string
  role: 'user' | 'guest'
  isGuest: boolean
  iat?: number
  exp?: number
}

export function verifyJwt(authHeader: string | undefined): JwtPayload {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Exception('Unauthorized', { status: 401, code: 'E_UNAUTHORIZED' })
  }

  const token = authHeader.slice(7)

  let decoded: jwt.JwtPayload
  try {
    decoded = jwt.verify(token, env.get('JWT_SECRET')) as jwt.JwtPayload
  } catch {
    throw new Exception('Unauthorized', { status: 401, code: 'E_UNAUTHORIZED' })
  }

  return {
    sub: decoded.sub,
    role: decoded.role as 'user' | 'guest',
    isGuest: decoded.role === 'guest',
    iat: decoded.iat,
    exp: decoded.exp,
  }
}

export default class JwtMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const payload = verifyJwt(ctx.request.header('authorization'))

    if (payload.isGuest) {
      throw new Exception('Unauthorized', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    ctx.jwtPayload = payload
    return next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    jwtPayload: JwtPayload
  }
}
