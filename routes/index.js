const router = require('express').Router()

/* Page d'accueil */
router.get('/', function(req, res, next) {
  res.format({
    html: () => { 
      res.render('index', { title: 'Mon super projet' })
    },
    json: () => { 
      res.send({"message": "Hi you ! :)"}) 
    }
})
})

module.exports = router
