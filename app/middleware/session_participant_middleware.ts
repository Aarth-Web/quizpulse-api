import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SessionParticipant from '#models/session_participant'
import NotParticipantException from '#exceptions/not_participant_exception'

export default class SessionParticipantMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const sessionId = ctx.params.id
    const userId = ctx.jwtPayload.sub

    if (!userId) {
      throw new NotParticipantException()
    }

    const participant = await SessionParticipant.query()
      .where({ sessionId, userId })
      .first()

    if (!participant) {
      throw new NotParticipantException()
    }

    ctx.participant = participant
    return next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    participant: SessionParticipant
  }
}
