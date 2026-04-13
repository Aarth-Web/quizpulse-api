import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quiz_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('quiz_id').notNullable().references('id').inTable('quizzes')
      table.uuid('host_user_id').notNullable().references('id').inTable('users')
      table
        .enu('status', ['WAITING', 'ACTIVE', 'DONE'], {
          useNative: true,
          enumName: 'quiz_sessions_status_enum',
        })
        .notNullable()
        .defaultTo('WAITING')
      table.string('invite_code').notNullable().unique()
      table.timestamp('started_at', { useTz: true }).nullable()
      table.timestamp('ended_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.rawQuery('DROP TYPE IF EXISTS quiz_sessions_status_enum').exec()
    })
  }
}
