const mongoose = require('mongoose')
const Article = require('../models/Article')
const Content = require('../models/Content')
const Submission = require('../models/Submission')
const { makeSlug } = require('../models/constants')
const { toCategorySlug } = require('../utils/category')

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'published']

function cleanString(value) {
  return String(value || '').trim()
}

function makeExcerpt(value) {
  const text = cleanString(value).replace(/\s+/g, ' ')
  if (text.length <= 180) return text
  return `${text.slice(0, 177).trim()}...`
}

function validateSubmissionPayload(payload) {
  if (!cleanString(payload.title)) return 'Title is required'
  if (!cleanString(payload.category)) return 'Category is required'
  if (!cleanString(payload.body)) return 'Submission body is required'
  return null
}

function submissionCreatePayload(body, userId) {
  return {
    body: cleanString(body.body),
    category: cleanString(body.category),
    fandom: cleanString(body.fandom),
    imageUrl: cleanString(body.imageUrl),
    status: 'pending',
    title: cleanString(body.title),
    userId,
  }
}

function publishTargetFromRequest(value) {
  const normalized = cleanString(value).toLowerCase()
  if (['article', 'articles'].includes(normalized)) return 'Article'
  return 'Content'
}

function categorySlugFor(submission) {
  return toCategorySlug(submission.category || submission.fandom)
}

function requirePublishableSubmission(submission) {
  const error = validateSubmissionPayload(submission)
  if (error) {
    const validationError = new Error(`Cannot publish submission: ${error}`)
    validationError.statusCode = 400
    throw validationError
  }
  if (!categorySlugFor(submission)) {
    const validationError = new Error('Cannot publish submission: Category slug could not be derived')
    validationError.statusCode = 400
    throw validationError
  }
}

function contentPayloadFromSubmission(submission, existing) {
  const title = cleanString(submission.title)
  const category = cleanString(submission.category)
  const fandom = cleanString(submission.fandom)
  const body = cleanString(submission.body)
  return {
    body,
    category,
    categorySlug: categorySlugFor(submission),
    description: makeExcerpt(body),
    fandom,
    imageUrl: cleanString(submission.imageUrl),
    publishedAt: existing?.publishedAt || new Date(),
    slug: existing?.slug || makeSlug(title),
    sourceSubmissionId: submission._id,
    status: 'published',
    submittedBy: submission.userId,
    title,
    type: existing?.type || 'article',
  }
}

function articlePayloadFromSubmission(submission, existing) {
  const title = cleanString(submission.title)
  const category = cleanString(submission.category)
  const fandom = cleanString(submission.fandom)
  const body = cleanString(submission.body)
  const imageUrl = cleanString(submission.imageUrl)
  return {
    author: existing?.author || 'Fan Hub Plus Community',
    body,
    category,
    categorySlug: categorySlugFor(submission),
    excerpt: makeExcerpt(body),
    fandom,
    imageUrl,
    imageUrls: imageUrl ? [imageUrl] : [],
    publishedAt: existing?.publishedAt || new Date(),
    slug: existing?.slug || makeSlug(title),
    sourceSubmissionId: submission._id,
    status: 'published',
    submittedBy: submission.userId,
    title,
  }
}

async function findLinkedPublication(Model, linkedId, submissionId, session) {
  if (linkedId) {
    const linked = await Model.findById(linkedId).session(session)
    if (linked) return linked
  }
  return Model.findOne({ sourceSubmissionId: submissionId }).session(session)
}

async function publishSubmission(submission, targetModel, session) {
  requirePublishableSubmission(submission)

  if (targetModel === 'Article') {
    const existing = await findLinkedPublication(Article, submission.publishedArticleId, submission._id, session)
    const payload = articlePayloadFromSubmission(submission, existing)
    if (existing) {
      existing.set(payload)
      await existing.save({ session })
      return { created: false, model: 'Article', document: existing }
    }
    const [created] = await Article.create([payload], { session })
    return { created: true, model: 'Article', document: created }
  }

  const existing = await findLinkedPublication(Content, submission.publishedContentId, submission._id, session)
  const payload = contentPayloadFromSubmission(submission, existing)
  if (existing) {
    existing.set(payload)
    await existing.save({ session })
    return { created: false, model: 'Content', document: existing }
  }
  const [created] = await Content.create([payload], { session })
  return { created: true, model: 'Content', document: created }
}

async function hideLinkedPublication(submission, session) {
  if (submission.publishedContentId) {
    await Content.findByIdAndUpdate(submission.publishedContentId, { status: 'draft' }, { session })
  }
  if (submission.publishedArticleId) {
    await Article.findByIdAndUpdate(submission.publishedArticleId, { status: 'draft' }, { session })
  }
}

exports.createSubmission = async (req, res, next) => {
  try {
    const payload = submissionCreatePayload(req.body || {}, req.user.id)
    const error = validateSubmissionPayload(payload)
    if (error) return res.status(400).json({ message: error })

    const submission = await Submission.create(payload)
    res.status(201).json({ message: 'Submission created', submission })
  } catch (err) {
    next(err)
  }
}

exports.getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean()
    res.json({ submissions, count: submissions.length })
  } catch (err) {
    next(err)
  }
}

exports.getAllSubmissions = async (req, res, next) => {
  try {
    const { status } = req.query
    const query = {}
    if (status) query.status = status

    const submissions = await Submission.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ submissions, count: submissions.length })
  } catch (err) {
    next(err)
  }
}

exports.getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('userId', 'name email').lean()
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    return res.json({ submission })
  } catch (err) {
    next(err)
  }
}

exports.updateSubmissionStatus = async (req, res, next) => {
  try {
    const { status, adminNote, publishAs } = req.body

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const session = await mongoose.startSession()
    let submissionId
    let responseMessage = 'Submission status updated'

    try {
      await session.withTransaction(async () => {
        const submission = await Submission.findById(req.params.id).session(session)
        if (!submission) return

        if (adminNote !== undefined) submission.adminNote = cleanString(adminNote)
        submission.reviewedAt = new Date()
        submission.reviewedBy = req.user._id

        if (status === 'approved' || status === 'published') {
          const targetModel = publishTargetFromRequest(publishAs || submission.publishedModel)
          const publication = await publishSubmission(submission, targetModel, session)

          submission.status = 'published'
          submission.publishedAt = publication.document.publishedAt || new Date()
          submission.publishedModel = publication.model
          if (publication.model === 'Article') {
            if (submission.publishedContentId) {
              await Content.findByIdAndUpdate(submission.publishedContentId, { status: 'draft' }, { session })
            }
            submission.publishedArticleId = publication.document._id
            submission.publishedContentId = null
          } else {
            if (submission.publishedArticleId) {
              await Article.findByIdAndUpdate(submission.publishedArticleId, { status: 'draft' }, { session })
            }
            submission.publishedContentId = publication.document._id
            submission.publishedArticleId = null
          }
          responseMessage = publication.created
            ? 'Submission published'
            : 'Submission publication updated'
        } else {
          if (status === 'pending' || status === 'rejected') {
            await hideLinkedPublication(submission, session)
          }
          submission.status = status
        }

        await submission.save({ session })
        submissionId = submission._id
      })
    } finally {
      await session.endSession()
    }

    if (!submissionId) return res.status(404).json({ message: 'Submission not found' })

    const submission = await Submission.findById(submissionId).populate('userId', 'name email')

    return res.json({ message: responseMessage, submission })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message })
    }
    next(err)
  }
}

exports.deleteSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    return res.json({ message: 'Submission deleted' })
  } catch (err) {
    next(err)
  }
}
