import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'answers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('session_id').notNullable().references('id').inTable('quiz_sessions')
      table
        .uuid('participant_id')
        .notNullable()
        .references('id')
        .inTable('session_participants')
      table.uuid('question_id').notNullable().references('id').inTable('questions')
      table.integer('chosen_index').notNullable()
      table.boolean('is_correct').notNullable()
      table.timestamp('answered_at', { useTz: true }).notNullable()

      table.unique(['participant_id', 'question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
