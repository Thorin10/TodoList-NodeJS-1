const db = require('sqlite')
const bodyParser = require('body-parser')
var methodOverride = require('method-override')

const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

app.set('views', './views') 
app.set('view engine', 'pug')

// DATABASE
db.open('expressapi.db').then(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (pseudo, email, firstname, lastname, createdAt, updatedAt)')
    .then(() => {
      console.log('> Database ready')
    }).catch((err) => { // Si on a eu des erreurs
      console.error('ERR> ', err)
    })
});

// BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(methodOverride('_method'))

// LOGGER
app.use((req, res, next) => {
  next()
  console.log('REQUEST: ' + req.method + ' ' + req.url)
})

// DEFAULT ROUTE
app.get('/', (req, res, next) => {
  res.send('Bienvenue sur notre superbe API!')
})


// GET ALL USERS
app.get('/users', (req, res, next) => {
  const limit = `LIMIT ${req.query.limit || 100}`
  const offset = `OFFSET ${ req.query.offset || 0}`
  query = `SELECT * FROM users ${limit} ${offset}`

  db.all(query)
  .then((users) => {
    res.format({
      html: () => { res.render('index', {
        title: 'Liste des utilisateurs',
        users: users
      }) }, 
      json: () => { res.send(users) }
    })
  }).catch(next)

  // const wheres = []

  // if (req.query.firstname) {
  //   wheres.push(`firstname LIKE '%${req.query.firstname}%'`)
  // }

  // if (req.query.lastname) {
  //   wheres.push(`lastname LIKE '%${req.query.lastname}%'`)
  // }

  // const limit = `LIMIT ${req.query.limit || 100}`
  // const offset = `OFFSET ${ req.query.offset || 0}`
  // const where = wheres.length > 0 ? `WHERE ${wheres.join(' AND ')}` : ''
  // let order = ''
  // let reverse = ''
  // if (req.query.order && req.query.reverse) {
  //   order = `ORDER BY ${req.query.order}`
  //   if (req.query.reverse == '1') {
  //     reverse = 'DESC'
  //   } else if (req.query.reverse == '0') {
  //     reverse = 'ASC'
  //   }
  // }
  
  // query = `SELECT * FROM users ${where} ${order} ${reverse} ${limit} ${offset}`

  // db.all(query)
  // .then((users) => {
  //   res.send(users)
  // }).catch(next)
})

// GET USER BY ID
app.get('/users/show/:userId', (req, res, next) => {
  db.get('SELECT * FROM users WHERE ROWID = ?', req.params.userId)
  .then((user) => {
    res.format({
      html: () => { res.render('show', {
          title: 'Utilisateur ' + user.pseudo,
          user: user,
          userId: req.params.userId
      }) }, 
      json: () => { res.send(user) }
    })
  }).catch(next)
})

// GET ADD USER FORM
app.get('/users/add', (req, res, next) => {
  res.render('add', {
    title: 'Ajouter un utilisateur'
  })
})

// GET EDIT USER FORM
app.get('/users/:userId/edit', (req, res, next) => {
  db.get('SELECT * FROM users WHERE ROWID = ?', req.params.userId)
  .then((user) => {
    res.format({
      html: () => { res.render('edit', {
          title: 'Utilisateur ' + user.pseudo,
          user: user,
          userId: req.params.userId
      }) }, 
      json: () => { res.send(user) }
    })
  }).catch(next)
})

// POST USER
app.post('/users', (req, res, next) => {
  if(!req.body.pseudo || !req.body.email || !req.body.firstname || !req.body.lastname) {
    next(new Error('All fields must be given.'))
  }

  db.run("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date(), null)
  .then(() => {
    res.redirect('/users')
  })
  .catch(next)
})

// DELETE USER
app.delete('/users/:userId', (req, res, next) => {
  db.run('DELETE FROM users WHERE ROWID = ?', req.params.userId)
  .then(() => {
    res.redirect('/users')
  }).catch(next)
})

// UPDATE USER
app.put('/users/:userId', (req, res, next) => {
  console.log(req.body, req.params.userId)
  db.run("UPDATE users SET pseudo = ?, email = ?, firstname = ?, lastname = ?, updatedAt= ? WHERE rowid = ?",req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date(), req.params.userId)
  .then(() => {
    console.log(req.params.userId)
    res.redirect('/users/show/' + req.params.userId)
  }).catch(next)
})

// ERROR
app.use((err, req, res, next) => {
  console.log('ERR: ' + err)
  res.status(500)
  res.send('Server Error')
})

// 404
app.use((req, res) => {
  res.status(501)
  res.end('Not implemented')
})

app.listen(PORT, () => {
  console.log('Server running on port: ' + PORT)
})