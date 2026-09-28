



import { CATEGORY_PUBLIC_IMAGES } from '../utils/fandomAssets';

export const CATEGORIES = [
  {
    id: 1,
    name: 'Anime',
    slug: 'anime',
    icon: '⛩️',
    color: '#FF006B',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Japanese animation, series, movies & OVAs',
    totalContent: 248,
    image: CATEGORY_PUBLIC_IMAGES.anime,
  },
  {
    id: 2,
    name: 'Gaming',
    slug: 'gaming',
    icon: '🎮',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Video games, esports, consoles & reviews',
    totalContent: 186,
    image: CATEGORY_PUBLIC_IMAGES.gaming,
  },
  {
    id: 3,
    name: 'Movies',
    slug: 'movies',
    icon: '🎬',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Blockbusters, indie films & cinematic universes',
    totalContent: 312,
    image: CATEGORY_PUBLIC_IMAGES.movies,
  },
  {
    id: 4,
    name: 'TV Shows',
    slug: 'tv-shows',
    icon: '📺',
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-blue-600',
    description: 'Series, web shows, dramas & binge-worthy content',
    totalContent: 224,
    image: CATEGORY_PUBLIC_IMAGES['tv-shows'],
  },
  {
    id: 5,
    name: 'K-Pop',
    slug: 'k-pop',
    icon: '🎤',
    color: '#EC4899',
    gradient: 'from-pink-400 to-fuchsia-600',
    description: 'Korean pop, idols, comebacks & concerts',
    totalContent: 158,
    image: CATEGORY_PUBLIC_IMAGES['k-pop'],
  },
  {
    id: 6,
    name: 'Comics',
    slug: 'comics',
    icon: '🦸',
    color: '#10B981',
    gradient: 'from-emerald-500 to-green-600',
    description: 'Marvel, DC, indie comics & graphic novels',
    totalContent: 142,
    image: CATEGORY_PUBLIC_IMAGES.comics,
  },
  {
    id: 7,
    name: 'Manga',
    slug: 'manga',
    icon: '📖',
    color: '#F472B6',
    gradient: 'from-rose-400 to-pink-600',
    description: 'Japanese manga, manhwa & light novels',
    totalContent: 198,
    image: CATEGORY_PUBLIC_IMAGES.manga,
  },
  {
    id: 8,
    name: 'Cosplay',
    slug: 'cosplay',
    icon: '🎭',
    color: '#A855F7',
    gradient: 'from-purple-500 to-indigo-600',
    description: 'Costume design, conventions & cosplay artists',
    totalContent: 96,
    image: CATEGORY_PUBLIC_IMAGES.cosplay,
  },
];


export const getCategoryBySlug = (slug) =>
  CATEGORIES.find((c) => c.slug === slug);

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id);

export const getCategoryNames = () =>
  CATEGORIES.map((c) => c.name);
