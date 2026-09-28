const router = require('express').Router()
const { chatWithBot } = require('../controllers/chatbotController')

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 12
const buckets = new Map()

function getClientKey(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || req.ip || req.socket?.remoteAddress || 'unknown'
}

function chatbotRateLimit(req, res, next) {
  const now = Date.now()
  const key = getClientKey(req)
  const recent = (buckets.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) {
    res.status(429)
    return next(new Error('Too many chatbot messages. Please wait a minute and try again.'))
  }

  recent.push(now)
  buckets.set(key, recent)

  if (buckets.size > 500) {
    for (const [bucketKey, timestamps] of buckets) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) {
        buckets.delete(bucketKey)
      }
    }
  }

  return next()
}

router.post('/', chatbotRateLimit, chatWithBot)

module.exports = router
