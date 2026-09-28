// ============================================
// Fan Hub Plus — 8 Fandom Categories
// ============================================

// Apni images import karo (assets folder se)
import animeImg from '../assets/anime.jpg';
import gamingImg from '../assets/gaming.jpg';
import moviesImg from '../assets/movies.jpg';
import tvShowsImg from '../assets/tv-shows.jpg';
import kpopImg from '../assets/k-pop.jpg';
import comicsImg from '../assets/comics.jpg';
import mangaImg from '../assets/manga.jpg';
import cosplayImg from '../assets/cosplay.jpg';

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
    image: animeImg,          // ← Yeh add karo
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
    image: gamingImg,
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
    image: moviesImg,
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
    image: tvShowsImg,
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
    image: kpopImg,
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
    image: comicsImg,
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
    image: mangaImg,
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
    image: cosplayImg,
  },
];

// Helpers
export const getCategoryBySlug = (slug) =>
  CATEGORIES.find((c) => c.slug === slug);

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id);

export const getCategoryNames = () =>
  CATEGORIES.map((c) => c.name);