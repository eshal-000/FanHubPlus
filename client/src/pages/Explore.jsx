import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiGrid,
  FiArrowRight,
  FiStar,
  FiPlay,
  FiHeadphones,
  FiFilm,
  FiCalendar,
  FiSliders,
  FiAward,
  FiHeart,
  FiBookmark,
  FiX,
} from 'react-icons/fi';
import { CATEGORIES as CATEGORY_VISUALS } from '../data/categories';
import CategoryCard from '../components/CategoryCard';
import VideoModal from '../components/VideoModal';
import LoginPromptModal from '../components/common/LoginPromptModal';
import useBookmarks from '../hooks/useBookmarks';
import useCategories from '../hooks/useCategories';
import mariaApi from '../services/mariaApi';
import { applyContentAssetOverrides } from '../utils/fandomAssets';


import audioHorizon from '../assets/audio-horizon.mp3';
import audioChasing from '../assets/audio-chasing.mp3';
import heroVideo from '../assets/hero-video.mp4';

const VISUAL_BY_SLUG = new Map(CATEGORY_VISUALS.map((category) => [category.slug, category]));
const VISUAL_BY_NAME = new Map(CATEGORY_VISUALS.map((category) => [category.name.toLowerCase(), category]));
const CURATED_COLLECTION_KEY = 'phase2-initial';

function visualCategoryFor(category) {
  if (!category) return null;
  return VISUAL_BY_SLUG.get(category.slug) || VISUAL_BY_NAME.get(String(category.name || '').toLowerCase());
}

function mergeCategory(category) {
  const visual = visualCategoryFor(category) || {};
  return {
    ...visual,
    ...category,
    color: category?.color || visual.color,
    description: category?.description || visual.description,
    icon: visual.icon || category?.icon,
    image: visual.image || category?.image || category?.heroImage,
    name: category?.name || visual.name,
    slug: category?.slug || visual.slug,
    totalContent: category?.contentCount ?? category?.totalContent ?? visual.totalContent ?? 0,
  };
}

function normalizeContent(item) {
  const hydrated = applyContentAssetOverrides(item);
  const category = mergeCategory(
    hydrated.categoryInfo ||
      (typeof hydrated.category === 'object' ? hydrated.category : null) ||
      { name: hydrated.category, slug: hydrated.categorySlug },
  );

  return {
    ...hydrated,
    category,
    id: hydrated._id || hydrated.id,
    imageUrl: hydrated.imageUrl || hydrated.imageUrls?.[0],
    likes: hydrated.likes || 0,
    rating: hydrated.rating ?? '',
    releaseYear: hydrated.releaseYear,
  };
}


const EVENTS = [
  { id: 1, month: 'MAR', days: '14-16', year: '2025', title: 'SakuraCon 2025', location: 'Tokyo, Japan', description: 'A celebration of anime, cosplay, and fandom culture.', color: '#FF006B' },
  { id: 2, month: 'APR', days: '5-6', year: '2025', title: 'K-Pop Fest 2025', location: 'Seoul, South Korea', description: 'Live performances, fan meets, and more.', color: '#EC4899' },
  { id: 3, month: 'MAY', days: '10-12', year: '2025', title: 'Fandom Expo', location: 'Los Angeles, USA', description: 'Cosplay, gaming, movies, and all fandoms together.', color: '#8B5CF6' },
  { id: 4, month: 'JUN', days: '20-22', year: '2025', title: 'Gaming Summit 2025', location: 'Dubai, UAE', description: 'Esports, panels, and next-gen gaming reveals.', color: '#06B6D4' },
];


const MULTIMEDIA = {
  videos: [
    { id: 1, title: "Death Note - L's Best Moments Part 1", type: 'Video', description: 'The greatest detective in anime history.', thumbnail: 'https://img.youtube.com/vi/c6Zjw_bO540/hqdefault.jpg', duration: '10:00', category: CATEGORY_VISUALS[0], url: 'https://www.youtube.com/embed/c6Zjw_bO540', views: 12400 },
    { id: 2, title: 'Hunter x Hunter - Killua & Gon Clips', type: 'Video', description: 'The best friendship in anime.', thumbnail: 'https://img.youtube.com/vi/FIib2y75PuM/hqdefault.jpg', duration: '8:30', category: CATEGORY_VISUALS[0], url: 'https://www.youtube.com/embed/FIib2y75PuM', views: 18700 },
    { id: 3, title: 'Naruto vs Sasuke - The Final Battle', type: 'Video', description: 'The legendary final battle.', thumbnail: 'https://img.youtube.com/vi/qi2rByJed-E/hqdefault.jpg', duration: '15:00', category: CATEGORY_VISUALS[0], url: 'https://www.youtube.com/embed/qi2rByJed-E', views: 24500 },
    { id: 4, title: 'BTS Perform "SWIM" Live in the Studio', type: 'Video', description: 'Live studio performance.', thumbnail: 'https://img.youtube.com/vi/YkUfnufGOB0/hqdefault.jpg', duration: '5:20', category: CATEGORY_VISUALS[4], url: 'https://www.youtube.com/embed/YkUfnufGOB0', views: 34500 },
  ],
  trailers: [
    { id: 5, title: 'Jujutsu Kaisen S3 - Official Trailer', type: 'Video', description: 'The official trailer.', thumbnail: 'https://img.youtube.com/vi/RYI-WG_HFV8/hqdefault.jpg', duration: '2:15', category: CATEGORY_VISUALS[0], url: 'https://www.youtube.com/embed/RYI-WG_HFV8', views: 45200 },
    { id: 6, title: 'Spider-Man: No Way Home - Official Trailer', type: 'Video', description: 'The multiverse unleashes chaos.', thumbnail: 'https://img.youtube.com/vi/JfVOs4VSpmA/hqdefault.jpg', duration: '3:00', category: CATEGORY_VISUALS[2], url: 'https://www.youtube.com/embed/JfVOs4VSpmA', views: 89200 },
    { id: 7, title: 'Ice Age (2002) - Official Trailer', type: 'Video', description: 'The classic animated adventure.', thumbnail: 'https://img.youtube.com/vi/CZShn0PZiYU/hqdefault.jpg', duration: '1:45', category: CATEGORY_VISUALS[2], url: 'https://www.youtube.com/embed/CZShn0PZiYU', views: 67800 },
    { id: 8, title: 'How to Train Your Dragon - Official Trailer', type: 'Video', description: 'The epic adventure of Hiccup and Toothless.', thumbnail: 'https://img.youtube.com/vi/22w7z_lT6YM/hqdefault.jpg', duration: '2:45', category: CATEGORY_VISUALS[2], url: 'https://www.youtube.com/embed/22w7z_lT6YM', views: 89200 },
  ],
  audio: [
    {
      id: 9,
      title: 'Horizon of Hope',
      type: 'Audio',
      description: 'An uplifting track about chasing horizons.',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
      duration: '3:45',
      category: CATEGORY_VISUALS[0],
      audioUrl: audioHorizon,
      views: 12400,
    },
    {
      id: 10,
      title: 'Chasing the Light',
      type: 'Audio',
      description: 'A powerful anthem about resilience.',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
      duration: '4:12',
      category: CATEGORY_VISUALS[4],
      audioUrl: audioChasing,
      views: 9800,
    },
  ],
  explainers: [
    { id: 13, title: 'JJK S1 Episode 22 Explained in Hindi', type: 'Video', description: 'Fully explained in Hindi.', thumbnail: 'https://img.youtube.com/vi/YjCc9JGkQfs/hqdefault.jpg', duration: '8:00', category: CATEGORY_VISUALS[0], url: 'https://www.youtube.com/embed/YjCc9JGkQfs', views: 34500 },
    { id: 14, title: 'Entire Multiverse Saga Explained - Part 1', type: 'Video', description: 'The complete Marvel Multiverse Saga.', thumbnail: 'https://img.youtube.com/vi/0q4PGpVoWYg/hqdefault.jpg', duration: '15:00', category: CATEGORY_VISUALS[5], url: 'https://www.youtube.com/embed/0q4PGpVoWYg', views: 41200 },
  ],
};


const StarField = () => {
  const stars = useMemo(() => {
    const generatedStars = [];
    const colors = ['star-pink', 'star-yellow', 'star-cream', ''];
    const seeded = (seed) => {
      const value = Math.sin(seed * 999) * 10000;
      return value - Math.floor(value);
    };

    for (let i = 0; i < 80; i++) {
      generatedStars.push({
        id: i,
        top: `${seeded(i + 1) * 100}%`,
        left: `${seeded(i + 81) * 100}%`,
        size: seeded(i + 161) * 3 + 1,
        color: colors[Math.floor(seeded(i + 241) * colors.length)],
        delay: `${seeded(i + 321) * 5}s`,
        duration: `${4 + seeded(i + 401) * 4}s`,
      });
    }
    return generatedStars;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.color}`}
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
};


const MultimediaCard = ({ item, type, onPlay }) => {
  const getIcon = () => {
    if (type === 'audio') return <FiHeadphones size={20} />;
    return <FiPlay size={20} />;
  };

  return (
    <button
      onClick={() => onPlay(item)}
      className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md hover:border-[var(--primary)]/60 hover:shadow-[0_0_25px_var(--glow)] transition-all duration-300 text-left w-full cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/30 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-[var(--cream)] backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform shadow-[0_0_25px_var(--glow)]"
            style={{ backgroundColor: `${item.category.color}80` }}
          >
            {getIcon()}
          </div>
        </div>

        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-[var(--cream)]">
          {item.duration}
        </div>

        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
            style={{
              backgroundColor: `${item.category.color}30`,
              color: item.category.color,
              border: `1px solid ${item.category.color}60`,
            }}
          >
            {item.category.name}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] leading-tight line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {item.title}
        </h3>
        <p className="text-[10px] text-[var(--muted)] mt-1 line-clamp-1">
          {item.views?.toLocaleString()} views
        </p>
      </div>
    </button>
  );
};


const FeaturedCard = ({ item }) => {
  const contentId = item._id || item.id;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes || 0);
  const { closeLoginPrompt, isBookmarked, showLoginPrompt, toggle } = useBookmarks();
  const saved = isBookmarked(contentId);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('fhp_liked_content') || '[]');
    if (liked.includes(contentId)) {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  }, [contentId]);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const liked = JSON.parse(localStorage.getItem('fhp_liked_content') || '[]');
    if (isLiked) {
      localStorage.setItem(
        'fhp_liked_content',
        JSON.stringify(liked.filter((id) => id !== contentId))
      );
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      localStorage.setItem(
        'fhp_liked_content',
        JSON.stringify([...liked, contentId])
      );
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggle(contentId, 'content');
    } catch (err) {
      console.error('Bookmark featured content error:', err);
    }
  };

  return (
    <>
      <div className="group relative rounded-3xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/60 transition-all duration-500 h-[400px] md:h-[440px]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--nav)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />

        <div className="absolute top-5 left-5 z-10">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md"
            style={{
              backgroundColor: `${item.category.color}25`,
              color: item.category.color,
              border: `1px solid ${item.category.color}60`,
            }}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: item.category.color }}
            />
            {item.category.name}
          </span>
        </div>

        <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[var(--yellow)]/20 backdrop-blur-md border border-[var(--yellow)]/60 text-[var(--yellow)]">
            <FiAward size={10} /> Featured
          </span>
          <button
            onClick={handleBookmark}
            className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition ${
              saved
                ? 'bg-[var(--primary)] text-[var(--cream)]'
                : 'bg-black/50 text-[var(--cream)] hover:bg-[var(--primary)]'
            }`}
            aria-label="Bookmark"
            aria-pressed={saved}
          >
            <FiBookmark
              size={12}
              className={saved ? 'fill-current' : ''}
            />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
          <h3 className="font-orbitron font-bold text-lg md:text-xl text-[var(--cream)] leading-snug line-clamp-2">
            {item.title}
          </h3>

          <p className="text-xs text-[var(--muted)] mt-2 max-w-md leading-relaxed line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center gap-4 mt-4 text-[11px]">
            {item.rating !== '' && (
              <span className="flex items-center gap-1 text-[var(--yellow)]">
                <FiStar size={12} className="fill-current" />
                <span className="font-semibold">{item.rating}</span>
              </span>
            )}

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 font-semibold transition ${
                isLiked
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--primary)]'
              }`}
              aria-label="Like"
            >
              <FiHeart size={12} className={isLiked ? 'fill-current' : ''} />
              <span>{likeCount} likes</span>
            </button>
          </div>
        </div>
      </div>
      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </>
  );
};


const AudioModal = ({ audio, onClose }) => {
  if (!audio) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_0_60px_var(--glow)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={audio.thumbnail}
            alt={audio.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-[var(--cream)] hover:bg-[var(--primary)] transition z-10"
          >
            <FiX size={14} />
          </button>

          <div className="absolute top-3 left-3 z-10">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md"
              style={{
                backgroundColor: `${audio.category.color}40`,
                color: audio.category.color,
                border: `1px solid ${audio.category.color}80`,
              }}
            >
              <FiHeadphones size={10} /> Audio
            </span>
          </div>
        </div>

        <div className="p-5">
          <h2 className="font-orbitron text-lg font-bold text-[var(--cream)] leading-tight">
            {audio.title}
          </h2>

          <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed line-clamp-2">
            {audio.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-[10px] text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <FiFilm size={11} className="text-[var(--primary)]" />
              {audio.duration}
            </span>
            <span>{audio.views?.toLocaleString()} plays</span>
          </div>

          <div className="mt-4">
            <audio
              controls
              src={audio.audioUrl}
              className="w-full h-10"
              style={{ filter: 'invert(0.9) hue-rotate(290deg)' }}
            >
              Your browser does not support the audio element.
            </audio>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-orbitron font-bold text-xs uppercase tracking-wider hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const Explore = () => {
  const { categories, error: categoriesError, loading: categoriesLoading } = useCategories({
    collectionKey: CURATED_COLLECTION_KEY,
  });
  const [featuredContent, setFeaturedContent] = useState([]);
  const [featuredError, setFeaturedError] = useState('');
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [mediaTab, setMediaTab] = useState('videos');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedContent() {
      try {
        setFeaturedLoading(true);
        setFeaturedError('');
        const { data } = await mariaApi.get('/contents', {
          params: { collectionKey: CURATED_COLLECTION_KEY, limit: 4, sort: sortBy },
        });
        if (!cancelled) setFeaturedContent((data.contents || []).map(normalizeContent));
      } catch (err) {
        if (!cancelled) {
          setFeaturedError(err?.response?.data?.message || err.message || 'Failed to load featured content');
          setFeaturedContent([]);
        }
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    }

    loadFeaturedContent();
    return () => {
      cancelled = true;
    };
  }, [sortBy]);

  const categoryCards = useMemo(
    () => categories.map(mergeCategory).filter((category) => category.slug && category.image),
    [categories],
  );

  const [featuredOne, featuredTwo] = featuredContent;

  const handleMultimediaPlay = (item) => {
    if (item.type === 'Audio' || mediaTab === 'audio') {
      setSelectedAudio(item);
    } else {
      setSelectedVideo(item);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      <StarField />


      <section className="relative overflow-hidden h-[60vh] min-h-[420px] flex items-center">

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'brightness(0.4) saturate(1.3) contrast(1.1)',
          }}
        >
          <source src={heroVideo} type="video/mp4" />
          <img
            src="/hero-bg.jpg"
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </video>


        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg)]/90 via-[var(--primary)]/20 to-[var(--raspberry)]/40" />


        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 25% 50%, #ec489940 0%, transparent 55%),
                         radial-gradient(circle at 75% 50%, #a855f730 0%, transparent 55%)`,
          }}
        />


        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px),
                              linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />


        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 w-full text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/50 bg-[var(--surface)]/40 backdrop-blur-md px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)] animate-pulse" />
            <span className="text-[10px] tracking-widest uppercase text-[var(--yellow)] font-bold">
              Your all-access fandom pass
            </span>
          </div>


          <h1 className="font-orbitron text-3xl md:text-4xl lg:text-5xl font-black text-[var(--cream)] leading-tight">
            Every fandom,{' '}
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--raspberry)] to-[var(--primary)] bg-clip-text text-transparent drop-shadow-[0_0_25px_var(--glow)]">
              one universe.
            </span>
          </h1>


          <p className="text-[var(--cream)]/75 mt-4 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Anime - Gaming - Movies - TV - K-Pop - Comics - Manga - Cosplay -{' '}
            <span className="text-[var(--primary)] font-semibold">
              everything you follow
            </span>
            , in one feed.
          </p>


          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <a
              href="#categories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-orbitron font-bold text-xs uppercase tracking-wider hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)]"
            >
              Explore Now <FiArrowRight size={13} />
            </a>
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[var(--primary)]/60 bg-[var(--surface)]/30 backdrop-blur-md text-[var(--cream)] font-orbitron font-bold text-xs uppercase tracking-wider hover:border-[var(--primary)] hover:bg-[var(--primary)]/20 transition"
            >
              Browse Articles
            </Link>
          </div>
        </div>


        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-[60px] md:h-[90px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C320,120 420,0 720,40 C1020,80 1120,20 1440,60 L1440,120 L0,120 Z"
              fill="var(--bg)"
            />
          </svg>
        </div>
      </section>


      <section
        id="categories"
        className="max-w-6xl mx-auto px-4 mt-6 mb-16 relative z-10"
      >
        <div className="flex items-center gap-2 mb-6">
          <FiGrid className="text-[var(--primary)]" />
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">
            Browse categories
          </h2>
        </div>

        {categoriesLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="aspect-[4/5] animate-pulse rounded-2xl bg-[var(--surface)]/40" />
            ))}
          </div>
        )}

        {!categoriesLoading && categoriesError && (
          <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">{categoriesError}</p>
          </div>
        )}

        {!categoriesLoading && !categoriesError && categoryCards.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">
              No categories are available yet. Category cards will appear here after the MongoDB category records are added.
            </p>
          </div>
        )}

        {!categoriesLoading && !categoriesError && categoryCards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {categoryCards.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        )}
      </section>


      <section className="max-w-6xl mx-auto px-4 mb-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiAward className="text-[var(--yellow)]" size={18} />
              <span className="text-[10px] uppercase tracking-widest text-[var(--yellow)] font-bold">
                Editor's Selection
              </span>
            </div>
            <h2 className="font-orbitron text-3xl md:text-4xl font-black text-[var(--cream)] leading-tight">
              Featured This Week
            </h2>
            <p className="text-[var(--muted)] mt-2 text-sm max-w-md">
              Hand-picked stories curated by our editorial team.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] flex items-center gap-1.5">
              <FiSliders size={12} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg bg-[var(--nav)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--cream)] outline-none focus:border-[var(--primary)] transition cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="latest">Latest</option>
              <option value="az">Alphabetical</option>
            </select>
          </div>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-[400px] md:h-[440px] animate-pulse rounded-3xl bg-[var(--surface)]/40" />
            <div className="h-[400px] md:h-[440px] animate-pulse rounded-3xl bg-[var(--surface)]/40" />
          </div>
        ) : featuredError ? (
          <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">{featuredError}</p>
          </div>
        ) : featuredOne && featuredTwo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FeaturedCard item={featuredOne} />
            <FeaturedCard item={featuredTwo} />
          </div>
        ) : featuredContent.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            <FeaturedCard item={featuredContent[0]} />
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">
              No featured content for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-[var(--primary)] text-xs font-semibold hover:text-[var(--yellow)] transition"
            >
              Clear search
            </button>
          </div>
        )}
      </section>


      <section className="max-w-6xl mx-auto px-4 mb-20 relative z-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FiFilm className="text-[var(--primary)] text-xl" />
            <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">
              Multimedia Center
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'videos', label: 'Videos' },
              { id: 'trailers', label: 'Trailers' },
              { id: 'audio', label: 'Audio' },
              { id: 'explainers', label: 'Explainers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMediaTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  mediaTab === tab.id
                    ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_15px_var(--glow)]'
                    : 'bg-[var(--surface)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MULTIMEDIA[mediaTab].map((item) => (
            <MultimediaCard
              key={item.id}
              item={item}
              type={mediaTab}
              onPlay={handleMultimediaPlay}
            />
          ))}
        </div>
      </section>


      <section className="max-w-4xl mx-auto px-4 mb-20 relative z-10">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <FiCalendar className="text-[var(--primary)] text-xl" />
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">
            Fan Event Highlights
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--primary)] via-[var(--raspberry)] to-transparent" />

          <div className="space-y-10">
            {EVENTS.map((event, index) => (
              <div
                key={event.id}
                className={`relative flex items-center gap-6 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div
                  className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-[var(--bg)] z-10"
                  style={{
                    backgroundColor: event.color,
                    boxShadow: `0 0 15px ${event.color}`,
                  }}
                />

                <div className="ml-16 md:ml-0 md:w-1/2 md:px-8">
                  <div
                    className={`p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md hover:border-[var(--primary)]/60 transition ${
                      index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-3 mb-2 ${
                        index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                      }`}
                    >
                      <span
                        className="font-orbitron text-lg font-bold"
                        style={{ color: event.color }}
                      >
                        {event.month} {event.days}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {event.year}
                      </span>
                    </div>

                    <h3 className="font-orbitron text-lg font-bold text-[var(--cream)]">
                      {event.title}
                    </h3>

                    <p className="text-xs text-[var(--muted)] mt-1">
                      {event.location}
                    </p>

                    <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>


      <div className="max-w-6xl mx-auto px-4 pb-16 text-center relative z-10">
        <Link
          to="/articles"
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-orbitron font-bold text-sm uppercase tracking-wider text-[var(--cream)] bg-[var(--primary)] hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)]"
        >
          Browse All Articles
          <FiArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>


      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}


      {selectedAudio && (
        <AudioModal
          audio={selectedAudio}
          onClose={() => setSelectedAudio(null)}
        />
      )}
    </div>
  );
};

export default Explore;
