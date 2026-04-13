import vine from '@vinejs/vine'

export const createSessionValidator = vine.compile(
  vine.object({
    quizId: vine.string().uuid(),
  })
)
