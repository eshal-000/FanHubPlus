import Bookmark from '../models/Bookmark.js';

// GET /api/bookmarks
export const getBookmarks = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.user._id };
    if (type) query.itemType = type;

    const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 });
    res.json({ bookmarks, count: bookmarks.length });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/bookmarks
export const addBookmark = async (req, res) => {
  try {
    const { itemType, itemId, itemData, note } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({ message: 'itemType and itemId are required' });
    }

    const allowedTypes = ['article', 'character', 'media', 'merch'];
    if (!allowedTypes.includes(itemType)) {
      return res.status(400).json({ message: 'Invalid itemType' });
    }

    const existing = await Bookmark.findOne({
      userId: req.user._id,
      itemType,
      itemId,
    });
    if (existing) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      itemType,
      itemId,
      itemData: itemData || {},
      note: note || '',
    });

    res.status(201).json({ message: 'Bookmark added', bookmark });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/bookmarks/:id
export const updateBookmark = async (req, res) => {
  try {
    const { note } = req.body;
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) return res.status(404).json({ message: 'Bookmark not found' });
    if (bookmark.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (note !== undefined) bookmark.note = note;
    await bookmark.save();

    res.json({ message: 'Bookmark updated', bookmark });
  } catch (error) {
    console.error('Update bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/bookmarks/:id
export const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) return res.status(404).json({ message: 'Bookmark not found' });
    if (bookmark.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await bookmark.deleteOne();
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};