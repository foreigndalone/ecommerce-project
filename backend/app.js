import express from 'express'
import cors from 'cors'

import { connectDB } from './config/db.js'

import usersRouter from './routes/usersRouter.js'
import { ensureUsersEmailIndex } from './models/usersModel.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.use(express.json())

app.use(cors({ origin: FRONTEND_ORIGIN }))

app.use('/api/users', usersRouter)

const startServer = async () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required')
    }

    await connectDB()
    await ensureUsersEmailIndex()

    app.listen(PORT, () => {
        console.log(`🚀 server is running on ${PORT}`)
    })
}

startServer()
