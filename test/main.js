/* global describe before after */
import chai from 'chai'
import path from 'path'
import temp from 'temp'
const chaiHttp = require('chai-http')
const fs = require('fs')
chai.use(chaiHttp)

const port = process.env.PORT || 3333
const g = {
  baseurl: `http://localhost:${port}`,
  UID: 110,
  usergroups: []
}
const mocks = {
  auth: {
    required: (req, res, next) => { return next() },
    requireMembership: (gid) => (req, res, next) => {
      return g.usergroups.indexOf(gid) >= 0 ? next() : next(403)
    },
    getUID: (req) => g.UID
  }
}

describe('app', () => {
  before(done => {
    temp.track()
    temp.mkdir('testdata', (err, dirPath) => {
      if (err) return done(err)
      process.env.DATA_FOLDER = dirPath
      const init = require('../server').init
      init(mocks).then(app => {
        g.server = app.listen(port, '127.0.0.1', (err) => {
          if (err) return done(err)
          done()
        })
      }).catch(done)
    })
  })
  after(done => {
    temp.cleanup((err, stats) => {
      if (err) return done(err)
      console.log(stats)
      g.server.close(err => {
        return err ? done(err) : done()
      })
    })
  })

  describe('API', () => {
    //
    const submodules = [
      './files'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
