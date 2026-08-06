import express from 'express'
import cors from 'cors'

import { connectDB } from './config/db.js'

import usersRouter from './routes/usersRouter.js'
import { ensureUsersEmailIndex } from './models/usersModels.js'

const app = express()
const PORT = 3000

app.use(express.json())

app.use(cors())

app.use('/api/users', usersRouter)

const startServer = async () => {
    await connectDB()
    await ensureUsersEmailIndex()

    app.listen(PORT, () => {
        console.log(`🚀 server is running on ${PORT}`)
    })
}

startServer()
