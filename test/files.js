/* global describe it */
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
  const file1 = {
    name: 'pok.md',
    type: 'text',
    size: content.length,
    content: Buffer.from(content, 'utf-8').toString('base64')
  }

  return describe('files', () => {
    // it('must not create a new item wihout approp group', async () => {
    //   const res = await r.post('/points').send(p1)
    //   res.status.should.equal(403)
    // })

    it('shall create a new item p1', async () => {
      // g.usergroups.push('waterman_admin')
      const res = await r.post('/').send(Object.assign({}, p1, { file : file1 }))
      p1.id = res.body.id
      p1.filename = file1.name
      p1.ctype = file1.type
      res.status.should.equal(201)
    })

    // it('shall update the item pok1', () => {
    //   const change = {
    //     name: 'pok1changed'
    //   }
    //   return r.put(`/tasks/${p.id}`).send(change)
    //   .set('Authorization', g.gimliToken)
    //   .then(res => {
    //     res.should.have.status(200)
    //   })
    // })

    it('shall get the pok1', async () => {
      const res = await r.get(`/file/${p1.id}/${p1.filename}`)
      res.status.should.equal(200)
      res.text.should.equal(content)
    })
  })
}
