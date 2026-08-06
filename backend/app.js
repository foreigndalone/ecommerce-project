import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3000

app.use(express.json())

app.use(cors())

app.post('/api/users', (req, res) => {
    const { name, email, password, createdAt } = req.body

    // Logs data
    console.log('📥 Recieved data:')
    console.log({
        name,
        email,
        password,
        createdAt
    })

    //User's object for Redux state.currentUser
    res.status(201).json({
        id: Date.now().toString(), // фейковый ID
        name,
        email,
        role: 'user',
        createdAt
    })
})

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
})