import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('quiz_id')
        .notNullable()
        .references('id')
        .inTable('quizzes')
        .onDelete('CASCADE')
      table.text('text').notNullable()
      table.json('options').notNullable()
      table.integer('correct_index').notNullable()
      table.integer('points').notNullable().defaultTo(10)
      table.integer('order').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
