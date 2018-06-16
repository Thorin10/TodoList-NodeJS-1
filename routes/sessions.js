const router = require('express').Router()
const db = require('sqlite')
var hat = require('hat')
const bcrypt = require('bcrypt')

db.open('expressapi.db')

Date.prototype.addHours = function(h) {    
    this.setTime(this.getTime() + (h*60*60*1000)); 
    return this;   
}

router.get('/login', (req, res, next) => {
    res.format({
        html: () => { 
            res.render('sessions/login', {
                title: 'Connexion'
            }) 
        },
        json: () => { 
            res.send({"message": 'Use POST method on /login with email & password'}) 
        }
    })
})

router.post('/login', async (req, res, next) => {
    if(!req.body.email || !req.body.password) {
        next(new Error('All fields must be given.'))
    }

    let user = await db.get("SELECT * FROM users WHERE email = ?", req.body.email)

    if (user) {
        let match = await bcrypt.compare(req.body.password, user.password)
        if (match) {
            let now = new Date().toLocaleString()
            let expire = new Date().addHours(2).toLocaleString()
            let token = hat()
            console.log('==> Generate TOKEN : ', token)
            db.run(
                "INSERT INTO sessions VALUES (?, ?, ?, ?)",
                user.id, token, now, expire 
            )
            .then(() => {
                res.format({
                    html: () => { 
                        req.session.accessToken = token
                        res.redirect('/users') 
                    },
                    json: () => { 
                        req.headers['x-access-token'] = token
                        res.send({"x-access-token": token}) 
                    }
                })
            })
        }
        else
            next(new Error('Mauvais password'))
    }
    else
        next(new Error('Aucun email associé'))
})

router.get('/logout', (req, res, next) => {
    let contentType = req.get('Content-Type')
    if (contentType == 'application/json') 
        var userToken = req.headers['x-access-token']
    else 
        var userToken = req.session.accessToken

    console.log('==> USERTOKEN TO DELETE', userToken)
    db.run('DELETE FROM sessions WHERE accessToken = ?', userToken)
    .then(() => {
        res.format({
            html: () => { 
                req.session.accessToken = null
                res.redirect('/') 
            },
            json: () => { 
                req.headers['x-access-token'] = null
                res.send({"message": "See you soon ;)"}) 
            }
        })
    }).catch(next)
})

module.exports = router