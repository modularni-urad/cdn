import _ from 'underscore'
import { TNAMES } from '../../consts'
const Knex = require('knex')
const knexHooks = require('knex-hooks')

// const rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 15)
// process.env.DATABASE_URL = rand + 'test.sqlite'

export default function initDB (migrationsDir) {
  const opts = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL
    },
    useNullAsDefault: true,
    debug: true,
    migrations: {
      directory: migrationsDir
    }
  }
  const knex = Knex(opts)
  knexHooks(knex)
  knex.addHook('after', 'insert', TNAMES.FILES, (when, method, table, params) => {
    const data = knexHooks.helpers.getInsertData(params.query)
    data.id = params.result[0]
    params.result[0] = data
  })

  return knex.migrate.latest().then(() => {
    return knex
  })
}
