import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'session_participants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('session_id')
        .notNullable()
        .references('id')
        .inTable('quiz_sessions')
        .onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users')
      table.integer('score').notNullable().defaultTo(0)
      table.integer('rank').nullable()
      table.timestamp('finished_at', { useTz: true }).nullable()
      table.boolean('is_winner').notNullable().defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.unique(['session_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
