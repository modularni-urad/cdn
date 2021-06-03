import express from 'express'
import bodyParser from 'body-parser'
import initErrorHandlers from 'modularni-urad-utils/error_handlers'
import { required } from 'modularni-urad-utils/auth'
import files from './files'

export async function init (mocks = null) {
  const app = express()
  const JSONBodyParser = bodyParser.json({limit: '50mb'})

  app.get('/*', (req, res, next) => {
    files.getFile(req.params['0'], req.query, res, next).catch(next)
  })

  app.post('/:id/:name', required, JSONBodyParser, (req, res, next) => {
    files.upload(req.params.id, req.params.name, req.body)
      .then(r => res.status(201).json(r)).catch(next)
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
