const router = require('express').Router()

/* Page d'accueil */
router.get('/', function(req, res, next) {
  let contentType = req.get('Content-Type')
  if (contentType == 'application/json') 
    var userToken = req.headers['x-access-token']
  else 
    var userToken = req.session.accessToken

  if (userToken) { 
    res.format({
      html: () => { res.redirect('/todos/') }, 
      json: () => res.send({ "message": "Bienvenue sur l'application de todolist !" })
    })
  } else {
    res.format({
      html: () => { res.render('index', { title: 'Bienvenue sur l\'application de todolist !' }) }, 
      json: () => res.send({ "message": "Bienvenue sur l'application de todolist !" })
    })
  }
})

module.exports = router
