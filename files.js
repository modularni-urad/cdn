import path from 'path'
import urlencode from 'urlencode'
import axios from 'axios'
import fs from 'fs'
import mkdirp from 'mkdirp-promise'
import sharp from 'sharp'
import _ from 'underscore'

const DATA_FOLDER = path.resolve(process.env.DATA_FOLDER || './.data')

async function upload (id, name, body) {
  const fileName = path.join(DATA_FOLDER, `${id}/${name}`)
  await mkdirp(path.dirname(fileName))
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

function _getRemoteFile (query) {
  const url = urlencode.decode(query.url)
  return axios({ method: 'get', url, responseType: 'stream' }).then(response => {
    return { stream: response.data, attrs: _.omit(response, 'data') }
  })
}

async function _getLocalFile (reqPath) {
  const fileName = path.join(DATA_FOLDER, reqPath)
  try {
    const stat = await fs.promises.stat(fileName)
    return { stream: fs.createReadStream(fileName), attrs: stat }
  } catch (e) {
    throw new Error(404)
  }
}

async function getFile (reqPath, query, res) {
  const f = reqPath 
    ? await _getLocalFile(reqPath) 
    : await _getRemoteFile(query)
  const modificator = getModificator(query, f.attrs)
  const pipeline = modificator
    ? f.stream.pipe(modificator).pipe(res)
    : f.stream.pipe(res)
}

async function isImage (url) {
  url = urlencode.decode(url)
  const ress = await axios.get(url)
  return ress.headers['content-type'].indexOf('image') >= 0
}

export default { upload, getFile, isImage, getModificator }
