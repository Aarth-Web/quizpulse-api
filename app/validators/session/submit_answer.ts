import vine from '@vinejs/vine'

export const submitAnswerValidator = vine.compile(
  vine.object({
    questionId: vine.string().uuid(),
    chosenIndex: vine.number().min(0).max(3),
  })
)
