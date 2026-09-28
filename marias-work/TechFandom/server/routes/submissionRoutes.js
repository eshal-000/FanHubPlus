import express from 'express';
import {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
} from '../controllers/submissionController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', protect, createSubmission);
router.get('/mine', protect, getMySubmissions);

// Admin routes
router.get('/', protect, adminOnly, getAllSubmissions);
router.get('/:id', protect, adminOnly, getSubmissionById);
router.patch('/:id', protect, adminOnly, updateSubmissionStatus);
router.delete('/:id', protect, adminOnly, deleteSubmission);

export default router;