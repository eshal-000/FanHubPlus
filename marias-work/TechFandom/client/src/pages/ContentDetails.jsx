import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiArrowLeft,
  FiShare2,
  FiBookmark,
  FiHeart,
  FiStar,
  FiCheck,
  FiZap,
  FiAward,
  FiTrendingUp,
  FiCopy,
  FiUsers,
  FiTwitter,
  FiMessageCircle,
  FiChevronUp,
  FiChevronRight,
  FiHome,
  FiTarget,
  FiActivity,
  FiShield,
  FiEye,
} from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';

// ============================================
// IMAGE IMPORTS
// ============================================
import gojoImg from '../assets/gojo.jpg';
import luffyImg from '../assets/luffy.jpg';
import kratosImg from '../assets/kratos.jpg';
import deadpoolImg from '../assets/deadpool.jpg';
import leviImg from '../assets/levi.jpg';
import ellieImg from '../assets/ellie.jpg';

const CHARACTER_IMAGES = {
  'Gojo Satoru': gojoImg,
  'Monkey D. Luffy': luffyImg,
  'Kratos': kratosImg,
  'Deadpool': deadpoolImg,
  'Levi Ackerman': leviImg,
  'Ellie Williams': ellieImg,
};

// ============================================
// MOCK FALLBACK
// ============================================
const MOCK_CHARACTERS = {
  '1': {
    _id: '1',
    name: 'Gojo Satoru',
    title: 'The Strongest',
    series: 'Jujutsu Kaisen',
    categorySlug: 'anime',
    bio: 'The strongest jujutsu sorcerer of the modern era. Known for his limitless cursed technique and Six Eyes.',
    fullBio:
      'Satoru Gojo is a special grade jujutsu sorcerer and widely recognized as the strongest in the world. He is a teacher at Tokyo Jujutsu High and uses his influence to protect and train strong young allies. Gojo possesses the Limitless technique and the Six Eyes, making him nearly invincible in combat.',
    abilities: ['Limitless', 'Six Eyes', 'Domain Expansion: Unlimited Void', 'Reverse Cursed Technique'],
    stats: [
      { label: 'Power', value: 100 },
      { label: 'Speed', value: 95 },
      { label: 'Intelligence', value: 98 },
      { label: 'Technique', value: 100 },
    ],
    quote: 'Throughout Heaven and Earth, I alone am the honored one.',
    rating: 5.0,
    likes: 2450,
    views: 12400,
    tags: ['Strongest', 'Sorcerer', 'Teacher'],
  },
  '2': {
    _id: '2',
    name: 'Monkey D. Luffy',
    title: 'Future Pirate King',
    series: 'One Piece',
    categorySlug: 'anime',
    bio: 'Captain of the Straw Hat Pirates. Dreams of becoming the Pirate King and finding the legendary One Piece.',
    fullBio:
      'Monkey D. Luffy is the main protagonist of One Piece. He ate the Gum-Gum Fruit, which turned his body into rubber. After the timeskip, he learned to use Haki and unlocked the true power of his Devil Fruit — Gear 5, the Sun God Nika.',
    abilities: ['Gum-Gum Fruit', 'Gear 5 (Nika)', "Conqueror's Haki", 'Advanced Armament Haki'],
    stats: [
      { label: 'Power', value: 96 },
      { label: 'Speed', value: 92 },
      { label: 'Intelligence', value: 65 },
      { label: 'Willpower', value: 100 },
    ],
    quote: "I'm gonna be the Pirate King!",
    rating: 4.9,
    likes: 3120,
    views: 18700,
    tags: ['Pirate', 'Captain', 'Rubber'],
  },
  '3': {
    _id: '3',
    name: 'Kratos',
    title: 'Ghost of Sparta',
    series: 'God of War',
    categorySlug: 'gaming',
    bio: 'Former Greek God of War turned Norse father. Seeks redemption while protecting his son Atreus.',
    fullBio:
      'Kratos is a Spartan warrior who became the God of War after killing Ares. Consumed by vengeance, he destroyed the Greek pantheon. Now in Norse lands, he raises his son Atreus (Loki) while battling gods and monsters.',
    abilities: ['Spartan Rage', 'Leviathan Axe', 'Blades of Chaos', 'God-like Strength'],
    stats: [
      { label: 'Power', value: 98 },
      { label: 'Speed', value: 80 },
      { label: 'Intelligence', value: 75 },
      { label: 'Rage', value: 100 },
    ],
    quote: 'Do not be sorry. Be better.',
    rating: 4.8,
    likes: 1890,
    views: 15200,
    tags: ['God of War', 'Spartan', 'Father'],
  },
  '4': {
    _id: '4',
    name: 'Deadpool',
    title: 'The Merc with a Mouth',
    series: 'Marvel Comics',
    categorySlug: 'comics',
    bio: 'Wade Wilson — a wisecracking mercenary with a healing factor who breaks the fourth wall.',
    fullBio:
      'Wade Wilson was a special forces operative who underwent an experimental treatment to cure his cancer. The treatment gave him an accelerated healing factor but left him horribly scarred. Now he operates as Deadpool, a mercenary who constantly breaks the fourth wall.',
    abilities: ['Accelerated Healing', 'Master Martial Artist', 'Fourth Wall Breaking', 'Regeneration'],
    stats: [
      { label: 'Power', value: 70 },
      { label: 'Speed', value: 78 },
      { label: 'Intelligence', value: 85 },
      { label: 'Humor', value: 100 },
    ],
    quote: 'Maximum effort!',
    rating: 4.9,
    likes: 2780,
    views: 14300,
    tags: ['Mercenary', 'Marvel', 'Anti-Hero'],
  },
  '5': {
    _id: '5',
    name: 'Levi Ackerman',
    title: "Humanity's Strongest",
    series: 'Attack on Titan',
    categorySlug: 'anime',
    bio: 'Captain of the Survey Corps. Known for his incredible combat skills and Ackerman bloodline.',
    fullBio:
      "Levi Ackerman is a captain in the Survey Corps and is widely regarded as humanity's strongest soldier. His Ackerman bloodline grants him superhuman strength and reflexes. Despite his cold exterior, he deeply cares for his comrades.",
    abilities: ['Ackerman Strength', 'ODM Gear Mastery', 'Dual Blades', 'Titan Slaying'],
    stats: [
      { label: 'Power', value: 90 },
      { label: 'Speed', value: 98 },
      { label: 'Intelligence', value: 85 },
      { label: 'Precision', value: 100 },
    ],
    quote: "The only thing we're allowed to do is believe that we won't regret the choice we made.",
    rating: 4.9,
    likes: 2980,
    views: 16800,
    tags: ['Survey Corps', 'Ackerman', 'Captain'],
  },
  '6': {
    _id: '6',
    name: 'Ellie Williams',
    title: 'The Immune',
    series: 'The Last of Us',
    categorySlug: 'gaming',
    bio: 'A young survivor immune to the Cordyceps infection. Carries the hope of a cure.',
    fullBio:
      'Ellie Williams is a young woman who survived the Cordyceps outbreak. She discovered she is immune to the infection, making her the key to a possible cure. She travels with Joel, who becomes a father figure to her.',
    abilities: ['Immunity', 'Stealth', 'Survival Skills', 'Switchblade Combat'],
    stats: [
      { label: 'Power', value: 65 },
      { label: 'Speed', value: 75 },
      { label: 'Intelligence', value: 85 },
      { label: 'Survival', value: 95 },
    ],
    quote: "I'm immune. I can't get infected.",
    rating: 4.7,
    likes: 1650,
    views: 12800,
    tags: ['Survivor', 'Immune', 'Hunter'],
  },
};

// ============================================
// HELPERS
// ============================================
const getTier = (rating = 0) => {
  if (rating >= 4.9) return { label: 'S-Tier', color: '#FFD166' };
  if (rating >= 4.5) return { label: 'A-Tier', color: '#7CE7C4' };
  if (rating >= 4.0) return { label: 'B-Tier', color: '#8CB3FF' };
  return { label: 'C-Tier', color: '#B7B7C9' };
};

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'abilities', label: 'Abilities' },
  { key: 'tags', label: 'Tags' },
];

// ============================================
// FLOATING PARTICLES (CSS-only, uses category color)
// ============================================
const FloatingParticles = ({ color }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 2,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 5,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color,
            opacity: 0.4,
            animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.4); opacity: 0.7; }
        }
        @keyframes meshMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 20px) scale(0.95); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

// ============================================
// SKELETON
// ============================================
const DetailsSkeleton = () => (
  <div className="min-h-screen bg-[var(--bg)] animate-pulse">
    <div className="h-[400px] md:h-[440px] bg-[var(--surface)]/40" />
    <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-30">
      <div className="h-16 rounded-2xl bg-[var(--surface)]/60 border border-[var(--border)]" />
    </div>
    <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-6 w-2/3 rounded bg-[var(--surface)]/60" />
        <div className="h-4 w-full rounded bg-[var(--surface)]/40" />
        <div className="h-4 w-5/6 rounded bg-[var(--surface)]/40" />
        <div className="h-4 w-3/4 rounded bg-[var(--surface)]/40" />
      </div>
      <div className="space-y-4">
        <div className="h-40 rounded-2xl bg-[var(--surface)]/40 border border-[var(--border)]" />
        <div className="h-40 rounded-2xl bg-[var(--surface)]/40 border border-[var(--border)]" />
      </div>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
const CharacterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showQuoteToast, setShowQuoteToast] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [progress, setProgress] = useState(0);

  const actionBarRef = useRef(null);
  const shareMenuRef = useRef(null);

  // ============ FETCH ============
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/characters/${id}`);
        const char = data.character || data.data || data;
        setCharacter(char);
        setLikeCount(char?.likes || 0);
      } catch (err) {
        console.error('Fetch character error:', err);
        const fallback = MOCK_CHARACTERS[id] || null;
        setCharacter(fallback);
        setLikeCount(fallback?.likes || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
    setActiveTab('overview');
    setIsLiked(false);
    setIsBookmarked(false);
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // ============ SCROLL EFFECTS ============
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
      setShowScrollTop(scrolled > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============ STICKY BAR ============
  useEffect(() => {
    const node = actionBarRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [character]);

  // ============ CLOSE SHARE MENU ON CLICK OUTSIDE ============
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============ KEYBOARD SHORTCUTS ============
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'l' || e.key === 'L') toggleLike();
      if (e.key === 's' || e.key === 'S') setIsBookmarked((v) => !v);
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const category = useMemo(() => {
    if (!character) return CATEGORIES[0];
    return CATEGORIES.find((c) => c.slug === character.categorySlug) || CATEGORIES[0];
  }, [character]);

  const imageSrc = useMemo(() => {
    if (!character) return '';
    return CHARACTER_IMAGES[character.name] || character.imageUrl || '';
  }, [character]);

  const tier = useMemo(() => getTier(character?.rating), [character]);

  const relatedCharacters = useMemo(() => {
    if (!character) return [];
    return Object.values(MOCK_CHARACTERS)
      .filter((c) => c._id !== character._id && c.categorySlug === character.categorySlug)
      .slice(0, 4);
  }, [character]);

  const toggleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      setLikeCount((count) => count + (next ? 1 : -1));
      return next;
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: character.name,
          text: character.bio,
          url: window.location.href,
        });
      } else {
        setShowShareMenu((v) => !v);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setShowShareMenu(false);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const handleCopyQuote = async () => {
    if (!character?.quote) return;
    try {
      await navigator.clipboard.writeText(`"${character.quote}" — ${character.name}`);
      setShowQuoteToast(true);
      setTimeout(() => setShowQuoteToast(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (loading) return <DetailsSkeleton />;

  if (!character) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4">
        <p className="text-[var(--cream)] text-lg font-orbitron mb-4">Character not found</p>
        <button
          onClick={() => navigate('/characters')}
          className="px-6 py-2 rounded-full bg-[var(--primary)] text-[var(--cream)] text-sm font-semibold"
        >
          Back to Characters
        </button>
      </div>
    );
  }

  const ratingPct = Math.min(100, ((character.rating || 0) / 5) * 100);
  const ringCircumference = 2 * Math.PI * 26;
  const ringOffset = ringCircumference - (ratingPct / 100) * ringCircumference;

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">

      {/* ============================================ */}
      {/* READING PROGRESS BAR */}
      {/* ============================================ */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${category.color}, var(--primary))`,
          }}
        />
      </div>

      {/* ============================================ */}
      {/* STICKY MINI HEADER */}
      {/* ============================================ */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          showStickyBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-[var(--nav)]/90 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-[var(--surface)]/60 text-[var(--cream)] transition"
              >
                <FiArrowLeft size={16} />
              </button>
              <span className="font-orbitron text-sm font-bold text-[var(--cream)] truncate">
                {character.name}
              </span>
              <span
                className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}50` }}
              >
                {tier.label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleLike}
                className="p-2 rounded-full hover:bg-[var(--surface)]/60 transition"
                style={{ color: isLiked ? category.color : 'var(--muted)' }}
              >
                <FiHeart size={15} className={isLiked ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => setIsBookmarked((v) => !v)}
                className="p-2 rounded-full hover:bg-[var(--surface)]/60 transition"
                style={{ color: isBookmarked ? 'var(--primary)' : 'var(--muted)' }}
              >
                <FiBookmark size={15} className={isBookmarked ? 'fill-current' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* HERO — CSS ONLY, Mesh Gradient + Particles */}
      {/* ============================================ */}
      <section
        className="relative h-[420px] md:h-[480px] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${category.color}18 0%, var(--bg) 55%, var(--bg) 100%)`,
        }}
      >
        {/* Animated mesh blobs */}
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-25 blur-[120px]"
          style={{
            backgroundColor: category.color,
            animation: 'meshMove 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[var(--primary)] opacity-15 blur-[120px]"
          style={{ animation: 'meshMove 15s ease-in-out infinite reverse' }}
        />

        {/* Floating particles */}
        <FloatingParticles color={category.color} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${category.color} 1px, transparent 1px), linear-gradient(90deg, ${category.color} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Ghost initial */}
        <div
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 font-orbitron font-black select-none pointer-events-none"
          style={{
            fontSize: 'clamp(140px, 22vw, 300px)',
            color: `${category.color}12`,
            lineHeight: 1,
          }}
        >
          {character.name.charAt(0)}
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] text-sm hover:border-[var(--primary)]/60 transition"
        >
          <FiArrowLeft size={14} /> Back
        </button>

        {/* Tier badge */}
        <div
          className="absolute top-6 right-6 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-md border text-[11px] font-bold uppercase tracking-widest"
          style={{ backgroundColor: `${tier.color}18`, borderColor: `${tier.color}55`, color: tier.color }}
        >
          <FiAward size={13} /> {tier.label}
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-20 left-6 z-30 hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--muted)]">
          <Link to="/characters" className="hover:text-[var(--cream)] transition flex items-center gap-1">
            <FiHome size={10} /> Characters
          </Link>
          <FiChevronRight size={10} />
          <span style={{ color: category.color }}>{category.name}</span>
          <FiChevronRight size={10} />
          <span className="text-[var(--cream)]">{character.name}</span>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-12">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
              style={{
                backgroundColor: `${category.color}25`,
                color: category.color,
                border: `1px solid ${category.color}60`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
              {category.name}
            </span>
            {character.title && (
              <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-[var(--surface)]/60 backdrop-blur-md border border-[var(--border)] text-[var(--yellow)]">
                {character.title}
              </span>
            )}
          </div>

          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-[var(--cream)] leading-tight">
            {character.name}
          </h1>

          {character.series && (
            <p className="text-sm md:text-base text-[var(--muted)] mt-2">
              From <span className="text-[var(--primary)] font-semibold">{character.series}</span>
            </p>
          )}

          <div className="flex items-center gap-6 mt-5 text-xs">
            <span className="flex items-center gap-1.5 text-[var(--yellow)]">
              <FiStar size={14} className="fill-current" />
              <span className="font-bold">{character.rating?.toFixed(1) || '4.8'}</span>
            </span>
            <span className="flex items-center gap-1.5" style={{ color: isLiked ? category.color : 'var(--primary)' }}>
              <FiHeart size={14} className={isLiked ? 'fill-current' : ''} />
              <span className="font-bold">{likeCount.toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--muted)]">
              <FiTrendingUp size={14} />
              <span className="font-bold">{character.views?.toLocaleString() || 0} views</span>
            </span>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ACTION BAR */}
      {/* ============================================ */}
      <section ref={actionBarRef} className="max-w-6xl mx-auto px-4 -mt-6 relative z-30">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${
                isLiked ? 'text-[var(--cream)]' : 'bg-[var(--nav)]/60 text-[var(--muted)] border border-[var(--border)]'
              }`}
              style={{ backgroundColor: isLiked ? category.color : undefined }}
            >
              <FiHeart size={14} className={isLiked ? 'fill-current' : ''} />
              {isLiked ? 'Liked' : 'Like'}
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${
                isBookmarked ? 'bg-[var(--primary)] text-[var(--cream)]' : 'bg-[var(--nav)]/60 text-[var(--muted)] border border-[var(--border)]'
              }`}
            >
              <FiBookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
              {isBookmarked ? 'Saved' : 'Save'}
            </button>

            <span className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] text-[var(--muted)] border border-[var(--border)] bg-[var(--nav)]/40">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)]/60 text-[var(--cream)] text-[9px] font-mono">L</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)]/60 text-[var(--cream)] text-[9px] font-mono">S</kbd>
              <span className="ml-1">shortcuts</span>
            </span>
          </div>

          {/* Share with dropdown */}
          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--nav)]/60 text-[var(--muted)] border border-[var(--border)] hover:text-[var(--cream)] transition"
            >
              <FiShare2 size={14} /> Share
            </button>

            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl p-2 shadow-2xl z-50">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--cream)] hover:bg-[var(--primary)]/20 transition"
                >
                  <FiCopy size={14} /> Copy link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=Check out ${encodeURIComponent(character.name)} on Fan Hub Plus&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--cream)] hover:bg-[var(--primary)]/20 transition"
                >
                  <FiTwitter size={14} /> Share on X
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${character.name} on Fan Hub Plus: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--cream)] hover:bg-[var(--primary)]/20 transition"
                >
                  <FiMessageCircle size={14} /> WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quote — voice style */}
            {character.quote && (
              <div
                className="relative pl-6 py-2 border-l-4 group"
                style={{ borderColor: category.color }}
              >
                <div
                  className="absolute -top-2 -left-3 text-5xl font-serif opacity-30 select-none"
                  style={{ color: category.color }}
                >
                  "
                </div>
                <p className="text-lg md:text-xl italic text-[var(--cream)] leading-relaxed pr-8">
                  {character.quote}
                </p>
                <p className="text-xs text-[var(--muted)] mt-2 uppercase tracking-widest">
                  — {character.name}
                </p>
                <button
                  onClick={handleCopyQuote}
                  className="absolute top-2 right-0 p-2 rounded-full text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--cream)] transition"
                >
                  <FiCopy size={14} />
                </button>
              </div>
            )}

            {/* Tabs */}
            <div>
              <div className="flex items-center gap-1 border-b border-[var(--border)] mb-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative px-4 py-3 text-sm font-semibold transition"
                    style={{ color: activeTab === tab.key ? 'var(--cream)' : 'var(--muted)' }}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <span
                        className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div>
                  <h2 className="font-orbitron text-xl font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full" style={{ backgroundColor: category.color }} />
                    About
                  </h2>
                  <p className="text-[var(--muted)] leading-[1.85] text-[16px]">
                    {character.fullBio || character.bio || 'No bio available.'}
                  </p>
                </div>
              )}

              {activeTab === 'abilities' && character.abilities?.length > 0 && (
                <div>
                  <h2 className="font-orbitron text-xl font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                    <FiZap className="text-[var(--yellow)]" size={18} />
                    Abilities & Powers
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {character.abilities.map((ability, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md hover:border-[var(--primary)]/50 transition"
                      >
                        <div
                          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-orbitron font-bold text-sm"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-sm text-[var(--cream)]">{ability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tags' && character.tags?.length > 0 && (
                <div>
                  <h2 className="font-orbitron text-xl font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                    <FiAward className="text-[var(--primary)]" size={18} />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {character.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full bg-[var(--surface)]/60 border border-[var(--border)] text-[var(--muted)] text-xs hover:border-[var(--primary)]/50 hover:text-[var(--cream)] transition cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related characters */}
            {relatedCharacters.length > 0 && (
              <div>
                <h2 className="font-orbitron text-xl font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                  <FiUsers className="text-[var(--primary)]" size={18} />
                  More from {category.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedCharacters.map((rc) => (
                    <Link
                      key={rc._id}
                      to={`/characters/${rc._id}`}
                      className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-4 hover:border-[var(--primary)]/50 transition"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-orbitron font-bold text-sm mb-3"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {rc.name.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-[var(--cream)] truncate group-hover:text-[var(--primary)] transition">
                        {rc.name}
                      </p>
                      <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">{rc.series}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* Rating ring */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6 flex items-center gap-5">
              <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="var(--border)" strokeWidth="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke={tier.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div>
                <p className="font-orbitron text-2xl font-black text-[var(--cream)]">
                  {character.rating?.toFixed(1) || '4.8'}
                  <span className="text-sm font-normal text-[var(--muted)]">/5</span>
                </p>
                <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: tier.color }}>
                  {tier.label} Fighter
                </p>
              </div>
            </div>

            {/* Stats with icons */}
            {character.stats?.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
                <h3 className="font-orbitron text-base font-bold text-[var(--cream)] mb-5 flex items-center gap-2">
                  <FiActivity className="text-[var(--primary)]" size={16} />
                  Stats
                </h3>
                <div className="space-y-4">
                  {character.stats.map((stat, i) => {
                    const icons = [FiTarget, FiZap, FiEye, FiShield];
                    const Icon = icons[i % icons.length];
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <span className="text-[var(--muted)] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                            <Icon size={11} /> {stat.label}
                          </span>
                          <span className="font-orbitron font-bold text-[var(--cream)]">
                            {stat.value}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${stat.value}%`,
                              background: `linear-gradient(90deg, ${category.color}, var(--primary))`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick info */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
              <h3 className="font-orbitron text-base font-bold text-[var(--cream)] mb-5">
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Series</span>
                  <span className="text-[var(--cream)] font-semibold">{character.series || '—'}</span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Category</span>
                  <span className="font-semibold" style={{ color: category.color }}>
                    {category.name}
                  </span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Rating</span>
                  <span className="flex items-center gap-1 text-[var(--yellow)] font-semibold">
                    <FiStar size={12} className="fill-current" />
                    {character.rating?.toFixed(1) || '4.8'}
                  </span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Likes</span>
                  <span className="text-[var(--primary)] font-semibold">
                    {likeCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/characters"
              className="block text-center px-6 py-3 rounded-full border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md text-[var(--cream)] text-sm font-semibold hover:border-[var(--primary)]/60 transition"
            >
              ← Browse All Characters
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SCROLL TO TOP */}
      {/* ============================================ */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_25px_var(--glow)] flex items-center justify-center transition-all duration-300 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <FiChevronUp size={20} />
      </button>

      {/* Toasts */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] text-sm font-semibold flex items-center gap-2 shadow-[0_0_25px_var(--glow)]">
          <FiCheck size={16} /> Link copied!
        </div>
      )}
      {showQuoteToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] text-sm font-semibold flex items-center gap-2 shadow-[0_0_25px_var(--glow)]">
          <FiCheck size={16} /> Quote copied!
        </div>
      )}
    </div>
  );
};

export default CharacterDetails;