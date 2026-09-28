import express from 'express';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  updateBookmark,
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/bookmarks — Private
router.get('/', protect, getBookmarks);

// POST /api/bookmarks — Private
router.post('/', protect, addBookmark);

// PUT /api/bookmarks/:id — Private
router.put('/:id', protect, updateBookmark);

// DELETE /api/bookmarks/:id — Private
router.delete('/:id', protect, removeBookmark);

export default router;