import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiFilter,
  FiSliders,
  FiGrid,
  FiSearch,
} from 'react-icons/fi';
import { CATEGORIES as CATEGORY_VISUALS } from '../data/categories';
import ContentCard from '../components/ContentCard';
import mariaApi from '../services/mariaApi';
import useCategories from '../hooks/useCategories';
import { applyContentAssetOverrides, CATEGORY_HERO_PUBLIC_IMAGES } from '../utils/fandomAssets';

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

function normalizeContent(item, category) {
  const hydrated = applyContentAssetOverrides(item);
  return {
    ...hydrated,
    category,
    categoryInfo: category,
    id: hydrated._id || hydrated.id,
    imageUrl: hydrated.imageUrl || hydrated.imageUrls?.[0],
    likes: hydrated.likes || 0,
    popularity: hydrated.popularity || 0,
    rating: hydrated.rating ?? '',
    releaseYear: hydrated.releaseYear || '',
  };
}


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


const ExploreCategory = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { categories } = useCategories({ collectionKey: CURATED_COLLECTION_KEY });

  const [category, setCategory] = useState(null);
  const [categoryError, setCategoryError] = useState('');
  const [contentError, setContentError] = useState('');
  const [contentLoading, setContentLoading] = useState(true);
  const [allContent, setAllContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategory() {
      try {
        setCategoryError('');
        const { data } = await mariaApi.get(`/categories/${slug}`, {
          params: { collectionKey: CURATED_COLLECTION_KEY },
        });
        if (!cancelled) setCategory(mergeCategory(data.category));
      } catch (err) {
        if (!cancelled) {
          setCategory(null);
          setCategoryError(err?.response?.data?.message || err.message || 'Category not found');
        }
      }
    }

    loadCategory();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (category) {
      const savedVote = localStorage.getItem(`fhp_poll_${category.slug}`);
      setUserVote(savedVote ? parseInt(savedVote, 10) : null);
    }
  }, [category]);

  useEffect(() => {
    if (!category) return undefined;
    let cancelled = false;

    async function loadContent() {
      try {
        setContentLoading(true);
        setContentError('');
        const { data } = await mariaApi.get('/contents', {
          params: {
            category: category.slug,
            collectionKey: CURATED_COLLECTION_KEY,
            search: searchQuery.trim() || undefined,
            sort: sortBy,
          },
        });
        if (!cancelled) {
          setAllContent((data.contents || []).map((item) => normalizeContent(item, category)));
        }
      } catch (err) {
        if (!cancelled) {
          setContentError(err?.response?.data?.message || err.message || 'Failed to load content');
          setAllContent([]);
        }
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    }

    loadContent();
    return () => {
      cancelled = true;
    };
  }, [category, searchQuery, sortBy]);

  const poll = useMemo(
    () => (category ? generatePoll(category) : null),
    [category]
  );

  const handleVote = (optionId) => {
    if (userVote !== null) return;
    setUserVote(optionId);
    if (category) {
      localStorage.setItem(`fhp_poll_${category.slug}`, optionId);
    }
  };

  const filteredContent = useMemo(() => {
    let content = [...allContent];

    if (selectedType !== 'all') {
      content = content.filter(
        (item) => String(item.type || '').toLowerCase() === selectedType
      );
    }

    if (sortBy === 'popular') {
      content.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === 'latest') {
      content.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    } else if (sortBy === 'rating') {
      content.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'az') {
      content.sort((a, b) => a.title.localeCompare(b.title));
    }

    return content;
  }, [allContent, selectedType, sortBy]);

  const availableTypes = useMemo(() => {
    const types = allContent
      .map((item) => String(item.type || '').toLowerCase())
      .filter(Boolean);
    return ['all', ...Array.from(new Set(types))];
  }, [allContent]);

  const otherCategories = useMemo(
    () => categories.map(mergeCategory).filter((item) => item.slug && item.slug !== slug && item.image),
    [categories, slug],
  );

  if (categoryError && !category) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-orbitron text-6xl font-black text-[var(--primary)]">404</h1>
          <p className="text-[var(--cream)] mt-4 text-lg">{categoryError}</p>
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

  if (!category || !poll) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[var(--muted)] text-sm">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">


      <section className="relative h-[45vh] min-h-[350px] overflow-hidden">
        <img
          src={CATEGORY_HERO_PUBLIC_IMAGES[category.slug] || category.image}
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

              {availableTypes.map((type) => (
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
                <option value="az">A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>


      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <FiGrid className="text-[var(--primary)]" />
          <h2 className="font-orbitron text-xl md:text-2xl font-bold text-[var(--cream)]">
            {selectedType === 'all' ? `All ${category.name}` : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s`}
          </h2>
          <span className="text-xs text-[var(--muted)] ml-2">({filteredContent.length})</span>
        </div>

        {contentLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="aspect-[4/3] animate-pulse rounded-2xl bg-[var(--surface)]/40" />
            ))}
          </div>
        ) : contentError ? (
          <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">{contentError}</p>
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContent.map((item) => (
              <ContentCard
                key={item._id || item.id}
                item={item}
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


      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative rounded-3xl overflow-hidden bg-[var(--surface)]/60 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${category.color}, var(--primary), ${category.color})` }} />

          <div className="p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-[80px] pointer-events-none" style={{ backgroundColor: category.color }} />

            <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${category.color}25` }}>Vote</div>
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


      {otherCategories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="font-orbitron text-xl md:text-2xl font-bold text-[var(--cream)] mb-5">Explore Other Categories</h2>

          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {otherCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/explore/${cat.slug}`}
                className="group flex-shrink-0 w-[140px] h-[160px] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 relative"
              >
                <img src={CATEGORY_HERO_PUBLIC_IMAGES[cat.slug] || cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
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
      )}
    </div>
  );
};

export default ExploreCategory;
