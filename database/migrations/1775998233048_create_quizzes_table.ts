import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quizzes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('category').notNullable()
      table
        .enu('difficulty', ['easy', 'medium', 'hard'], {
          useNative: true,
          enumName: 'quizzes_difficulty_enum',
        })
        .notNullable()
      table.integer('question_count').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS quizzes_difficulty_enum').exec()
    })
  }
}
