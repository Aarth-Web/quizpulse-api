import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8).maxLength(64),
    name: vine.string().trim().minLength(2).maxLength(50),
  })
)
