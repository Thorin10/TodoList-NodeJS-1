// Dépendances native
const path = require('path')
const _ = require('lodash') // ISEQUAL (compare 2 objets)
const db = require('sqlite') 
const bodyParser = require('body-parser')
var methodOverride = require('method-override')
const session = require('express-session')

const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

// Mise en place des vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('trust proxy', 1) 
app.use(session({ 
  secret: 'topkek', 
  resave: false, 
  saveUninitialized: true, 
  cookie: { 
    maxAge: 1000 * 60 * 60, 
    httpOnly: true
  } 
}))

// Middleware pour parser le body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

// On sert les fichiers statiques
app.use(express.static(path.join(__dirname, 'assets')))


// LOGGER
app.use((req, res, next) => {
  next()
  // console.log('REQUEST: ' + req.method + ' ' + req.url)
})

// DATABASE
db.open('expressapi.db').then(() => {
  let promises = []
  datas = [
    db.run('CREATE TABLE IF NOT EXISTS users (id, pseudo, email, password, firstname, lastname, createdAt, updatedAt)'),
    db.run('CREATE TABLE IF NOT EXISTS sessions (userId, accessToken, createdAt, expiresAt)')
  ]
  for (i in datas) {
    promises.push(datas[i]); 
  }
  return Promise.all(promises)
  .then(() => {
    console.log('> Database ready')
  }).catch((err) => { // Si on a eu des erreurs
    console.error('ERR> ', err)
  })
});


function isPublicRoute(currentRequest) {
  let publicUrls = [
    { "url": '/',
      "method": 'GET'},
    { "url": '/login',
      "method": 'GET'},
    { "url": '/login',
      "method": 'POST'},
    { "url": '/users/add',
      "method": 'GET' },
    { "url": '/users/',
      "method": 'POST'}
  ]
  for (let i = 0; i < publicUrls.length; i++) {
    if (_.isEqual(publicUrls[i], currentRequest) || _.includes(currentRequest.url, '/css/')) 
      return true
  }
  return false
}

// La liste des différents routeurs (dans l'ordre)
app.all('*', async (req, res, next) => {
  let currentRequest = {
    "url": req.url,
    "method": req.method
  }
  console.log('___REQUEST___', currentRequest)

  const isPublic = await isPublicRoute(currentRequest)

  if (isPublic) {
    console.log('____PUBLIC____')
    next()
  }
  else {
    console.log('____PRIVATE____')
    console.log('==> ContentType : ', req.get('Content-Type'))
    if (req.get('Content-Type') == 'application/json') 
      var userToken = req.headers['x-access-token']
    else 
      var userToken = req.session.accessToken

    console.log('___TOKEN___', userToken)

    db.get("SELECT * FROM sessions WHERE accessToken = ?", userToken)
    .then((session) => {
      if (new Date(session.expiresAt) < new Date()) {
        console.log('__SESSION EXPIRE__')
        db.run('DELETE FROM sessions WHERE accessToken = ?', req.session.accessToken)
        .then(() => {
            req.session.accessToken = null
            res.format({
              html: () => { res.redirect('/login') },
              json: () => { res.send({"message": "Vous devez vous reconnecter"}) }
            })
        })
      }
      else {
        console.log('___TOKEN OK___')
        next()
      }
    })
    .catch(() =>{
      console.log('___CATCH___')
      res.format({
        html: () => { res.redirect('/login') },
        json: () => { res.send({"message": "Vous n'êtes pas autorisé à accéder à ces informations"}) }
      })
    })
  }
})

app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/', require('./routes/sessions'))


// Erreur 404
app.use(function(req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Gestion des erreurs
// Notez les 4 arguments !!
app.use(function(err, req, res, next) {
  // Les données de l'erreur
  let data = {
    message: err.message,
    status: err.status || 500
  }

  // En mode développement, on peut afficher les détails de l'erreur
  if (app.get('env') === 'development') {
    data.error = err.stack
  }

  // On set le status de la réponse
  res.status(data.status)

  // Réponse multi-format
  res.format({
    html: () => { res.render('error', data) },
    json: () => { res.send(data) }
  })
})

app.listen(PORT, () => {
  console.log('Serveur démarré sur le port : ', PORT)
})