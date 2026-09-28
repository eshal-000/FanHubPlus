const mongoose = require('mongoose')

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.warn('MONGODB_URI is not set. Skipping MongoDB connection for local scaffold startup.')
    return null
  }

  mongoose.set('strictQuery', true)

  const connection = await mongoose.connect(mongoUri, {
    autoCreate: process.env.MONGOOSE_AUTO_CREATE === 'true',
    autoIndex: process.env.MONGOOSE_AUTO_INDEX === 'true',
    dbName: process.env.MONGODB_DB_NAME || 'fanhubplus',
  })

  console.log(`MongoDB connected: ${connection.connection.host}`)
  return connection
}

module.exports = connectDB
