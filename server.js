import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import { attachPaginate } from 'knex-paginate'
import initErrorHandlers from 'modularni-urad-utils/error_handlers'
import initAuth from 'modularni-urad-utils/auth'
import initDB from 'modularni-urad-utils/db'
import files from './files'

export async function init (mocks = null) {
  const migrationsDir = path.join(__dirname, 'migrations')
  const knex = mocks
    ? await mocks.dbinit(migrationsDir)
    : await initDB(migrationsDir)
  attachPaginate()
  const app = express()
  const JSONBodyParser = bodyParser.json({limit: '50mb'})
  const auth = initAuth(app)

  app.get('/', (req, res, next) => {
    files.list(req.query, knex).then(info => {
      res.json(info)
      next()
    }).catch(next)
  })

  app.put('/:id',
    JSONBodyParser,
    (req, res, next) => {
      files.update(req.params.id, req.body, knex)
        .then(updated => { res.json(updated[0]) })
        .catch(next)
    })

  app.get('/file/*', (req, res, next) => {
    files.getFile(req.params['0'], req.query, res, next, knex).then(f => {
      const modificator = files.getModificator(req.query, f.attrs)
      modificator
        ? f.stream.pipe(modificator).pipe(res)
        : f.stream.pipe(res)
    }).catch(next)
  })

  app.post('/', JSONBodyParser, (req, res, next) => {
    files.upload(req.body, knex).then(r => res.status(201).json(r)).catch(next)
  })

  app.get('/_isimage', (req, res, next) => {
    files.isImage(req.query.url).then(r => res.json(r)).catch(next)
  })

  initErrorHandlers(app) // ERROR HANDLING
  return app
}

if (process.env.NODE_ENV !== 'test') {
  const host = process.env.HOST || '127.0.0.1'
  const port = process.env.PORT || 3000
  init().then(app => {
    app.listen(port, host, (err) => {
      if (err) throw err
      console.log(`frodo do magic on ${host}:${port}`)
    })
  }).catch(err => {
    console.error(err)
  })
}
