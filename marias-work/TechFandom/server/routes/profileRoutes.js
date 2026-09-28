import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/profile — Private
router.get('/', protect, getProfile);

// PUT /api/profile — Private
router.put('/', protect, updateProfile);

export default router;