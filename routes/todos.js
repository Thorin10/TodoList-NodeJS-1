const router = require('express').Router()
const db = require('sqlite')
const hat = require('hat')

db.open('expressapi.db')

// GET ALL TODOS
router.get('/', async (req, res, next) => {
    let contentType = req.get('Content-Type')
    if (contentType == 'application/json') 
        var userToken = req.headers['x-access-token']
    else 
        var userToken = req.session.accessToken

    let session = await db.get("SELECT * FROM sessions WHERE accessToken = ?", userToken)

    db.all("SELECT t.*, u.pseudo FROM todos t JOIN users u ON u.id = t.userId WHERE userId = ?", session.userId)
    .then((todos) => {
        res.format({
            html: () => { res.render('todos/index', {
              title: 'Liste de mes todos',
              todos: todos
            }) }, 
            json: () => { res.send(todos) }
        })
    }).catch(next)
})

// GET ADD TODO FORM
router.get('/add', (req, res, next) => {
    res.format({
        html: () => {
            res.render('todos/add', {
                title: 'Ajouter une todo',
                action: 'http://localhost:8080/todos/',
                todo: {
                    id: '',
                    message: ''
                }
            })
        },
        json: () => {
            res.send({"message" : "Use POST method en /todos/ url to add todo"})
        }
    })
})

// GET EDIT TODO FORM
router.get('/edit/:todoId', (req, res, next) => {
    db.get('SELECT * FROM todos WHERE id = ?', req.params.todoId)
    .then((todo) => {
        res.format({
            html: () => {
                res.render('todos/add', {
                    title: 'Modifier une todo',
                    action: 'http://localhost:8080/todos/' + todo.id + '?_method=PUT',
                    todo: todo
                })
            },
            json: () => {
                res.send({"message" : "Use PUT method en /todos/:todoId url to edit todo"})
            }
        })
    })
})

// POST TODO
router.post('/', async (req, res, next) => {
    if (!req.body.message) {
        next(new Error('All fields must be given'))
    }

    let contentType = req.get('Content-Type')
    if (contentType == 'application/json') 
        var userToken = req.headers['x-access-token']
    else 
        var userToken = req.session.accessToken

    let session = await db.get("SELECT * FROM sessions WHERE accessToken = ?", userToken)

    db.run(
        "INSERT INTO todos VALUES (?, ?, ?, ?, ?, ?)",
        hat(), session.userId, req.body.message, new Date().toLocaleString(), null, null
    )
    .then(() => {
        res.format({
            html: () => { res.redirect('/todos') },
            json: () => { res.send({"message": "Todo bien ajoutée"}) }
        })
    })
    .catch(next)
})

// UPDATE TODO STATE (AJAX)
router.put('/state', (req, res, next) => {
    let completedAt = (req.body.state == 'true') ? new Date().toLocaleString() : '0'; 
    db.run(
        "UPDATE todos SET completedAt = ? WHERE id = ?", 
        completedAt, req.body.todoId
    )
    .then(() => {
        res.send({ "output": "refresh" })
    }) 
    .catch(next)
})

// UPDATE TODO
router.put('/:todoId', (req, res, next) => {
    db.run(
        "UPDATE todos SET message = ?, updatedAt = ? WHERE id = ?",
        req.body.message, new Date().toLocaleString(), req.params.todoId
    )
    .then(() => {
        res.format({
            html: () => { res.redirect('/todos') },
            json: () => { res.send({"message": "Todo bien modifiée"}) }
        })
    })
    .catch(next)
})

//DELETE TODO
router.delete('/:todoId', (req, res, next) => {
    db.run("DELETE FROM todos WHERE id = ?", req.params.todoId)
    .then(() => {
        res.format({
            html: () => { res.redirect('/todos') },
            json: () => { res.send({"message": "Todo bien supprimée"}) }
        })
    })
    .catch(next)
})

module.exports = router