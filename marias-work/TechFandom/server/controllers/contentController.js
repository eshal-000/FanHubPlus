import Content from '../models/Content.js';

// GET /api/contents
export const getContents = async (req, res) => {
  try {
    const { category, type, search, sort } = req.query;
    const query = { status: 'published' };

    if (category) query.categorySlug = category;
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: 'i' };

    let sortOption = { popularity: -1 };
    if (sort === 'latest') sortOption = { createdAt: -1 };
    if (sort === 'az') sortOption = { title: 1 };

    const contents = await Content.find(query).sort(sortOption);
    res.json({ contents, count: contents.length });
  } catch (error) {
    console.error('Get contents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/contents/:id
export const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    content.views += 1;
    await content.save();

    res.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/contents
export const createContent = async (req, res) => {
  try {
    const content = await Content.create(req.body);
    res.status(201).json({ message: 'Content created', content });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/contents/:id
export const updateContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content updated', content });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/contents/:id
export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content deleted' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};