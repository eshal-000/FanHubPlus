import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mariaApi from '../services/mariaApi';
import {
  FiSearch,
  FiSliders,
  FiUser,
  FiStar,
  FiHeart,
  FiBookmark,
  FiFilter,
  FiX,
  FiZap,
  FiAward,
  FiTrendingUp,
  FiActivity,
} from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';
import LoginPromptModal from '../components/common/LoginPromptModal';
import useBookmarks from '../hooks/useBookmarks';
import { getCharacterImage } from '../utils/characterImages';



import heroBg from '../assets/characters-hero.jpg';



const CharacterCard = ({ character, category }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(character.likes || 0);
  const { closeLoginPrompt, isBookmarked, showLoginPrompt, toggle } = useBookmarks();
  const saved = isBookmarked(character._id);

  useEffect(() => {
    const liked = JSON.parse(
      localStorage.getItem('fhp_liked_characters') || '[]'
    );
    if (liked.includes(character._id)) {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  }, [character._id]);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggle(character._id, 'character');
    } catch (err) {
      console.error('Bookmark character error:', err);
    }
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const liked = JSON.parse(
      localStorage.getItem('fhp_liked_characters') || '[]'
    );
    if (isLiked) {
      localStorage.setItem(
        'fhp_liked_characters',
        JSON.stringify(liked.filter((id) => id !== character._id))
      );
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      localStorage.setItem(
        'fhp_liked_characters',
        JSON.stringify([...liked, character._id])
      );
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const imageSrc = getCharacterImage(character);

  return (
    <>
      <Link
        to={`/characters/${character._id}`}
        className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md hover:border-[var(--primary)]/60 hover:shadow-[0_0_25px_var(--glow)] transition-all duration-300 flex flex-col"
      >
        <div className="relative aspect-square overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={character.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--surface)] text-[var(--muted)]">
              <span className="font-orbitron text-5xl font-black opacity-40">
                {character.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          {category && (
            <span
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
              style={{
                backgroundColor: `${category.color}30`,
                color: category.color,
                border: `1px solid ${category.color}50`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>
          )}
          <button
            onClick={handleBookmark}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition z-10 ${
              saved
                ? 'bg-[var(--primary)] text-[var(--cream)]'
                : 'bg-black/50 text-[var(--cream)] hover:bg-[var(--primary)]'
            }`}
            aria-label="Bookmark"
            aria-pressed={saved}
          >
            <FiBookmark
              size={14}
              className={saved ? 'fill-current' : ''}
            />
          </button>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-orbitron text-base font-bold text-[var(--cream)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
            {character.name}
          </h3>
          {character.series && (
            <p className="text-[10px] uppercase tracking-wider text-[var(--yellow)] font-semibold mt-1">
              {character.series}
            </p>
          )}
          <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2 flex-1">
            {character.bio || 'No bio available.'}
          </p>
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[var(--muted)]">
              <FiStar size={12} className="text-[var(--yellow)]" />
              <span>{character.rating?.toFixed(1) || '4.8'}</span>
            </div>


            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition ${
                isLiked
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--primary)]'
              }`}
              aria-label="Like"
            >
              <FiHeart size={12} className={isLiked ? 'fill-current' : ''} />
              <span>{likeCount.toLocaleString()}</span>
            </button>
          </div>
        </div>
      </Link>
      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </>
  );
};

const PodiumPortrait = ({ character, className, fallbackStyle, textClassName }) => {
  const image = getCharacterImage(character);

  if (image) {
    return (
      <img
        src={image}
        alt={character.name}
        className={`${className} object-cover group-hover:scale-110 transition-transform`}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center font-orbitron font-black ${textClassName} group-hover:scale-110 transition-transform`}
      style={fallbackStyle}
    >
      {character.name.charAt(0)}
    </div>
  );
};



const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await mariaApi.get('/characters');
        let items = [];
        if (Array.isArray(response.data)) items = response.data;
        else if (response.data?.characters) items = response.data.characters;
        else if (response.data?.data) items = response.data.data;
        setCharacters(items);
      } catch (err) {
        console.error('Fetch characters error:', err);
        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  const filteredCharacters = useMemo(() => {
    if (!Array.isArray(characters)) return [];
    let list = characters.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.series?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || c.categorySlug === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    if (sortBy === 'popular')
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    else if (sortBy === 'rating')
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'az')
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [characters, searchQuery, selectedCategory, sortBy]);

  const topCharacters = useMemo(() => {
    if (!Array.isArray(characters)) return [];
    return [...characters]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 3);
  }, [characters]);

  const activeCategories = useMemo(() => {
    if (!Array.isArray(characters)) return [];
    return CATEGORIES.filter((cat) =>
      characters.some((c) => c.categorySlug === cat.slug)
    );
  }, [characters]);

  const maxCategoryCount = useMemo(() => {
    if (!Array.isArray(characters)) return 1;
    return Math.max(
      ...activeCategories.map(
        (cat) =>
          characters.filter((c) => c.categorySlug === cat.slug).length
      ),
      1
    );
  }, [characters, activeCategories]);

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      
      <section className="relative h-[280px] md:h-[320px] overflow-hidden rounded-b-[60px]">
        <img
          src={heroBg}
          alt="Characters hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.35) saturate(0.8)' }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/50 bg-[var(--surface)]/40 backdrop-blur-md px-3 py-1 mb-4">
            <FiUser className="text-[var(--primary)]" size={12} />
            <span className="text-[10px] tracking-widest text-[var(--yellow)] font-semibold uppercase">
              Character Profiles
            </span>
          </div>

          <h1 className="font-orbitron text-3xl md:text-5xl font-black text-[var(--cream)] leading-tight">
            Legends of the{' '}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--raspberry)] bg-clip-text text-transparent">
              Fandom
            </span>
          </h1>

          <p className="text-xs md:text-sm text-[var(--muted)] mt-3 max-w-md">
            Iconic heroes, villains, and everything in between
          </p>
        </div>
      </section>

      
      <section className="max-w-6xl mx-auto px-4 mt-12 mb-10">
        <div className="flex items-center gap-2 mb-5">
          <FiTrendingUp className="text-[var(--primary)]" />
          <h2 className="font-orbitron text-lg md:text-xl font-bold text-[var(--cream)]">
            This Week
          </h2>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 backdrop-blur-md py-6">
          <div className="flex flex-col items-center px-4">
            <FiZap className="text-[var(--yellow)] mb-2" size={20} />
            <p className="font-orbitron text-2xl md:text-3xl font-black text-[var(--cream)]">
              {characters.length || 0}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-1">
              Characters
            </p>
          </div>

          <div className="flex flex-col items-center px-4">
            <FiHeart className="text-[var(--primary)] mb-2" size={20} />
            <p className="font-orbitron text-2xl md:text-3xl font-black text-[var(--cream)]">
              {characters
                .reduce((sum, c) => sum + (c.likes || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-1">
              Total Likes
            </p>
          </div>

          <div className="flex flex-col items-center px-4">
            <FiStar className="text-[var(--yellow)] mb-2" size={20} />
            <p className="font-orbitron text-2xl md:text-3xl font-black text-[var(--cream)]">
              {(
                characters.reduce((sum, c) => sum + (c.rating || 0), 0) /
                (characters.length || 1)
              ).toFixed(1)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-1">
              Avg Rating
            </p>
          </div>
        </div>
      </section>

      
      {topCharacters.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mb-14">
          <div className="flex items-center gap-2 mb-6">
            <FiAward className="text-[var(--yellow)]" />
            <h2 className="font-orbitron text-lg md:text-xl font-bold text-[var(--cream)]">
              Hall of Legends
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCharacters.map((char, idx) => {
              const cat = CATEGORIES.find((c) => c.slug === char.categorySlug);
              const img = getCharacterImage(char);
              const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

              return (
                <Link
                  key={char._id}
                  to={`/characters/${char._id}`}
                  className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/30 backdrop-blur-md hover:border-[var(--primary)]/60 transition-all duration-300"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--surface)] text-[var(--muted)]">
                        <span className="font-orbitron text-7xl font-black opacity-30">
                          {char.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />

                    <div
                      className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-black text-lg backdrop-blur-md border-2"
                      style={{
                        backgroundColor: `${rankColors[idx]}20`,
                        borderColor: rankColors[idx],
                        color: rankColors[idx],
                      }}
                    >
                      #{idx + 1}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p
                        className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                        style={{ color: cat?.color || '#ec4899' }}
                      >
                        {cat?.name || 'Fandom'}
                      </p>
                      <h3 className="font-orbitron text-xl font-bold text-[var(--cream)] leading-tight">
                        {char.name}
                      </h3>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        {char.series}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((char.likes || 0) / 3500) * 100
                              )}%`,
                              backgroundColor: rankColors[idx],
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--muted)] font-semibold">
                          {(char.likes || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
          <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
            Browse All
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters..."
              className="w-full rounded-full bg-[var(--nav)] border border-[var(--border)] pl-11 pr-4 py-2.5 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/60 outline-none focus:border-[var(--primary)] transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] flex items-center gap-1.5">
              <FiSliders size={12} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg bg-[var(--nav)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--cream)] outline-none focus:border-[var(--primary)] cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="az">Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_15px_var(--glow)]'
                : 'bg-[var(--surface)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_15px_var(--glow)]'
                  : 'bg-[var(--surface)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    selectedCategory === cat.slug ? 'currentColor' : cat.color,
                }}
              />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-[var(--muted)]">
            {filteredCharacters.length} character
            {filteredCharacters.length !== 1 ? 's' : ''} found
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="flex items-center gap-1 text-xs text-[var(--primary)] hover:text-[var(--yellow)] transition"
            >
              <FiX size={12} /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">Loading characters...</p>
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <FiFilter className="mx-auto text-[var(--muted)] mb-3" size={32} />
            <p className="text-[var(--muted)] text-sm">
              {characters.length === 0
                ? 'No characters available yet.'
                : 'No characters match your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredCharacters.map((character) => {
              const category = CATEGORIES.find(
                (cat) => cat.slug === character.categorySlug
              );
              return (
                <CharacterCard
                  key={character._id}
                  character={character}
                  category={category}
                />
              );
            })}
          </div>
        )}
      </section>

      
      {activeCategories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center gap-2 mb-6">
            <FiActivity className="text-[var(--primary)]" />
            <h2 className="font-orbitron text-lg md:text-xl font-bold text-[var(--cream)]">
              Category Breakdown
            </h2>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest ml-2">
              Live from characters
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 backdrop-blur-md p-6 md:p-8">
            <div className="space-y-4">
              {activeCategories.map((cat) => {
                const count = characters.filter(
                  (c) => c.categorySlug === cat.slug
                ).length;
                const pct = (count / maxCategoryCount) * 100;

                return (
                  <div key={cat.id} className="flex items-center gap-4">
                    <div className="w-20 md:w-24 shrink-0 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs text-[var(--cream)] font-semibold truncate">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex-1 h-6 rounded-full bg-[var(--border)]/40 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                        style={{
                          width: `${Math.max(pct, 8)}%`,
                          background: `linear-gradient(90deg, ${cat.color}40, ${cat.color})`,
                        }}
                      >
                        <span className="text-[10px] font-bold text-[var(--cream)]">
                          {count}
                        </span>
                      </div>
                    </div>

                    <span className="w-12 text-right text-[10px] text-[var(--muted)] font-mono">
                      {count} {count === 1 ? 'char' : 'chars'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">
                Total across {activeCategories.length} active categor
                {activeCategories.length === 1 ? 'y' : 'ies'}
              </span>
              <span className="font-orbitron font-bold text-[var(--primary)]">
                {characters.length} characters
              </span>
            </div>
          </div>
        </section>
      )}

      
      {topCharacters.length >= 3 && (
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex items-center gap-2 mb-8">
            <FiAward className="text-[var(--yellow)]" />
            <h2 className="font-orbitron text-lg md:text-xl font-bold text-[var(--cream)]">
              The Podium
            </h2>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest ml-2">
              Most liked this month
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-3xl mx-auto">
            
            <Link
              to={`/characters/${topCharacters[1]._id}`}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md overflow-hidden hover:border-[#C0C0C0]/60 transition-all duration-300"
            >
              <div
                className="h-32 md:h-40 relative flex items-end justify-center pb-4"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, #C0C0C015 100%)`,
                }}
              >
                <span
                  className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-black text-sm backdrop-blur-md border-2 border-[#C0C0C0] text-[#C0C0C0]"
                  style={{ backgroundColor: '#C0C0C020' }}
                >
                  2
                </span>
                <PodiumPortrait
                  character={topCharacters[1]}
                  className="w-14 h-14 rounded-xl"
                  fallbackStyle={{
                    backgroundColor: '#C0C0C020',
                    color: '#C0C0C0',
                  }}
                  textClassName="text-2xl"
                />
              </div>
              <div className="p-3 md:p-4 text-center border-t border-[var(--border)]">
                <p className="font-orbitron text-xs md:text-sm font-bold text-[var(--cream)] truncate">
                  {topCharacters[1].name}
                </p>
                <p className="text-[9px] md:text-[10px] text-[var(--muted)] truncate mt-0.5">
                  {topCharacters[1].series}
                </p>
                <p className="text-[10px] md:text-xs font-bold text-[#C0C0C0] mt-2">
                  ❤️ {topCharacters[1].likes?.toLocaleString()}
                </p>
              </div>
            </Link>

            
            <Link
              to={`/characters/${topCharacters[0]._id}`}
              className="group relative rounded-2xl border-2 border-[#FFD700]/60 bg-[var(--surface)]/60 backdrop-blur-md overflow-hidden hover:border-[#FFD700] transition-all duration-300 shadow-[0_0_25px_#FFD70030]"
            >
              <div
                className="h-40 md:h-52 relative flex items-end justify-center pb-4"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, #FFD70020 100%)`,
                }}
              >
                <span
                  className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-black text-lg backdrop-blur-md border-2 border-[#FFD700] text-[#FFD700] animate-pulse"
                  style={{ backgroundColor: '#FFD70025' }}
                >
                  1
                </span>
                <PodiumPortrait
                  character={topCharacters[0]}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl"
                  fallbackStyle={{
                    backgroundColor: '#FFD70025',
                    color: '#FFD700',
                  }}
                  textClassName="text-3xl"
                />
              </div>
              <div className="p-4 text-center border-t border-[var(--border)] bg-[#FFD70008]">
                <p className="font-orbitron text-sm md:text-base font-bold text-[var(--cream)] truncate">
                  {topCharacters[0].name}
                </p>
                <p className="text-[10px] md:text-xs text-[var(--muted)] truncate mt-0.5">
                  {topCharacters[0].series}
                </p>
                <p className="text-xs md:text-sm font-bold text-[#FFD700] mt-2">
                  ❤️ {topCharacters[0].likes?.toLocaleString()}
                </p>
              </div>
            </Link>

            
            <Link
              to={`/characters/${topCharacters[2]._id}`}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md overflow-hidden hover:border-[#CD7F32]/60 transition-all duration-300"
            >
              <div
                className="h-28 md:h-36 relative flex items-end justify-center pb-4"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, #CD7F3215 100%)`,
                }}
              >
                <span
                  className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-black text-sm backdrop-blur-md border-2 border-[#CD7F32] text-[#CD7F32]"
                  style={{ backgroundColor: '#CD7F3220' }}
                >
                  3
                </span>
                <PodiumPortrait
                  character={topCharacters[2]}
                  className="w-12 h-12 rounded-xl"
                  fallbackStyle={{
                    backgroundColor: '#CD7F3220',
                    color: '#CD7F32',
                  }}
                  textClassName="text-xl"
                />
              </div>
              <div className="p-3 md:p-4 text-center border-t border-[var(--border)]">
                <p className="font-orbitron text-xs md:text-sm font-bold text-[var(--cream)] truncate">
                  {topCharacters[2].name}
                </p>
                <p className="text-[9px] md:text-[10px] text-[var(--muted)] truncate mt-0.5">
                  {topCharacters[2].series}
                </p>
                <p className="text-[10px] md:text-xs font-bold text-[#CD7F32] mt-2">
                  ❤️ {topCharacters[2].likes?.toLocaleString()}
                </p>
              </div>
            </Link>
          </div>

          <div className="max-w-3xl mx-auto mt-2 h-1 rounded-full bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />
        </section>
      )}
    </div>
  );
};

export default Characters;
