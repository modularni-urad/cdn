import path from 'path'
import urlencode from 'urlencode'
import axios from 'axios'
import fs from 'fs'
import sharp from 'sharp'
import _ from 'underscore'
import { whereFilter } from 'knex-filter-loopback'
import { TNAMES } from './consts'

const DATA_FOLDER = path.resolve(process.env.DATA_FOLDER || './.data')

function list (query, knex) {
  const perPage = Number(query.perPage) || 10
  const currentPage = Number(query.currentPage) || null
  const fields = query.fields ? query.fields.split(',') : null
  const sort = query.sort ? query.sort.split(':') : null
  const filter = query.filter ? JSON.parse(query.filter) : null
  let qb = knex(TNAMES.FILES)
  qb = filter ? qb.where(whereFilter(filter)) : qb
  qb = fields ? qb.select(fields) : qb
  qb = sort ? qb.orderBy(sort[0], sort[1]) : qb
  return currentPage ? qb.paginate({ perPage, currentPage }) : qb
}

function update (id, body, knex) {
  const data = _.omit(body, 'file')
  if (body.file) {
    _saveFile(body.file, id)
    data.ctype = body.file.type
    data.filename = body.file.name
  }  
  return knex(TNAMES.FILES).where({ id }).update(data).returning('*')
}

async function _saveFile(file, id) {
  if (!file.name || file.name.length > 128) {
    throw new Error('too long or undefined filename')
  }
  const fileName = path.join(DATA_FOLDER, `${id}/${file.name}`)
  try {
    await fs.promises.mkdir(path.dirname(fileName))
  } catch (e) {

  }  
  await fs.promises.writeFile(fileName, Buffer.from(file.content, 'base64'))
}

async function upload (body, knex) {
  const data = _.omit(body, 'file')
  data.ctype = body.file.type
  data.filename = body.file.name
  const newItems = await knex(TNAMES.FILES).insert(data).returning('*')
  _saveFile(body.file, newItems[0].id)
  return newItems[0]
}

function getModificator (query, fileAttrs) {
  return
  const JPG_OPTS = { quality: 85, progressive: true }
  const WIDTH = parseInt(query.w) || 800
  return sharp().resize(WIDTH).jpeg(JPG_OPTS).on('error', err => {
    return err.toString().indexOf('unsupported image format') >= 0
      ? next(`${url} není odkaz na obrázek! (${err.toString()})`)
      : err.toString()
  })
}

function _getRemoteFile (query) {
  const url = urlencode.decode(query.url)
  return axios({ method: 'get', url, responseType: 'stream' }).then(response => {
    return { stream: response.data, attrs: _.omit(response, 'data') }
  })
}

function _getLocalFile (reqPath, knex) {
  const parts = reqPath.split('/')
  const q = { id: parts[0], filename: parts[1] }
  return knex(TNAMES.FILES).where(q).then(found => {
    if (!found.length) throw Error(404)
    const fileName = path.join(DATA_FOLDER, reqPath)
    return { stream: fs.createReadStream(fileName), attrs: found }
  })
}

function getFile (reqPath, query, res, next, knex) {
  return reqPath ? _getLocalFile(reqPath, knex) : _getRemoteFile(query)
}

async function isImage (url) {
  url = urlencode.decode(url)
  const ress = await axios.get(url)
  return ress.headers['content-type'].indexOf('image') >= 0
}

export default { upload, getFile, isImage, getModificator, list, update }
