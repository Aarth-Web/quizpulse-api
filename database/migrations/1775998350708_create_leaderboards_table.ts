import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leaderboards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().unique().references('id').inTable('users')
      table.integer('total_score').notNullable().defaultTo(0)
      table.integer('wins').notNullable().defaultTo(0)
      table.integer('games_played').notNullable().defaultTo(0)

      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
