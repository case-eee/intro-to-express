const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.set('port', process.env.PORT || 3000)
app.locals.title = 'Quantified Self'
app.locals.foods = {}
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

app.get('/', (req, res) => {
  res.send(app.locals.title)
});

app.get('/api/foods', (req, res) => {
  const boo = 'wahoo'
  const woo = 'bahoo'
  console.log('hit the server')
  res.json({boo, woo})
})

app.post('/api/foods', (req, res) => {
  const calories = req.body.calories
  const name = req.body.name
  if (app.locals.foods[name]) { return res.status(422).send(`${name} already exists!`)}
  if (name && calories) {
    app.locals.foods[name] = calories
    return  res.status(201).json({name, calories})
  }
  return res.status(422).send({ error: 'Needs name and calories' })
})

app.get('/api/foods/:name', (req, res) => {
  const name = req.params.name
  const calories = app.locals.foods[name]
  if (!calories) { return res.sendStatus(404) }
  res.json({name, calories})
})

app.put('/api/foods/:name', (req, res) => {
  const oldName = req.params.name
  const calories = req.body.calories
  const newName = req.body.name
  if (calories && app.locals.foods[oldName]) {
    if (oldName != newName) { delete app.locals.foods[oldName] }
    app.locals.foods[newName] = calories
    return  res.json({newName, calories})
  }
  return res.status(404).send({ error: `Could not find food ${oldName}` })
})

app.delete('/api/foods/:name', (req, res) => {
  const name = req.params.name
  if (app.locals.foods[name]) { 
    delete app.locals.foods[name] 
    return res.status(200).send(`${name} deleted.`)
  }
  return res.status(404).send({ error: `Could not find food ${name}` })
})

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}`)
  })
}

module.exports = app;
