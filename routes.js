import files from './files'
import _ from 'underscore'
import urlencode from 'urlencode'
import path from 'path'

function _thisHost (req) {
  const fwServer = req.headers['x-forwarded-server']
  return fwServer ? `https://${fwServer}` : `${req.protocol}://${req.headers.host}`
}

export default function (ctx) {
  const { app, auth, JSONBodyParser, express } = ctx

  app.post('/:id/:name', auth.required, JSONBodyParser, (req, res, next) => {
    const domain = process.env.DOMAIN || req.hostname
    files.upload(req.params.id, req.params.name, req.body, domain)
      .then(r => res.status(201).json(r)).catch(next)
  })

  app.get('/resize/', (req, res, next) => {
    req.query.url = urlencode.decode(req.query.url)
    const url = req.query.url.match(/^https?:\/\//) 
      ? req.query.url
      : _thisHost(req) + '/' + req.query.url
    const query = _.omit(req.query, 'url')
    files.getFile(url, query).then(info => {
      res.set('content-type', info['content-type'])
      info.stream.pipe(res)
    }).catch(err => {
      console.error(err)
      next(err)
    })
  })

  app.get('/isimage', (req, res, next) => {
    files.isImage(req.query.url).then(r => res.json(r)).catch(next)
  })

  if (process.env.DOMAIN) { // for testing
    app.use('/', express.static(path.join(files.DATA_FOLDER, process.env.DOMAIN)))
  }
}