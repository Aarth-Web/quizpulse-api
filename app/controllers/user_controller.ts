import type { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import User from '#models/user'
import { updateProfileValidator } from '#validators/user/update_profile'

export default class UserController {
  async show({ response, jwtPayload }: HttpContext) {
    const user = await User.find(jwtPayload.sub)
    if (!user) {
      throw new Exception('User not found', { status: 404, code: 'E_USER_NOT_FOUND' })
    }

    return response.json({ data: user, error: null })
  }

  async update({ request, response, jwtPayload }: HttpContext) {
    const data = await request.validateUsing(updateProfileValidator)

    const user = await User.findOrFail(jwtPayload.sub)
    user.merge(data)
    await user.save()

    return response.json({ data: user, error: null })
  }
}
