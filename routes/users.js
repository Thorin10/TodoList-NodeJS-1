const router = require('express').Router()
const db = require('sqlite')
const hat = require('hat')
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

// GET ADD USER FORM
router.get('/add', (req, res, next) => {
  res.format({
    html: () => { 
      res.render('users/add', {
        title: 'Ajouter un utilisateur',
        user: {
          id: '',
          pseudo: '',
          email: '',
          firstname: '',
          lasntame: ''
        },
        action: "http://localhost:8080/users/",
        password: true
      }) 
    }, 
    json: () => { res.send({"message": "Use POST method on /users/ url to add user"}) }
  })
})

// GET EDIT USER FORM
router.get('/edit/:userId', (req, res, next) => {
  db.get('SELECT * FROM users WHERE id = ?', req.params.userId)
  .then((user) => {
    res.format({
      html: () => { res.render('users/add', {
          title: 'Utilisateur ' + user.pseudo,
          user: user,
          action: "http://localhost:8080/users/" + user.id + "?_method=PUT",
          password: false
      }) }, 
      json: () => { res.send({"message": "Use PUT method on /users/:id url to edit user"}) }
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
      hat(), req.body.pseudo, req.body.email, hash, req.body.firstname, req.body.lastname, new Date().toLocaleString(), null
    )}) 
  .then(() => {
    res.format({
      html: () => { res.redirect('/users') },
      json: () => { res.send({"message": "Utilisateur bien ajouté"}) }
    })
  })
  .catch(next)
})

// DELETE USER
router.delete('/:userId', (req, res, next) => {
  db.run('DELETE FROM users WHERE id = ?', req.params.userId)
  .then(() => {
    res.format({
      html: () => { res.redirect('/users') },
      json: () => { res.send({"message": "Utilisateur bien supprimé"}) }
    })
  }).catch(next)
})

// GET USER BY ID
router.get('/:userId', (req, res, next) => {
  db.get('SELECT * FROM users WHERE id = ?', req.params.userId)
  .then((user) => {
    res.format({
      html: () => { res.render('users/show', {
          title: 'Utilisateur ' + user.pseudo,
          user: user,
      }) }, 
      json: () => { res.send(user) }
    })
  }).catch(next)
})

// UPDATE USER
router.put('/:userId', (req, res, next) => {
  db.run(
    "UPDATE users SET pseudo = ?, email = ?, firstname = ?, lastname = ?, updatedAt= ? WHERE id = ?",
    req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date().toLocaleString(), req.params.userId
  )
  .then(() => {
    res.format({
      html: () => { res.redirect('/users/' + req.params.userId) },
      json: () => { res.send({"message": "Utilisateur bien modifié"}) }
    })
  }).catch(next)
})

module.exports = router
