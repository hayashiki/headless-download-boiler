import request from 'supertest'
import {app} from './app.js'

describe(`Hello world`, () => {
  test(`GET`, (done) => {
    request(app)
        .get(`/`)
        .then((res) => {
          expect(res.statusCode).toBe(200)
          expect(res.text).toBe(`OK`)
          done()
        })
        .catch((err) => {
          done(err)
        })
  })
})
