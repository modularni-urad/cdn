import express from 'express'
import initErrorHandlers from 'modularni-urad-utils/error_handlers'
import { required } from 'modularni-urad-utils/auth'
import initRoutes from './routes.js'

export async function init (mocks = null) {
  const app = express()
  const auth = mocks ? mocks.auth : { required }
  const JSONBodyParser = express.json({limit: '50mb'})

  initRoutes({ app, auth, JSONBodyParser, express })

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
