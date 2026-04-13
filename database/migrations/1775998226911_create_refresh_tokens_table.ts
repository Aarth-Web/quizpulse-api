import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refresh_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('token_hash').notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.boolean('revoked').notNullable().defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
