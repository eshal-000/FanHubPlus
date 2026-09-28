import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import contentRoutes from './routes/contentRoutes.js';       // ← NAYA
import characterRoutes from './routes/characterRoutes.js';   // ← NAYA
import articleRoutes from './routes/articleRoutes.js';       // ← NAYA

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Fan Hub Plus API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      bookmarks: '/api/bookmarks',
      submissions: '/api/submissions',
      contents: '/api/contents',
      characters: '/api/characters',
      articles: '/api/articles',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/articles', articleRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));