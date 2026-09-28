const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const { errorHandler, notFound } = require('./middleware/error')
const adminRoutes = require('./routes/adminRoutes')
const articleRoutes = require('./routes/articleRoutes')
const authRoutes = require('./routes/authRoutes')
const bookmarkRoutes = require('./routes/bookmarkRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const characterRoutes = require('./routes/characterRoutes')
const chatbotRoutes = require('./routes/chatbotRoutes')
const contentRoutes = require('./routes/contentRoutes')
const eventRoutes = require('./routes/eventRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const mediaRoutes = require('./routes/mediaRoutes')
const merchRoutes = require('./routes/merchRoutes')
const profileRoutes = require('./routes/profileRoutes')
const releaseRoutes = require('./routes/releaseRoutes')
const submissionRoutes = require('./routes/submissionRoutes')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(
  cors({
    credentials: true,
    origin: clientUrl,
  }),
)
app.use(express.json({ limit: '1mb' }))


app.get('/api/health', (req, res) => {
  res.json({
    database: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected',
    project: 'Fan Hub Plus',
    status: 'ok',
    theme: 'Fandom Pulse',
  })
})


app.use('/api/media', mediaRoutes)


app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/chatbot', chatbotRoutes)


app.use('/api/categories', categoryRoutes)
app.use('/api/contents', contentRoutes)
app.use('/api/characters', characterRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/submissions', submissionRoutes)


app.use('/api/events', eventRoutes)
app.use('/api/releases', releaseRoutes)
app.use('/api/merch', merchRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

async function startServer() {
  await connectDB()

  const server = app.listen(port, () => {
    console.log(`Fan Hub Plus API listening on port ${port}`)
    console.log(`DB state: ${mongoose.connection.readyState === 1 ? 'connected' : 'NOT CONNECTED'}`)
  })

  if (process.argv.includes('--check')) {
    server.close(async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
      }
      console.log('Backend startup check passed')
    })
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Backend startup failed:', error.message)
    process.exit(1)
  })
}

module.exports = app
