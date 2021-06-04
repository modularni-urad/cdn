import files from './files'
import _ from 'underscore'
import urlencode from 'urlencode'
import path from 'path'

export default function (ctx) {
  const { app, auth, JSONBodyParser, express } = ctx

  app.post('/api/:id/:name', auth.required, JSONBodyParser, (req, res, next) => {
    const domain = process.env.DOMAIN || req.hostname
    files.upload(req.params.id, req.params.name, req.body, domain)
      .then(r => res.status(201).json(r)).catch(next)
  })

  app.get('/resize/', (req, res, next) => {
    req.query.url = urlencode.decode(req.query.url)
    const url = req.query.url.match(/^https?:\/\//) 
      ? req.query.url 
      : `${req.protocol}://${req.headers.host}${req.query.url}`
    const query = _.omit(req.query, 'url')
    files.getFile(url, query).then(info => {
      res.set('content-type', info['content-type'])
      info.stream.pipe(res)
    }).catch(next)
  })

  app.get('/api/isimage', (req, res, next) => {
    files.isImage(req.query.url).then(r => res.json(r)).catch(next)
  })

  if (process.env.DOMAIN) { // for testing
    app.use('/', express.static(path.join(files.DATA_FOLDER, process.env.DOMAIN)))
  }
}