import express, { json } from 'express'
import { Redis } from './redis'
import { Task, User } from './pg'
import { Op } from 'sequelize'
import { uuid } from 'uuidv4'
import cookieParser from 'cookie-parser'

const app = express()
app.use(cookieParser())
app.use(express.json());
const port = 1234

app.get('/', (req, res) => {
    res.send('Hello from Express.js example RESTful api!')
})

app.get('/auth', async (req, res) => {
    if (!req.query['name']) return res.send('Write your name in GET "name" arg')

    const user = await User.findOne({
        where: {
            name: {
                [Op.iLike]: req.query['name']
            }
        }
    })

    if (!user) return res.send('We have no user with given name!')

    const session = uuid()

    // Simple cache invalidation on auth
    if (Redis.del(`user_${session}`))

        await Redis.set(`user_${session}`, JSON.stringify(user), { EX: 120 })
    res.cookie('session', session)

    res.send('You are authed for only two minutes! Do something REST')
})


app.post('/addUser', async (req, res) => {
    const session = req.cookies['session']
    if (!session) return res.status(401).send()

    const user = JSON.parse(await Redis.get(`user_${session}`))
    if (!user) return res.status(403)


    const newUserData = req.body
    console.log(newUserData)

    const result = await new User(newUserData).save()
    if (result) res.send('OK')
    else res.status(406).send()
})


app.get('/getUser/:studcode', async (req, res) => {
    const session = req.cookies['session']
    if (!session) return res.status(401).send()

    const user = JSON.parse(await Redis.get(`user_${session}`))
    if (!user) return res.status(403)

    const result = await User.findOne({
        where: {
            studnumber: {
                [Op.iLike]: req.params.studcode
            }
        }
    })

    if (result) res.json(result)
    else res.status(406).send()
})


app.post('/rmUser/:studcode', async (req, res) => {
    const session = req.cookies['session']
    if (!session) return res.status(401).send()

    const user = JSON.parse(await Redis.get(`user_${session}`))
    if (!user) return res.status(403)
    if (!user.isadmin) return res.status(403).send('You dont have admin privileges to do that!')

    const userToRemove = await User.findOne({
        where: {
            studnumber: {
                [Op.iLike]: req.params.studcode
            }
        }
    })

    if (userToRemove) {
        userToRemove.destroy()
        res.send('OK')
    }
    else res.status(406).send('Cannot find or remove user with stud number: ' + req.params.studcode)
})

app.post('/addTask', async (req, res) => {
    const session = req.cookies['session']
    if (!session) return res.status(401).send()

    const user = JSON.parse(await Redis.get(`user_${session}`))
    if (!user) return res.status(403)
    if (!user.isadmin) return res.status(403).send('You dont have admin privileges to do that!')

    const newTask = req.body
    console.log(newTask)

    const result = await new Task(newTask).save()
    if (result) res.send('OK')
    else res.status(406).send()
})

app.get('/listTasks', async (req, res) => {
    const session = req.cookies['session']
    if (!session) return res.status(401).send()

    const user = JSON.parse(await Redis.get(`user_${session}`))
    if (!user) return res.status(403)
    if (!user.isadmin) return res.status(403).send('You dont have admin privileges to do that!')

    const tasksList = await Task.findAll()

    if (tasksList) res.json(tasksList)
    else res.status(406).send()
})

app.get('/task/:id', async (req, res) => {
    const session = req.cookies['session']
    if (!session) return res.status(401).send()

    const user = JSON.parse(await Redis.get(`user_${session}`))
    if (!user) return res.status(403)

    const task = await Task.findOne({ where: { id: req.params.id } })

    if (task) res.json(task)
    else res.status(406).send()
})

app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
    Redis.PING()
})