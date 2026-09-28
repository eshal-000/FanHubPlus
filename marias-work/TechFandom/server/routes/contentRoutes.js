import express from 'express';
import {
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers/contentController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getContents);
router.get('/:id', getContentById);
router.post('/', protect, adminOnly, createContent);
router.put('/:id', protect, adminOnly, updateContent);
router.delete('/:id', protect, adminOnly, deleteContent);

export default router;