const router = require('express').Router()
const db = require('sqlite')
var hat = require('hat')
const bcrypt = require('bcrypt')

db.open('expressapi.db')

// GET ALL USERS
router.get('/', (req, res, next) => {
  const limit = `LIMIT ${req.query.limit || 100}`
  const offset = `OFFSET ${ req.query.offset || 0}`
  query = `SELECT * FROM users ${limit} ${offset}`

  db.all(query)
  .then((users) => {
    res.format({
      html: () => { res.render('users/index', {
        title: 'Liste des utilisateurs',
        users: users
      }) }, 
      json: () => { res.send(users) }
    })
  }).catch(next)
})

// GET USER BY ID
router.get('/show/:userId', (req, res, next) => {
  db.get('SELECT * FROM users WHERE ROWID = ?', req.params.userId)
  .then((user) => {
    res.format({
      html: () => { res.render('users/show', {
          title: 'Utilisateur ' + user.pseudo,
          user: user,
          userId: req.params.userId
      }) }, 
      json: () => { res.send(user) }
    })
  }).catch(next)
})

// GET ADD USER FORM
router.get('/add', (req, res, next) => {
  res.format({
    html: () => { 
      res.render('users/add', {
        title: 'Ajouter un utilisateur'
      }) 
    }, 
    json: () => { res.send({"message": "Use POST method on /users/ url to add user"}) }
  })
})

// GET EDIT USER FORM
router.get('/:userId/edit', (req, res, next) => {
  db.get('SELECT * FROM users WHERE ROWID = ?', req.params.userId)
  .then((user) => {
    res.format({
      html: () => { res.render('users/edit', {
          title: 'Utilisateur ' + user.pseudo,
          user: user,
          userId: req.params.userId
      }) }, 
      json: () => { res.send(user) }
    })
  }).catch(next)
})

// POST USER
router.post('/', (req, res, next) => {
  if(!req.body.pseudo || !req.body.email || !req.body.firstname || !req.body.lastname || !req.body.password) {
    next(new Error('All fields must be given.'))
  }

  bcrypt.hash(req.body.password, 10)
  .then((hash) => {
    db.run(
      "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
      hat(), req.body.pseudo, req.body.email, hash, req.body.firstname, req.body.lastname, new Date(), null
    )}) 
  .then(() => {
    res.redirect('/users')
  })
  .catch(next)
})

// DELETE USER
router.delete('/:userId', (req, res, next) => {
  db.run('DELETE FROM users WHERE ROWID = ?', req.params.userId)
  .then(() => {
    res.redirect('/users')
  }).catch(next)
})

// UPDATE USER
router.put('/:userId', (req, res, next) => {
  console.log(req.body, req.params.userId)
  db.run("UPDATE users SET pseudo = ?, email = ?, firstname = ?, lastname = ?, updatedAt= ? WHERE rowid = ?",req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date(), req.params.userId)
  .then(() => {
    console.log(req.params.userId)
    res.redirect('/users/show/' + req.params.userId)
  }).catch(next)
})

module.exports = router
