import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiShare2,
  FiBookmark,
  FiHeart,
  FiStar,
  FiUser,
  FiZap,
  FiAward,
  FiTag,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';

// ============================================
// MOCK CHARACTERS
// ============================================
const ALL_CHARACTERS = [
  {
    id: 1,
    name: 'Gojo Satoru',
    title: 'The Strongest Sorcerer',
    series: 'Jujutsu Kaisen',
    category: CATEGORIES[0],
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600',
    rating: 5.0,
    likes: 2450,
    views: 45200,
    bio: 'The strongest jujutsu sorcerer of the modern era.',
    fullBio: `Gojo Satoru is one of the most powerful characters.

## Early Life
Gojo grew up as a prodigy.

## Powers & Abilities
- Limitless
- Six Eyes
- Domain Expansion

## Personality
Playful and carefree.`,
    abilities: ['Limitless', 'Six Eyes', 'Domain Expansion', 'Hollow Purple'],
    stats: [
      { label: 'Strength', value: 95 },
      { label: 'Speed', value: 98 },
      { label: 'Intelligence', value: 92 },
      { label: 'Technique', value: 100 },
      { label: 'Experience', value: 90 },
    ],
    tags: ['Sorcerer', 'Teacher', 'Limitless', 'Special Grade'],
    quote: "Throughout Heaven and Earth, I alone am the honored one.",
  },
  {
    id: 2,
    name: 'Luffy',
    title: 'Straw Hat Captain',
    series: 'One Piece',
    category: CATEGORIES[0],
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600',
    rating: 4.9,
    likes: 3120,
    views: 58900,
    bio: 'Monkey D. Luffy, captain of the Straw Hat Pirates.',
    fullBio: `Luffy is on a quest to become the Pirate King.

## The Dream
Find the One Piece.

## Devil Fruit
Gomu Gomu no Mi.

## Personality
Carefree and loyal.`,
    abilities: ['Gomu Gomu no Mi', 'Haki', 'Gear 5'],
    stats: [
      { label: 'Strength', value: 100 },
      { label: 'Speed', value: 95 },
      { label: 'Intelligence', value: 60 },
      { label: 'Technique', value: 85 },
      { label: 'Experience', value: 88 },
    ],
    tags: ['Pirate', 'Captain', 'Devil Fruit', 'Straw Hat'],
    quote: "I'm gonna be the Pirate King!",
  },
  {
    id: 3,
    name: 'Kratos',
    title: 'God of War',
    series: 'God of War',
    category: CATEGORIES[1],
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1600',
    rating: 4.8,
    likes: 1890,
    views: 32100,
    bio: 'The Ghost of Sparta.',
    fullBio: `Kratos is a Spartan warrior.

## The Ghost of Sparta
Haunted by the deaths of his family.

## Norse Saga
Trying to be a better father.

## Personality
Stoic and controlled.`,
    abilities: ['Spartan Rage', 'Leviathan Axe', 'Blades of Chaos'],
    stats: [
      { label: 'Strength', value: 100 },
      { label: 'Speed', value: 80 },
      { label: 'Intelligence', value: 85 },
      { label: 'Technique', value: 90 },
      { label: 'Experience', value: 100 },
    ],
    tags: ['Warrior', 'God', 'Father', 'Spartan'],
    quote: "Do not be sorry. Be better.",
  },
  {
    id: 4,
    name: 'Deadpool',
    title: 'The Merc with a Mouth',
    series: 'Marvel Comics',
    category: CATEGORIES[5],
    imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=1600',
    rating: 4.9,
    likes: 2780,
    views: 41800,
    bio: 'Wade Wilson, a mercenary with a healing factor.',
    fullBio: `Wade Winston Wilson, better known as Deadpool.

## Origin
Special forces operative diagnosed with cancer.

## The Healing Factor
Regenerate from almost any wound.

## Personality
Chaotic and hilarious.`,
    abilities: ['Healing Factor', 'Combat Mastery', 'Fourth Wall'],
    stats: [
      { label: 'Strength', value: 75 },
      { label: 'Speed', value: 78 },
      { label: 'Intelligence', value: 80 },
      { label: 'Technique', value: 88 },
      { label: 'Experience', value: 92 },
    ],
    tags: ['Mercenary', 'Anti-Hero', 'Funny', 'Regeneration'],
    quote: "Maximum effort!",
  },
  {
    id: 5,
    name: 'Goku',
    title: 'Super Saiyan',
    series: 'Dragon Ball',
    category: CATEGORIES[0],
    imageUrl: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=1600',
    rating: 5.0,
    likes: 4200,
    views: 72400,
    bio: 'The legendary Super Saiyan.',
    fullBio: `Son Goku is the main protagonist of Dragon Ball.

## Origin
Born on Planet Vegeta as Kakarot.

## Transformations
- Super Saiyan
- Ultra Instinct

## Personality
Pure-hearted and cheerful.`,
    abilities: ['Ultra Instinct', 'Kamehameha', 'Super Saiyan'],
    stats: [
      { label: 'Strength', value: 100 },
      { label: 'Speed', value: 100 },
      { label: 'Intelligence', value: 65 },
      { label: 'Technique', value: 92 },
      { label: 'Experience', value: 95 },
    ],
    tags: ['Saiyan', 'Fighter', 'Hero', 'Legendary'],
    quote: "I am the hope of the universe!",
  },
  {
    id: 6,
    name: 'Ellie Williams',
    title: 'The Immune Survivor',
    series: 'The Last of Us',
    category: CATEGORIES[3],
    imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800',
    bannerUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1600',
    rating: 4.7,
    likes: 1560,
    views: 28400,
    bio: 'A young woman immune to the Cordyceps infection.',
    fullBio: `Ellie Williams is the main protagonist of The Last of Us.

## The Immunity
Immune to Cordyceps.

## Journey with Joel
Forms the emotional core.

## Personality
Brave and stubborn.`,
    abilities: ['Immunity', 'Survival Skills', 'Stealth', 'Archery'],
    stats: [
      { label: 'Strength', value: 70 },
      { label: 'Speed', value: 75 },
      { label: 'Intelligence', value: 88 },
      { label: 'Technique', value: 85 },
      { label: 'Experience', value: 78 },
    ],
    tags: ['Survivor', 'Immune', 'Brave', 'Protagonist'],
    quote: "I'm not afraid of you anymore.",
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
const CharacterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const character = useMemo(() => {
    return ALL_CHARACTERS.find((c) => c.id === parseInt(id)) || ALL_CHARACTERS[0];
  }, [id]);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(character.likes);
  const [showShareToast, setShowShareToast] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      setScrollProgress(total > 0 ? (current / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('fhp_characters_bookmarks') || '[]');
    setIsBookmarked(bookmarks.some((b) => b.id === character.id));
    const likes = JSON.parse(localStorage.getItem('fhp_char_likes') || '[]');
    setIsLiked(likes.includes(character.id));
    setLikeCount(character.likes);
  }, [character.id, character.likes]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('fhp_characters_bookmarks') || '[]');
    const isAlreadySaved = bookmarks.some((b) => b.id === character.id);

    let updated;
    if (isAlreadySaved) {
      updated = bookmarks.filter((b) => b.id !== character.id);
    } else {
      updated = [
        ...bookmarks,
        {
          id: character.id,
          title: character.name,
          subtitle: character.title,
          type: 'Character',
          category: character.category,
          imageUrl: character.imageUrl,
          rating: character.rating,
          likes: character.likes,
          savedAt: new Date().toISOString(),
        },
      ];
    }
    localStorage.setItem('fhp_characters_bookmarks', JSON.stringify(updated));
    setIsBookmarked(!isAlreadySaved);
    localStorage.setItem('fhp_last_bookmark', '1');
  };

  const handleLike = () => {
    const likes = JSON.parse(localStorage.getItem('fhp_char_likes') || '[]');
    const updated = isLiked
      ? likes.filter((l) => l !== character.id)
      : [...likes, character.id];
    localStorage.setItem('fhp_char_likes', JSON.stringify(updated));
    setIsLiked(!isLiked);
    setLikeCount((c) => (isLiked ? c - 1 : c + 1));
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
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const relatedCharacters = useMemo(() => {
    return ALL_CHARACTERS.filter((c) => c.id !== character.id).slice(0, 3);
  }, [character]);

  const renderBio = (bio) => {
    return bio.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed === '') return null;

      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={i}
            className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)] mt-10 mb-4 relative pl-5"
          >
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
              style={{ backgroundColor: character.category.color }}
            />
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('- ')) {
        return (
          <li
            key={i}
            className="text-[var(--muted)] ml-6 mb-2 list-disc leading-relaxed"
          >
            {trimmed.replace('- ', '')}
          </li>
        );
      }

      return (
        <p
          key={i}
          className="text-[var(--muted)] leading-[1.85] mb-4 text-[17px]"
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">

      <div className="fixed top-0 left-0 right-0 z-50 h-1">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: character.category.color,
            boxShadow: `0 0 10px ${character.category.color}`,
          }}
        />
      </div>

      <section className="relative h-[70vh] min-h-[550px] overflow-hidden">
        <img
          src={character.bannerUrl}
          alt={character.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-[var(--bg)]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/80 via-[var(--bg)]/40 to-transparent" />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at 30% 80%, ${character.category.color}, transparent 60%)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />

        <button
          onClick={() => navigate('/characters')}
          className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] hover:border-[var(--primary)] transition text-sm"
        >
          <FiArrowLeft size={14} /> Back to Characters
        </button>

        <div className="relative z-20 h-full flex flex-col justify-end px-6 md:px-12 pb-16 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
            <Link to="/explore" className="hover:text-[var(--primary)] transition">
              Explore
            </Link>
            <span>/</span>
            <Link to="/characters" className="hover:text-[var(--primary)] transition">
              Characters
            </Link>
            <span>/</span>
            <span style={{ color: character.category.color }}>{character.name}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4"
                style={{ borderColor: character.category.color }}
              />
            </div>

            <div>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 backdrop-blur-md"
                style={{
                  backgroundColor: `${character.category.color}30`,
                  color: character.category.color,
                  border: `1px solid ${character.category.color}60`,
                }}
              >
                {character.category.name}
              </span>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                {character.series}
              </p>
            </div>
          </div>

          <h1 className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-black text-[var(--cream)] leading-[1.05] drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            {character.name}
          </h1>

          <p
            className="text-lg md:text-2xl font-semibold mt-2"
            style={{ color: character.category.color }}
          >
            {character.title}
          </p>

          <p className="text-[var(--muted)] mt-4 max-w-2xl text-sm md:text-base leading-relaxed">
            {character.bio}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <span className="flex items-center gap-1.5 backdrop-blur-md bg-[var(--nav)]/40 rounded-full px-3 py-1.5 border border-[var(--border)] text-xs text-[var(--muted)]">
              <FiStar size={12} className="text-[var(--yellow)]" /> {character.rating}
            </span>
            <span className="flex items-center gap-1.5 backdrop-blur-md bg-[var(--nav)]/40 rounded-full px-3 py-1.5 border border-[var(--border)] text-xs text-[var(--muted)]">
              <FiHeart size={12} className="text-[var(--primary)]" /> {character.likes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 backdrop-blur-md bg-[var(--nav)]/40 rounded-full px-3 py-1.5 border border-[var(--border)] text-xs text-[var(--muted)]">
              {character.views.toLocaleString()} views
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-[60px] md:h-[80px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 C320,120 420,0 720,40 C1020,80 1120,20 1440,60 L1440,120 L0,120 Z"
              fill="var(--bg)"
            />
          </svg>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 -mt-6 relative z-30">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-xl p-3 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                isLiked
                  ? 'text-[var(--cream)] shadow-[0_0_20px_var(--glow)]'
                  : 'bg-[var(--nav)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
              }`}
              style={{
                backgroundColor: isLiked ? character.category.color : undefined,
              }}
            >
              <FiHeart size={14} className={isLiked ? 'fill-current' : ''} />
              {likeCount.toLocaleString()}
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                isBookmarked
                  ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)]'
                  : 'bg-[var(--nav)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
              }`}
            >
              <FiBookmark
                size={14}
                className={isBookmarked ? 'fill-current' : ''}
              />
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--nav)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)] transition"
          >
            <FiShare2 size={14} /> Share
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div className="text-[var(--cream)]">
            {renderBio(character.fullBio)}

            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--muted)] mr-2 self-center flex items-center gap-1">
                <FiTag size={12} /> Tags:
              </span>
              {character.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-[var(--surface)]/60 border border-[var(--border)] text-[var(--muted)] text-xs hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {character.quote && (
              <div className="mt-10 p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md relative overflow-hidden">
                <div
                  className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-[80px] opacity-30 pointer-events-none"
                  style={{ backgroundColor: character.category.color }}
                />
                <span className="text-5xl text-[var(--primary)] font-orbitron leading-none">❝</span>
                <p className="font-orbitron text-xl md:text-2xl font-bold text-[var(--cream)] leading-tight mt-2">
                  {character.quote}
                </p>
                <p className="text-xs uppercase tracking-widest text-[var(--muted)] mt-4">
                  — {character.name}
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md overflow-hidden">
              <div
                className="px-5 py-3 border-b border-[var(--border)]"
                style={{ backgroundColor: `${character.category.color}15` }}
              >
                <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] uppercase tracking-wider flex items-center gap-2">
                  <FiZap size={14} style={{ color: character.category.color }} />
                  Stats
                </h3>
              </div>

              <div className="p-5 space-y-4">
                {character.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                        {stat.label}
                      </span>
                      <span
                        className="text-sm font-bold font-orbitron"
                        style={{ color: character.category.color }}
                      >
                        {stat.value}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--nav)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${stat.value}%`,
                          backgroundColor: character.category.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md overflow-hidden">
              <div
                className="px-5 py-3 border-b border-[var(--border)]"
                style={{ backgroundColor: `${character.category.color}15` }}
              >
                <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] uppercase tracking-wider flex items-center gap-2">
                  <FiAward size={14} style={{ color: character.category.color }} />
                  Abilities
                </h3>
              </div>

              <div className="p-5 flex flex-wrap gap-2">
                {character.abilities.map((ability) => (
                  <span
                    key={ability}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${character.category.color}20`,
                      color: character.category.color,
                      border: `1px solid ${character.category.color}40`,
                    }}
                  >
                    {ability}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
              <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiUser size={14} style={{ color: character.category.color }} />
                Info
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    Series
                  </span>
                  <span className="text-sm font-semibold text-[var(--cream)] text-right">
                    {character.series}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-[var(--border)]">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    Category
                  </span>
                  <span
                    className="text-sm font-semibold text-right"
                    style={{ color: character.category.color }}
                  >
                    {character.category.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-[var(--border)]">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    Rating
                  </span>
                  <span className="text-sm font-semibold text-[var(--yellow)] flex items-center gap-1">
                    <FiStar size={12} className="fill-current" /> {character.rating}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">
            More Characters
          </h2>
          <Link
            to="/characters"
            className="text-xs text-[var(--primary)] hover:text-[var(--yellow)] transition flex items-center gap-1"
          >
            View All <FiArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {relatedCharacters.map((char) => (
            <Link
              key={char.id}
              to={`/characters/${char.id}`}
              className="group relative rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/60 transition-all duration-300 aspect-[3/4]"
            >
              <img
                src={char.imageUrl}
                alt={char.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />

              <div className="absolute top-3 left-3">
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: `${char.category.color}30`,
                    color: char.category.color,
                    border: `1px solid ${char.category.color}60`,
                  }}
                >
                  {char.category.name}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                  {char.series}
                </p>
                <h3 className="font-orbitron text-base font-bold text-[var(--cream)] leading-tight">
                  {char.name}
                </h3>
                <p className="text-[11px] text-[var(--muted)] mt-1 line-clamp-1">
                  {char.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] text-sm font-semibold shadow-[0_0_20px_var(--glow)] flex items-center gap-2">
          <FiCheck size={16} /> Link copied!
        </div>
      )}
    </div>
  );
};

export default CharacterDetails;