import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';

import User from './models/User.js';
import Content from './models/Content.js';
import Character from './models/Character.js';
import Article from './models/Article.js';
import Submission from './models/Submission.js';
import Bookmark from './models/Bookmark.js';

dotenv.config();

// ============ SAMPLE DATA ============

const users = [
  {
    name: 'Admin',
    email: 'admin@fanhubplus.com',
    plainPassword: 'admin123',
    role: 'admin',
  },
  {
    name: 'Maria Khan',
    email: 'maria@fanhubplus.com',
    plainPassword: 'user123',
    role: 'user',
    favoriteFandoms: ['Anime', 'K-Pop'],
    interests: ['anime', 'kpop'],
  },
  {
    name: 'Test User',
    email: 'user@fanhubplus.com',
    plainPassword: 'user123',
    role: 'user',
    favoriteFandoms: ['Gaming', 'Movies'],
    interests: ['gaming', 'movies'],
  },
];

const contents = [
  { title: 'Top 10 Anime of 2025', type: 'article', categorySlug: 'anime', description: 'The best anime this year', imageUrl: 'https://picsum.photos/seed/anime1/800/600', status: 'published', popularity: 95 },
  { title: 'GTA VI Gameplay Reveal', type: 'video', categorySlug: 'gaming', description: 'First look at GTA VI', imageUrl: 'https://picsum.photos/seed/gta/800/600', status: 'published', popularity: 100 },
  { title: 'Deadpool 3 Review', type: 'review', categorySlug: 'movies', description: 'Hilarious and action-packed', imageUrl: 'https://picsum.photos/seed/dp/800/600', status: 'published', popularity: 88 },
  { title: 'BLACKPINK World Tour 2025 Highlights', type: 'gallery', categorySlug: 'kpop', description: 'Relive the most iconic moments from the Born Pink world tour.', imageUrl: 'https://picsum.photos/seed/bp/800/600', status: 'published', popularity: 92, rating: 5, likes: 892 },
  { title: 'Spider-Man: Beyond', type: 'article', categorySlug: 'comics', description: 'Latest Spidey run', imageUrl: 'https://picsum.photos/seed/spidey/800/600', status: 'published', popularity: 78 },
  { title: 'Chainsaw Man Chapter 150', type: 'article', categorySlug: 'manga', description: 'New chapter breakdown', imageUrl: 'https://picsum.photos/seed/csm/800/600', status: 'published', popularity: 85 },
  { title: 'Stranger Things S5 Teaser', type: 'video', categorySlug: 'tv', description: 'Final season teaser', imageUrl: 'https://picsum.photos/seed/st/800/600', status: 'published', popularity: 90 },
  { title: 'Cosplay Championship 2025', type: 'gallery', categorySlug: 'cosplay', description: 'Best cosplays from around the world', imageUrl: 'https://picsum.photos/seed/cos/800/600', status: 'published', popularity: 80 },
];

const characters = [
  { name: 'Gojo Satoru', series: 'Jujutsu Kaisen', categorySlug: 'anime', bio: 'The strongest sorcerer.', imageUrl: 'https://picsum.photos/seed/gojo/400/400', status: 'published', likes: 2450, rating: 5.0 },
  { name: 'Monkey D. Luffy', series: 'One Piece', categorySlug: 'anime', bio: 'Future Pirate King.', imageUrl: 'https://picsum.photos/seed/luffy/400/400', status: 'published', likes: 3120, rating: 4.9 },
  { name: 'Kratos', series: 'God of War', categorySlug: 'gaming', bio: 'Ghost of Sparta.', imageUrl: 'https://picsum.photos/seed/kratos/400/400', status: 'published', likes: 1890, rating: 4.8 },
  { name: 'Deadpool', series: 'Marvel Comics', categorySlug: 'comics', bio: 'The Merc with a Mouth.', imageUrl: 'https://picsum.photos/seed/deadpool/400/400', status: 'published', likes: 2780, rating: 4.9 },
  { name: 'Levi Ackerman', series: 'Attack on Titan', categorySlug: 'anime', bio: "Humanity's strongest soldier.", imageUrl: 'https://picsum.photos/seed/levi/400/400', status: 'published', likes: 2980, rating: 4.9 },
  { name: 'Ellie Williams', series: 'The Last of Us', categorySlug: 'gaming', bio: 'Survivor.', imageUrl: 'https://picsum.photos/seed/ellie/400/400', status: 'published', likes: 1650, rating: 4.7 },
];

const articles = [
  {
    title: 'The Rise of Anime in Global Pop Culture',
    excerpt: 'How Japanese animation became a worldwide phenomenon.',
    body: '## The Early Days\nFrom Astro Boy to Dragon Ball, anime captured hearts worldwide.\n\n## The Streaming Era\nNetflix and Crunchyroll brought anime to millions.\n\n## Global Impact\nToday, anime influences fashion, music, and pop culture.',
    categorySlug: 'anime',
    author: 'Maria Khan',
    imageUrl: 'https://picsum.photos/seed/art1/1200/600',
    status: 'published',
    views: 12400,
    tags: ['Anime', 'Culture', 'Pop'],
  },
  {
    title: 'GTA VI: The Game That Will Redefine Open Worlds',
    excerpt: 'After a decade, Rockstar is back.',
    body: '## Vice City Returns\nA modern take on the iconic location.\n\n## Dual Protagonists\nLucia and Jason, inspired by Bonnie and Clyde.',
    categorySlug: 'gaming',
    author: 'Ahmed Ali',
    imageUrl: 'https://picsum.photos/seed/art2/1200/600',
    status: 'published',
    views: 18700,
    tags: ['GTA', 'Gaming', 'Rockstar'],
  },
  {
    title: 'K-Pop Goes Global: The 2025 World Tour Recap',
    excerpt: 'Biggest K-Pop moments of 2025.',
    body: '## World Tour\nSold out stadiums worldwide.\n\n## Records Broken\nNew streaming milestones.',
    categorySlug: 'kpop',
    author: 'Ayesha Khan',
    imageUrl: 'https://picsum.photos/seed/art3/1200/600',
    status: 'published',
    views: 24500,
    tags: ['K-Pop', 'Music', 'Tour'],
  },
];

// ============ SEED FUNCTION ============

const seed = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Content.deleteMany({}),
      Character.deleteMany({}),
      Article.deleteMany({}),
      Submission.deleteMany({}),
      Bookmark.deleteMany({}),
    ]);

    console.log('👤 Seeding users...');
    for (const u of users) {
      const hashed = await bcrypt.hash(u.plainPassword, 10);
      await User.create({
        name: u.name,
        email: u.email,
        passwordHash: hashed,
        role: u.role,
        favoriteFandoms: u.favoriteFandoms || [],
        interests: u.interests || [],
      });
    }

    console.log('📚 Seeding contents...');
    await Content.insertMany(contents);

    console.log('🎭 Seeding characters...');
    await Character.insertMany(characters);

    console.log('📰 Seeding articles...');
    await Article.insertMany(articles);

    console.log('');
    console.log('✅ Seeding complete!');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Admin  → admin@fanhubplus.com / admin123');
    console.log('   User   → maria@fanhubplus.com / user123');
    console.log('   User   → user@fanhubplus.com / user123');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();