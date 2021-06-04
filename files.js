import path from 'path'
import urlencode from 'urlencode'
import axios from 'axios'
import fs from 'fs'
import sharp from 'sharp'
import _ from 'underscore'

const DATA_FOLDER = path.resolve(process.env.DATA_FOLDER || './.data')

async function upload (id, name, body, domain) {
  const fileName = path.join(DATA_FOLDER, domain, `${id}/${name}`)
  try {
    await fs.promises.mkdir(path.dirname(fileName))
  } catch (e) {

  }
  return fs.promises.writeFile(fileName, Buffer.from(body.content, 'base64'))
}

function getModificator (query, fileAttrs) {
  if (!query.w) return
  const JPG_OPTS = { quality: 85, progressive: true }
  return sharp().resize(parseInt(query.w)).jpeg(JPG_OPTS)
    .on('error', err => {
      const e = err.toString().indexOf('unsupported image format') >= 0
        ? `${url} není odkaz na obrázek! (${err.toString()})`
        : err.toString()
      res.end(err)
  })
}

async function getFile (url, query) {
  const res = await axios({ method: 'get', url, responseType: 'stream' })
  const info = { stream: res.data, headers: res.headers }
  const modificator = getModificator(query, info.attrs)
  info.stream = modificator ? info.stream.pipe(modificator) : info.stream
  return info
}

async function isImage (url) {
  url = urlencode.decode(url)
  const ress = await axios.get(url)
  return ress.headers['content-type'].indexOf('image') >= 0
}

export default { upload, getFile, isImage, getModificator, DATA_FOLDER }
