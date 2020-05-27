import express from 'express'
import urlencode from 'urlencode'
import axios from 'axios'
import sharp from 'sharp'

async function init (host, port) {
  const app = express()

  app.get('/', async (req, res, next) => {
    const url = urlencode.decode(req.query.url)
    const JPG_OPTS = { quality: 85, progressive: true }
    const WIDTH = parseInt(req.query.w) || 800
    const resizer = sharp().resize(WIDTH).jpeg(JPG_OPTS).on('error', err => {
      return err.toString().indexOf('unsupported image format') >= 0
        ? next(`${url} není odkaz na obrázek! (${err.toString()})`)
        : err.toString()
    })

    axios({ method: 'get', url, responseType: 'stream' }).then(response => {
      response.data.pipe(resizer).pipe(res)
    }).catch(next)
  })

  app.use((err, req, res, next) => { // ERROR HANDLING
    res.send(err.toString())
  })
  app.listen(port, host, (err) => {
    if (err) throw err
    console.log(`frodo do magic on ${host}:${port}`)
  })
}

try {
  const host = process.env.HOST || '127.0.0.1'
  const port = process.env.PORT
  init(host, port)
} catch (err) {
  console.error(err)
}
