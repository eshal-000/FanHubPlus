const Category = require('../models/Category')
const Content = require('../models/Content')

async function getContentCounts(includeHidden = false, collectionKey = '') {
  const match = includeHidden
    ? {}
    : { $or: [{ status: 'published' }, { status: { $exists: false } }] }
  if (collectionKey) match.collectionKey = collectionKey

  const rows = await Content.aggregate([
    { $match: match },
    { $group: { _id: '$categorySlug', count: { $sum: 1 } } },
  ])

  return new Map(rows.map((row) => [row._id, row.count]))
}

exports.getCategories = async (req, res, next) => {
  try {
    const collectionKey = String(req.query.collectionKey || '').trim()
    const categories = await Category.find({ status: 'active' }).sort({ sortOrder: 1, name: 1 }).lean()
    const counts = await getContentCounts(false, collectionKey)
    const items = categories.map((category) => ({
      ...category,
      contentCount: counts.get(category.slug) || 0,
    }))

    res.json({ categories: items, count: items.length })
  } catch (err) {
    next(err)
  }
}

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const collectionKey = String(req.query.collectionKey || '').trim()
    const category = await Category.findOne({ slug: req.params.slug, status: 'active' }).lean()
    if (!category) return res.status(404).json({ message: 'Category not found' })

    const counts = await getContentCounts(false, collectionKey)
    res.json({
      category: {
        ...category,
        contentCount: counts.get(category.slug) || 0,
      },
    })
  } catch (err) {
    next(err)
  }
}
