import Article from '../models/Article.js';

// GET /api/articles
export const getArticles = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const query = { status: 'published' };

    if (category) query.categorySlug = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    let sortOption = { views: -1 };
    if (sort === 'latest') sortOption = { createdAt: -1 };
    if (sort === 'az') sortOption = { title: 1 };

    const articles = await Article.find(query).sort(sortOption);
    res.json({ articles, count: articles.length });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/articles/:id
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    article.views += 1;
    await article.save();

    res.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/articles
export const createArticle = async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json({ message: 'Article created', article });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/articles/:id
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article updated', article });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/articles/:id
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};