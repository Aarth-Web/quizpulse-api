import vine from '@vinejs/vine'

export const joinSessionValidator = vine.compile(
  vine.object({
    inviteCode: vine.string().trim().toUpperCase().minLength(6).maxLength(10),
  })
)
