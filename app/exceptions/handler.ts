import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import jwt from 'jsonwebtoken'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    const err = error as Record<string, any>

    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).json({
        data: null,
        error: 'Validation failed',
        messages: err.messages,
      })
    }

    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return ctx.response.status(401).json({
        data: null,
        error: 'Invalid or expired token',
      })
    }

    if (typeof err.status === 'number' && typeof err.code === 'string') {
      return ctx.response.status(err.status).json({
        data: null,
        error: err.message,
        code: err.code,
      })
    }

    if (!app.inProduction) {
      ctx.logger.error(err as Error)
    }

    return ctx.response.status(500).json({
      data: null,
      error: 'Internal server error',
    })
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
