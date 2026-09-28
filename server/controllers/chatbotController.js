const mongoose = require('mongoose')
const { GoogleGenAI } = require('@google/genai')
const Article = require('../models/Article')
const Category = require('../models/Category')
const Character = require('../models/Character')
const Content = require('../models/Content')
const Event = require('../models/Event')
const Media = require('../models/Media')
const Merch = require('../models/Merch')
const Release = require('../models/Release')

const MODEL = 'gemini-3.8-flash'
const MAX_MESSAGE_LENGTH = 700
const MAX_HISTORY_ITEMS = 8
const MAX_GEMINI_ATTEMPTS = 3

const PROJECT_CATEGORIES = [
  'Anime',
  'Gaming',
  'Movies',
  'TV Shows',
  'K-Pop',
  'Comics',
  'Manga',
  'Cosplay',
]

const ROUTES = [
  ['Home', '/'],
  ['Explore categories', '/explore'],
  ['Articles', '/articles'],
  ['Characters', '/characters'],
  ['Media', '/media'],
  ['Events', '/events'],
  ['Upcoming releases', '/releases'],
  ['Merch showcases', '/merch'],
  ['Feedback', '/feedback'],
  ['Login', '/login'],
  ['Register', '/register'],
  ['Dashboard', '/dashboard'],
  ['Bookmarks', '/bookmarks'],
  ['Submit content', '/submit-content'],
]

function cleanText(value, max = 700) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function validateHistory(history) {
  if (!Array.isArray(history)) return []

  return history
    .filter((item) => ['user', 'assistant'].includes(item?.role) && cleanText(item?.content, 1000))
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item.role,
      content: cleanText(item.content, 1000),
    }))
}

async function safeSummary(label, model, filter, select, titleKey = 'title') {
  if (mongoose.connection.readyState !== 1) {
    return `${label}: database unavailable.`
  }

  try {
    const [count, docs] = await Promise.all([
      model.countDocuments(filter).maxTimeMS(1500),
      model.find(filter).select(select).sort({ updatedAt: -1, createdAt: -1 }).limit(5).lean().maxTimeMS(1500),
    ])
    const names = docs.map((doc) => cleanText(doc[titleKey] || doc.name, 80)).filter(Boolean)
    return `${label}: ${count}${names.length ? `; examples: ${names.join(', ')}` : ''}.`
  } catch {
    return `${label}: unavailable.`
  }
}

async function buildPlatformContext() {
  const summaries = await Promise.all([
    safeSummary('Active categories', Category, { status: 'active' }, 'name slug', 'name'),
    safeSummary('Published content cards', Content, { status: 'published' }, 'title categorySlug type'),
    safeSummary('Published articles', Article, { status: 'published' }, 'title categorySlug fandom'),
    safeSummary('Published characters', Character, { status: 'published' }, 'name fandom categorySlug', 'name'),
    safeSummary('Media records', Media, {}, 'title fandom category mediaType'),
    safeSummary('Events', Event, {}, 'title city eventType startDate'),
    safeSummary('Releases', Release, {}, 'title fandom releaseType status releaseDate'),
    safeSummary('Merch showcases', Merch, {}, 'name fandom category', 'name'),
  ])

  return [
    `Project: Fan Hub Plus, a Fandom Pulse themed MERN fan community site.`,
    `Approved categories: ${PROJECT_CATEGORIES.join(', ')}.`,
    `Public navigation: ${ROUTES.map(([label, path]) => `${label} (${path})`).join('; ')}.`,
    `Feature map: Explore shows the eight fandom categories and category cards; Articles lists fan articles; Characters has character listings and details; Media has media records, media details, galleries, embedded videos/trailers, and user media ratings; Events lists events; Releases lists upcoming/released fandom releases; Merch lists merchandise showcases only; Feedback accepts visitor feedback; authenticated users can use Dashboard, Profile, Bookmarks, Submit Content, and My Submissions.`,
    `Important limits: Fan Hub Plus does not provide in-site checkout, direct ticket purchasing, live human support chat, database editing through this bot, or invented recommendations for unavailable records.`,
    ...summaries,
  ].join('\n')
}

function buildSystemInstruction(platformContext) {
  return [
    'You are PulseBot, the friendly AI guide for Fan Hub Plus.',
    'Answer accurately and concisely. For Fan Hub Plus questions, rely on the context below and never invent pages, records, events, products, counts, prices, or admin capabilities.',
    'You may answer general fandom questions from broad knowledge, but clearly separate general fandom information from what is actually available on Fan Hub Plus.',
    'For follow-up questions, use the recent conversation transcript provided in the user prompt.',
    'If information is unavailable in the context, say so and suggest a relevant existing page to browse.',
    'When helpful, include short internal links in markdown format like [Explore](/explore), using only listed public navigation routes.',
    'Keep answers warm, direct, and practical. Do not expose secrets, API details, environment variables, stack traces, or backend implementation details.',
    platformContext,
  ].join('\n')
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

function buildConversationPrompt(message, history) {
  const transcript = history.length
    ? history.map((item) => `${item.role === 'assistant' ? 'PulseBot' : 'Visitor'}: ${item.content}`).join('\n')
    : 'No previous conversation.'

  return [
    'Recent conversation:',
    transcript,
    '',
    'Current visitor message:',
    message,
    '',
    'Respond as PulseBot. If the visitor asks to navigate, provide the relevant existing link rather than pretending to click.',
  ].join('\n')
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableGeminiError(error) {
  const status = Number(error?.status || error?.code || error?.response?.status)
  const message = String(error?.message || '')
  return [500, 502, 503, 504].includes(status) || /\b(500|502|503|504)\b/.test(message)
}

function getGeminiStatus(error) {
  const status = Number(error?.status || error?.code || error?.response?.status)
  if (status) return status

  const match = String(error?.message || '').match(/\b(400|401|403|404|429|500|502|503|504)\b/)
  return match ? Number(match[1]) : 0
}

async function generateWithRetry(client, payload) {
  let lastError = null

  for (let attempt = 1; attempt <= MAX_GEMINI_ATTEMPTS; attempt += 1) {
    try {
      return await client.models.generateContent(payload)
    } catch (error) {
      lastError = error
      if (!isRetryableGeminiError(error) || attempt === MAX_GEMINI_ATTEMPTS) {
        throw error
      }
      await wait(350 * attempt)
    }
  }

  throw lastError
}

async function chatWithBot(req, res, next) {
  try {
    const message = cleanText(req.body?.message, MAX_MESSAGE_LENGTH + 1)
    if (!message) {
      res.status(400)
      throw new Error('Message is required.')
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      res.status(400)
      throw new Error(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`)
    }

    const client = getClient()
    if (!client) {
      res.status(503)
      throw new Error('AI chat is not configured yet. Add GEMINI_API_KEY on the backend to enable it.')
    }

    const platformContext = await buildPlatformContext()
    const history = validateHistory(req.body?.history)

    const response = await generateWithRetry(client, {
      model: MODEL,
      contents: buildConversationPrompt(message, history),
      config: {
        systemInstruction: buildSystemInstruction(platformContext),
        maxOutputTokens: 520,
      },
    })

    const reply = cleanText(response.text, 1800)
    res.json({
      model: MODEL,
      reply: reply || 'I could not generate a helpful response right now. Please try again.',
    })
  } catch (error) {
    const geminiStatus = getGeminiStatus(error)

    if (geminiStatus === 429) {
      res.status(429)
      return next(new Error('AI chat quota is temporarily unavailable. Please try again later.'))
    }
    if (isRetryableGeminiError(error)) {
      res.status(503)
      return next(new Error('PulseBot is temporarily busy. Please try again in a moment.'))
    }
    if (geminiStatus === 401 || geminiStatus === 403) {
      res.status(503)
      return next(new Error('AI chat is unavailable because the Gemini API key could not be authorized.'))
    }
    if (geminiStatus === 404) {
      res.status(503)
      return next(new Error('AI chat model is unavailable for this Gemini account. Please check the backend model setting.'))
    }
    return next(error)
  }
}

module.exports = { chatWithBot }
