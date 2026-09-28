import express from 'express';
import {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '../controllers/characterController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCharacters);
router.get('/:id', getCharacterById);
router.post('/', protect, adminOnly, createCharacter);
router.put('/:id', protect, adminOnly, updateCharacter);
router.delete('/:id', protect, adminOnly, deleteCharacter);

export default router;