import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
config()

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME

const client = new MongoClient(uri)
let dbInstance = null

// Connection
export const connectDB = async () => {
    if (dbInstance) return dbInstance

    try {
        await client.connect()
        console.log('✅Successful connection MongoDB')
        dbInstance = client.db(dbName)
        return dbInstance
    } catch (error) {
        console.error('❌ Error connection MongoDB:', error)
        process.exit(1)
    }
}

// Getter
export const getDb = () => {
    if (!dbInstance) {
        throw new Error('Firstly, run connectDB command')
    }
    return dbInstance
}

export const closeDB = async () => {
    await client.close()
    dbInstance = null
}
