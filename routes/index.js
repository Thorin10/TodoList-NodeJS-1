const router = require('express').Router()

/* Page d'accueil */
router.get('/', function(req, res, next) {
  res.redirect('/todos/')
})

module.exports = router
