import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiFilter,
  FiSliders,
  FiGrid,
  FiSearch,
  FiX,
  FiStar,
  FiHeart,
  FiCalendar,
  FiClock,
  FiBookmark,
} from 'react-icons/fi';
import { CATEGORIES, getCategoryBySlug } from '../data/categories';
import ContentCard from '../components/ContentCard';
import { MOVIE_CARDS } from '../data/movies';

// ============================================
// CATEGORY IMAGES (unchanged)
// ============================================
import animeHero from '../assets/anime-hero.jpg';
import animeCard1 from '../assets/anime-card-1.jpg';
import animeCard2 from '../assets/anime-card-2.jpg';
import animeCard3 from '../assets/anime-card-3.jpg';
import animeCard4 from '../assets/anime-card-4.jpg';
import animeCard5 from '../assets/anime-card-5.jpg';
import animeCard6 from '../assets/anime-card-6.jpg';

import gamingHero from '../assets/gaming-hero.jpg';
import gamingCard1 from '../assets/gaming-card-1.jpg';
import gamingCard2 from '../assets/gaming-card-2.jpg';
import gamingCard3 from '../assets/gaming-card-3.jpg';
import gamingCard4 from '../assets/gaming-card-4.jpg';
import gamingCard5 from '../assets/gaming-card-5.jpg';
import gamingCard6 from '../assets/gaming-card-6.jpg';

import moviesHero from '../assets/movies-hero.jpg';
import moviesCard1 from '../assets/movies-card-1.jpg';
import moviesCard2 from '../assets/movies-card-2.jpg';
import moviesCard3 from '../assets/movies-card-3.jpg';
import moviesCard4 from '../assets/movies-card-4.jpg';
import moviesCard5 from '../assets/movies-card-5.jpg';
import moviesCard6 from '../assets/movies-card-6.jpg';

import tvShowsHero from '../assets/tv-shows-hero.jpg';
import tvShowsCard1 from '../assets/tv-shows-card-1.jpg';
import tvShowsCard2 from '../assets/tv-shows-card-2.jpg';
import tvShowsCard3 from '../assets/tv-shows-card-3.jpg';
import tvShowsCard4 from '../assets/tv-shows-card-4.jpg';
import tvShowsCard5 from '../assets/tv-shows-card-5.jpg';
import tvShowsCard6 from '../assets/tv-shows-card-6.jpg';

import kpopHero from '../assets/k-pop-hero.jpg';
import kpopCard1 from '../assets/k-pop-card-1.jpg';
import kpopCard2 from '../assets/k-pop-card-2.jpg';
import kpopCard3 from '../assets/k-pop-card-3.jpg';
import kpopCard4 from '../assets/k-pop-card-4.jpg';
import kpopCard5 from '../assets/k-pop-card-5.jpg';
import kpopCard6 from '../assets/k-pop-card-6.jpg';

import comicsHero from '../assets/comics-hero.jpg';
import comicsCard1 from '../assets/comics-card-1.jpg';
import comicsCard2 from '../assets/comics-card-2.jpg';
import comicsCard3 from '../assets/comics-card-3.jpg';
import comicsCard4 from '../assets/comics-card-4.jpg';
import comicsCard5 from '../assets/comics-card-5.jpg';
import comicsCard6 from '../assets/comics-card-6.jpg';

import mangaHero from '../assets/manga-hero.jpg';
import mangaCard1 from '../assets/manga-card-1.jpg';
import mangaCard2 from '../assets/manga-card-2.jpg';
import mangaCard3 from '../assets/manga-card-3.jpg';
import mangaCard4 from '../assets/manga-card-4.jpg';
import mangaCard5 from '../assets/manga-card-5.jpg';
import mangaCard6 from '../assets/manga-card-6.jpg';

import cosplayHero from '../assets/cosplay-hero.jpg';
import cosplayCard1 from '../assets/cosplay-card-1.jpg';
import cosplayCard2 from '../assets/cosplay-card-2.jpg';
import cosplayCard3 from '../assets/cosplay-card-3.jpg';
import cosplayCard4 from '../assets/cosplay-card-4.jpg';
import cosplayCard5 from '../assets/cosplay-card-5.jpg';
import cosplayCard6 from '../assets/cosplay-card-6.jpg';

const CATEGORY_HERO_IMAGES = {
  anime: animeHero,
  gaming: gamingHero,
  movies: moviesHero,
  'tv-shows': tvShowsHero,
  'k-pop': kpopHero,
  comics: comicsHero,
  manga: mangaHero,
  cosplay: cosplayHero,
};

const CATEGORY_CARD_IMAGES = {
  anime: [animeCard1, animeCard2, animeCard3, animeCard4, animeCard5, animeCard6],
  gaming: [gamingCard1, gamingCard2, gamingCard3, gamingCard4, gamingCard5, gamingCard6],
  movies: [moviesCard1, moviesCard2, moviesCard3, moviesCard4, moviesCard5, moviesCard6],
  'tv-shows': [tvShowsCard1, tvShowsCard2, tvShowsCard3, tvShowsCard4, tvShowsCard5, tvShowsCard6],
  'k-pop': [kpopCard1, kpopCard2, kpopCard3, kpopCard4, kpopCard5, kpopCard6],
  comics: [comicsCard1, comicsCard2, comicsCard3, comicsCard4, comicsCard5, comicsCard6],
  manga: [mangaCard1, mangaCard2, mangaCard3, mangaCard4, mangaCard5, mangaCard6],
  cosplay: [cosplayCard1, cosplayCard2, cosplayCard3, cosplayCard4, cosplayCard5, cosplayCard6],
};

// ============================================
// MOVIE CATEGORY — 3 curated films (from /data/movies.js)
// ============================================
const generateMovieContent = (category) =>
  MOVIE_CARDS.map((m) => ({
    ...m,
    category, // inject category object so ContentCard renders badge correctly
  }));

// ============================================
// OTHER CATEGORIES — existing mock generator (unchanged)
// ============================================
const generateMockContent = (category) => {
  const types = ['Article', 'Video', 'Gallery', 'Review', 'News', 'Article'];
  const titles = [
    `Top 10 ${category.name} of 2025`,
    `Best ${category.name} Moments This Year`,
    `${category.name} Guide for Beginners`,
    `Hidden Gems in ${category.name}`,
    `Iconic ${category.name} Characters`,
    `Upcoming ${category.name} 2025`,
  ];

  const categoryImages = CATEGORY_CARD_IMAGES[category.slug] || [];

  return Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: titles[i % titles.length],
    type: types[i % types.length],
    description: `Explore the best of ${category.name} — curated articles, reviews, and galleries just for you.`,
    imageUrl:
      categoryImages[i] ||
      `https://picsum.photos/seed/${category.slug}${i}/400/300`,
    rating: (4 + Math.random()).toFixed(1),
    likes: Math.floor(Math.random() * 500),
    category: category,
    releaseYear: 2025 - Math.floor(Math.random() * 5),
    popularity: Math.floor(Math.random() * 100),
  }));
};

// ============================================
// POLL DATA (unchanged)
// ============================================
const generatePoll = (category) => {
  const polls = {
    anime: { question: 'Which anime are you most excited for in 2025?', options: [{ id: 1, text: 'Jujutsu Kaisen Season 3', votes: 542 }, { id: 2, text: 'Demon Slayer Season 5', votes: 387 }, { id: 3, text: 'Chainsaw Man Season 2', votes: 298 }, { id: 4, text: 'One Piece Final Saga', votes: 456 }] },
    gaming: { question: 'Which game are you most hyped for?', options: [{ id: 1, text: 'GTA VI', votes: 892 }, { id: 2, text: 'Elder Scrolls VI', votes: 445 }, { id: 3, text: 'Hollow Knight Silksong', votes: 367 }, { id: 4, text: 'Fable Reboot', votes: 234 }] },
    movies: { question: 'Best movie of 2025 so far?', options: [{ id: 1, text: 'Deadpool & Wolverine', votes: 678 }, { id: 2, text: 'Dune: Part Three', votes: 534 }, { id: 3, text: 'Avatar 3', votes: 421 }, { id: 4, text: 'Inside Out 2', votes: 389 }] },
    'tv-shows': { question: 'Which show are you binge-watching?', options: [{ id: 1, text: 'The Last of Us S2', votes: 612 }, { id: 2, text: 'Stranger Things S5', votes: 498 }, { id: 3, text: 'Wednesday S2', votes: 378 }, { id: 4, text: 'House of the Dragon S3', votes: 289 }] },
    'k-pop': { question: 'Favorite K-Pop group right now?', options: [{ id: 1, text: 'BLACKPINK', votes: 723 }, { id: 2, text: 'BTS', votes: 856 }, { id: 3, text: 'Stray Kids', votes: 412 }, { id: 4, text: 'NewJeans', votes: 345 }] },
    comics: { question: 'Best comic publisher of 2025?', options: [{ id: 1, text: 'Marvel', votes: 534 }, { id: 2, text: 'DC Comics', votes: 478 }, { id: 3, text: 'Image Comics', votes: 234 }, { id: 4, text: 'Dark Horse', votes: 189 }] },
    manga: { question: 'Which manga should get an anime adaptation?', options: [{ id: 1, text: 'Vagabond', votes: 456 }, { id: 2, text: 'Berserk (full)', votes: 623 }, { id: 3, text: '20th Century Boys', votes: 312 }, { id: 4, text: 'Oyasumi Punpun', votes: 234 }] },
    cosplay: { question: 'Best cosplay category?', options: [{ id: 1, text: 'Anime Characters', votes: 567 }, { id: 2, text: 'Game Characters', votes: 423 }, { id: 3, text: 'Movie Characters', votes: 345 }, { id: 4, text: 'Original Designs', votes: 234 }] },
  };

  const poll = polls[category.slug] || polls.anime;
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  return { ...poll, totalVotes };
};

// ============================================
// CONTENT MODAL (unchanged — for non-movie categories)
// ============================================
const ContentModal = ({ item, category, onClose }) => {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_0_60px_var(--glow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl">
          <img
            src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/450`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-[var(--cream)] hover:bg-[var(--primary)] transition z-10"
          >
            <FiX size={18} />
          </button>

          <div className="absolute top-4 left-4 z-10">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
              style={{
                backgroundColor: `${category.color}40`,
                color: category.color,
                border: `1px solid ${category.color}80`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {item.type || category.name}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h2 className="font-orbitron text-2xl md:text-3xl font-black text-[var(--cream)] leading-tight">
            {item.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <FiCalendar size={14} className="text-[var(--primary)]" />
              {item.releaseYear || 2025}
            </span>
            <span className="flex items-center gap-1.5">
              <FiClock size={14} className="text-[var(--primary)]" />
              {item.type || 'Article'}
            </span>
            <span className="flex items-center gap-1.5 text-[var(--yellow)]">
              <FiStar size={14} className="fill-current" />
              {item.rating || '4.8'}
            </span>
            <span className="flex items-center gap-1.5 text-[var(--primary)]">
              <FiHeart size={14} />
              {item.likes || 0} likes
            </span>
          </div>

          <div className="my-6 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

          <div>
            <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] uppercase tracking-widest mb-3">
              About
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {item.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-orbitron font-bold text-sm uppercase tracking-wider hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MODAL WRAPPER — only for non-movie items
// ============================================
const ModalCard = ({ item, onOpen }) => {
  // Movie items already handle their own click (navigate). Wrap only others.
  if (item.isMovieDetail) {
    return <ContentCard item={item} />;
  }
  return (
    <div onClick={() => onOpen(item)} className="cursor-pointer">
      <ContentCard item={item} />
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const ExploreCategory = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const category = getCategoryBySlug(slug);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [userVote, setUserVote] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const allContent = useMemo(() => {
    if (!category) return [];
    // Movies — use curated data; others — mock
    if (category.slug === 'movies') {
      return generateMovieContent(category);
    }
    return generateMockContent(category);
  }, [category]);

  const poll = useMemo(
    () => (category ? generatePoll(category) : null),
    [category]
  );

  useEffect(() => {
    if (category) {
      const savedVote = localStorage.getItem(`fhp_poll_${category.slug}`);
      setUserVote(savedVote ? parseInt(savedVote) : null);
    }
  }, [category]);

  const handleVote = (optionId) => {
    if (userVote !== null) return;
    setUserVote(optionId);
    if (category) {
      localStorage.setItem(`fhp_poll_${category.slug}`, optionId);
    }
  };

  const filteredContent = useMemo(() => {
    let content = [...allContent];

    if (searchQuery.trim() !== '') {
      content = content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      content = content.filter(
        (item) => item.type.toLowerCase() === selectedType
      );
    }

    if (sortBy === 'popular') {
      content.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === 'latest') {
      content.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sortBy === 'rating') {
      content.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'az') {
      content.sort((a, b) => a.title.localeCompare(b.title));
    }

    return content;
  }, [allContent, searchQuery, selectedType, sortBy]);

  if (!category) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-orbitron text-6xl font-black text-[var(--primary)]">404</h1>
          <p className="text-[var(--cream)] mt-4 text-lg">Category not found</p>
          <button
            onClick={() => navigate('/explore')}
            className="mt-6 px-6 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)]"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* HERO (unchanged) */}
      <section className="relative h-[45vh] min-h-[350px] overflow-hidden">
        <img
          src={CATEGORY_HERO_IMAGES[category.slug] || category.image}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-[var(--bg)]/40" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(135deg, ${category.color}, transparent)` }}
        />

        <button
          onClick={() => navigate('/explore')}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] hover:border-[var(--primary)] transition text-sm"
        >
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 pb-12 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
            <Link to="/explore" className="hover:text-[var(--primary)] transition">Explore</Link>
            <span>/</span>
            <span style={{ color: category.color }}>{category.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-4xl md:text-5xl">{category.icon}</span>
            <h1
              className="font-orbitron text-4xl md:text-6xl font-black text-[var(--cream)]"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)' }}
            >
              {category.name}
            </h1>
          </div>

          <p className="text-[var(--muted)] mt-3 max-w-xl text-sm md:text-base" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95)' }}>
            {category.description}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-[60px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C320,120 420,0 720,40 C1020,80 1120,20 1440,60 L1440,120 L0,120 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>

      {/* SEARCH + FILTERS (unchanged) */}
      <section className="max-w-6xl mx-auto px-4 mt-8 mb-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-4 space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${category.name}...`}
              className="w-full rounded-full bg-[var(--nav)] border border-[var(--border)] pl-11 pr-4 py-2.5 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/60 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)] transition"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-2 text-[var(--muted)] text-xs mr-2 shrink-0">
                <FiFilter size={14} /> Filter:
              </div>

              {['all', 'article', 'video', 'gallery', 'review', 'news', 'movie'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedType === type
                      ? 'text-[var(--cream)] shadow-[0_0_10px_var(--glow)]'
                      : 'bg-[var(--nav)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
                  }`}
                  style={{ backgroundColor: selectedType === type ? category.color : undefined }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 text-[var(--muted)] text-xs">
                <FiSliders size={14} /> Sort:
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg bg-[var(--nav)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--cream)] outline-none focus:border-[var(--primary)] transition cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="latest">Latest</option>
                <option value="rating">Top Rated</option>
                <option value="az">A → Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <FiGrid className="text-[var(--primary)]" />
          <h2 className="font-orbitron text-xl md:text-2xl font-bold text-[var(--cream)]">
            {selectedType === 'all' ? `All ${category.name}` : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s`}
          </h2>
          <span className="text-xs text-[var(--muted)] ml-2">({filteredContent.length})</span>
        </div>

        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContent.map((item) => (
              <ModalCard
                key={item.id}
                item={item}
                onOpen={setSelectedItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">No {selectedType}s found in {category.name}</p>
            <button
              onClick={() => { setSelectedType('all'); setSearchQuery(''); }}
              className="mt-4 text-[var(--primary)] text-xs font-semibold hover:text-[var(--yellow)] transition"
            >
              Show all content
            </button>
          </div>
        )}
      </section>

      {/* POLL (unchanged) */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative rounded-3xl overflow-hidden bg-[var(--surface)]/60 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${category.color}, var(--primary), ${category.color})` }} />

          <div className="p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-[80px] pointer-events-none" style={{ backgroundColor: category.color }} />

            <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${category.color}25` }}>🗳️</div>
                  <div>
                    <h2 className="font-orbitron text-lg md:text-xl font-bold text-[var(--cream)]">Community Poll</h2>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Vote & see what fans think</p>
                  </div>
                </div>
                <p className="text-base md:text-lg font-semibold text-[var(--cream)] leading-snug">{poll.question}</p>
              </div>

              <div className="px-4 py-2 rounded-full text-center shrink-0" style={{ backgroundColor: `${category.color}20` }}>
                <p className="font-orbitron text-lg font-bold leading-none" style={{ color: category.color }}>{poll.totalVotes.toLocaleString()}</p>
                <p className="text-[9px] uppercase tracking-wider text-[var(--muted)] mt-1">Votes</p>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-6 space-y-3">
            {poll.options.map((option) => {
              const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
              const isSelected = userVote === option.id;
              const hasVoted = userVote !== null;

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted}
                  className={`group w-full relative rounded-2xl overflow-hidden text-left transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-[var(--primary)]' : hasVoted ? 'cursor-default' : 'hover:scale-[1.01] cursor-pointer'
                  }`}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                >
                  {hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
                      style={{
                        width: `${percentage}%`,
                        background: isSelected ? `linear-gradient(90deg, ${category.color}50, ${category.color}25)` : 'rgba(255, 255, 255, 0.05)',
                      }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between p-4 gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--muted)]/40'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-[var(--cream)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm md:text-base font-semibold truncate transition-colors ${
                        isSelected ? 'text-[var(--cream)]' : hasVoted ? 'text-[var(--muted)]' : 'text-[var(--cream)] group-hover:text-[var(--primary)]'
                      }`}>
                        {option.text}
                      </span>
                    </div>

                    {hasVoted && (
                      <span className={`text-base md:text-lg font-bold font-orbitron shrink-0 ${isSelected ? '' : 'text-[var(--muted)]'}`} style={isSelected ? { color: category.color } : {}}>
                        {percentage}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-6 md:px-8 pb-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              {poll.totalVotes.toLocaleString()} fans voted
            </div>

            {userVote !== null ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Thanks for voting!
              </div>
            ) : (
              <span className="text-xs text-[var(--muted)] italic">Click an option to vote</span>
            )}
          </div>
        </div>
      </section>

      {/* OTHER CATEGORIES (unchanged) */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="font-orbitron text-xl md:text-2xl font-bold text-[var(--cream)] mb-5">Explore Other Categories</h2>

        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {CATEGORIES.filter((c) => c.slug !== slug).map((cat) => (
            <Link
              key={cat.id}
              to={`/explore/${cat.slug}`}
              className="group flex-shrink-0 w-[140px] h-[160px] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 relative"
            >
              <img src={CATEGORY_HERO_IMAGES[cat.slug] || cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-3">
                <span className="text-xl mb-1">{cat.icon}</span>
                <h3 className="font-orbitron text-xs font-bold text-[var(--cream)] text-center" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.95)' }}>
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MODAL (only for non-movie items) */}
      {selectedItem && (
        <ContentModal
          item={selectedItem}
          category={category}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default ExploreCategory;