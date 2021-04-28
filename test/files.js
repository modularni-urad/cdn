/* global describe it */
import sharp from 'sharp'
const chai = require('chai')
chai.should()
// import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  const content = 'pok1 __with__ device'
  const p1 = {
    tags: 'ts',
    nazev: 'pokus'
  }
  const encContent = Buffer.from(content, 'utf-8').toString('base64')

  return describe('files', () => {
    // it('must not create a new item wihout approp group', async () => {
    //   const res = await r.post('/points').send(p1)
    //   res.status.should.equal(403)
    // })

    it('shall create a new item p1', async () => {
      // g.usergroups.push('waterman_admin')
      const res = await r.post('/1/pok.md').send({ content: encContent})
      res.status.should.equal(201)
    })

    it('shall get the pok1', async () => {
      const res = await r.get(`/1/pok.md`)
      res.status.should.equal(200)
      res.text.should.equal(content)
    })

    it('shall create a new png', async () => {
      const semiTransparentRedPng = await sharp({
        create: {
          width: 48,
          height: 48,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 0.5 }
        }
      }).png().toBuffer()
      const content = semiTransparentRedPng.toString('base64')
      const res = await r.post('/2/pok.png').send({ content })
      res.status.should.equal(201)
    })

    it('shall get the png with width modif', async () => {
      const res = await r.get(`/2/pok.png?w=200`)
      res.status.should.equal(200)
    })
  })
}
