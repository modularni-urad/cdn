import { TNAMES } from '../consts'

exports.up = (knex, Promise) => {
  return knex.schema.createTable(TNAMES.FILES, (table) => {
    table.increments('id').primary()
    table.string('tags', 2048).notNullable()
    table.string('filename', 128)
    table.string('ctype', 128).notNullable()
    table.string('nazev', 512)
    table.string('popis', 2048)
    table.string('createdby', 64)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable(TNAMES.FILES)
}
