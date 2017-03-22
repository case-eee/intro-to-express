const app = require('../server')
const assert = require('chai').assert
const request = require('request')

describe('Foods API', () => {
  before((done) => {
    this.port = 9999;
    this.request = request.defaults({ baseUrl: 'http://localhost:9999'})
    this.server = app.listen(this.port, (err, res) => {
      if (err) { done(err) }
      done()
    })
  })

  after(() => {
    this.server.close()
  })

  it('exists', () => {
    assert(app)
  })

  describe('GET to /api/foods', () => {
    beforeEach(() => { app.locals.foods = { grape: 5, orange: 15 } })

    it('returns list of all foods', (done) => {
      this.request.get('/api/foods', (err, res) => {
        if (err) { done(err) }
        assert.equal(res.statusCode, 200)
        assert.deepEqual(JSON.parse(res.body), app.locals.foods)
        done()
      })
    })
  })

  describe('GET to /api/foods/:name', () => {
    beforeEach(() => { app.locals.foods = { grape: 5} })
    it('return 404 if resource not found', (done) => {
      this.request.get('/api/foods/invalidfood', (err, res) => {
        if (err) { done(err) }
        assert.equal(res.statusCode, 404)
        done()
      })
    })

    it('returns name and calories if food is found', (done) => {
      this.request.get('/api/foods/grape', (err, res) => {
        if (err) { done(err) }
        assert.equal(res.statusCode, 200)
        assert.include(res.body, 'grape')
        assert.include(res.body, 5)
        done()
      })
    })
  })

  describe('PUT to /api/foods/:name', () => {
    beforeEach(() => { app.locals.foods = { grape: 5} })

    it('return 404 if resource not found', (done) => {
      this.request.put('/api/foods/invalidfood', (err, res) => {
        if (err) { done(err) }
        assert.equal(res.statusCode, 404)
        done()
      })
    })

    it('it receives calories and updates data', (done) => {
      const food = {calories: 10, name: "grape"}
      this.request.put('/api/foods/grape', {form: food}, (err, res) => {
        if (err) { done(err) }
        assert.equal(app.locals.foods['grape'], 10)
        assert.include(res.body, food.calories)
        assert.include(res.body, food.name)
        done()
      })
    })

    it('it receives name and updates data', (done) => {
      const food = {calories: 5, name: "pineapple"}
      this.request.put('/api/foods/grape', {form: food}, (err, res) => {
        if (err) { done(err) }
        assert.equal(app.locals.foods['pineapple'], 5)
        const foodCount = Object.keys(app.locals.foods).length
        assert.equal(foodCount, 1)
        assert.include(res.body, food.calories)
        assert.include(res.body, food.name)
        done()
      })
    })
  })

  describe('DELETE to /api/foods', () => {
    beforeEach(() => { app.locals.foods = { grape: 5} })

    it('return 404 if resource not found', (done) => {
      this.request.delete('/api/foods/invalidfood', (err, res) => {
        if (err) { done(err) }
        assert.equal(res.statusCode, 404)
        done()
      })
    })

    it('deletes food if food is present', (done) => {
      this.request.delete('/api/foods/grape', (err, res) => {
        if (err) { done(err) }
        const foodCount = Object.keys(app.locals.foods).length
        assert.equal(foodCount, 0)
        done()
      })
    })
  })


  describe('POST to /api/foods', () => {
    beforeEach(() => {
      app.locals.foods = {}
    })

    it('does not return 404', (done) => {
      this.request.post('/api/foods', (err, res) => {
        if (err) { done(err) }
        assert.notEqual(res.statusCode, 404)
        done()
      })
    })

    it('it receives and stores data', (done) => {
      const food = {calories: 10, name: "banana"}

      this.request.post('/api/foods', {form: food}, (err, res) => {
        if (err) { done(err) }
        const foodCount = Object.keys(app.locals.foods).length
        assert.equal(foodCount, 1)
        assert.include(res.body, food.calories)
        assert.include(res.body, food.name)
        done()
      })
    })

    it('returns 422 if it does not include a name', (done) => {
      const invalidFood = {calories: 10}

      this.request.post('/api/foods', {form: invalidFood}, (err, res) => {
        if (err) { done(err) }
        const foodCount = Object.keys(app.locals.foods).length
        assert.equal(foodCount, 0)
        assert.equal(res.statusCode, 422)
        done()
      })
    })

    it('returns 422 if it does not include a calories', (done) => {
      const invalidFood = {name: "food"}

      this.request.post('/api/foods', {form: invalidFood}, (err, res) => {
        if (err) { done(err) }
        const foodCount = Object.keys(app.locals.foods).length
        assert.equal(foodCount, 0)
        assert.equal(res.statusCode, 422)
        done()
      })
    })

    it('returns 422 if name is not unique', (done) => {
      app.locals.foods["banana"] = 10
      const food = {name: 'banana', calories: 100}
      this.request.post('/api/foods', {form: food}, (err, res) => {
        if (err) { done(err) }
        const foodCount = Object.keys(app.locals.foods).length
        assert.equal(foodCount, 1)
        assert.include(res.body, "banana already exists!")
        assert.equal(res.statusCode, 422)
        done()
      })
    })
  })
})