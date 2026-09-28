import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiSliders,
  FiClock,
  FiArrowRight,
  FiStar,
  FiBookOpen,
  FiTrendingUp,
  FiX,
  FiCalendar,
  FiUser,
} from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';



import articlesHero from '../assets/articles-hero.jpg';

import articleAnime from '../assets/article-anime.jpg';
import articleGta6 from '../assets/article-gta6.jpg';
import articleKpop from '../assets/article-kpop.jpg';
import articleDeadpool from '../assets/article-deadpool.jpg';
import articleJjk from '../assets/article-jjk.jpg';
import articleMarvel from '../assets/article-marvel.jpg';
import articleCosplay from '../assets/article-cosplay.jpg';
import articleTlou from '../assets/article-tlou.jpg';
import articleManga from '../assets/article-manga.jpg';
import articleIndie from '../assets/article-indie.jpg';



const ALL_ARTICLES = [
  {
    id: 1,
    title: 'The Rise of Anime in Global Pop Culture',
    excerpt: 'How Japanese animation became a worldwide phenomenon — from niche subculture to mainstream obsession.',
    body: 'Anime has evolved from a niche Japanese export to a global cultural force. From Astro Boy to Dragon Ball, anime captured hearts worldwide. Netflix and Crunchyroll brought anime to millions. Today, anime influences fashion, music, and pop culture.',
    imageUrl: articleAnime,
    readTime: '8 min read',
    author: 'Maria Khan',
    authorAvatar: 'https://i.pravatar.cc/100?img=1',
    publishedAt: '2025-01-15',
    category: CATEGORIES[0],
    rating: 4.9,
    views: 12400,
  },
  {
    id: 2,
    title: 'GTA VI: The Game That Will Redefine Open Worlds',
    excerpt: 'After a decade of waiting, Rockstar is back. Here is everything we know about the most anticipated game ever.',
    body: 'GTA VI promises to be a generational leap. Vice City returns with a modern take on the iconic location. Dual protagonists Lucia and Jason, inspired by Bonnie and Clyde.',
    imageUrl: articleGta6,
    readTime: '6 min read',
    author: 'Ahmed Ali',
    authorAvatar: 'https://i.pravatar.cc/100?img=12',
    publishedAt: '2025-01-10',
    category: CATEGORIES[1],
    rating: 4.7,
    views: 18700,
  },
  {
    id: 3,
    title: 'K-Pop Goes Global: The 2025 World Tour Recap',
    excerpt: 'From Seoul to Los Angeles, K-Pop groups broke records and hearts on their biggest world tours yet.',
    body: 'K-Pop groups sold out stadiums worldwide. BLACKPINK, BTS, Stray Kids, and NewJeans dominated 2025 with record-breaking tours.',
    imageUrl: articleKpop,
    readTime: '5 min read',
    author: 'Ayesha Khan',
    authorAvatar: 'https://i.pravatar.cc/100?img=5',
    publishedAt: '2025-01-08',
    category: CATEGORIES[4],
    rating: 5.0,
    views: 24500,
  },
  {
    id: 4,
    title: 'Deadpool & Wolverine: The Ultimate Team-Up',
    excerpt: 'A deep dive into how two unlikely heroes came together to save the multiverse.',
    body: 'Deadpool & Wolverine broke box office records. The merc with a mouth teams up with the clawed mutant for the ultimate multiverse adventure.',
    imageUrl: articleDeadpool,
    readTime: '7 min read',
    author: 'Sara Ahmed',
    authorAvatar: 'https://i.pravatar.cc/100?img=9',
    publishedAt: '2025-01-05',
    category: CATEGORIES[2],
    rating: 4.8,
    views: 9800,
  },
  {
    id: 5,
    title: 'Jujutsu Kaisen: Why the Hidden Inventory Arc Matters',
    excerpt: "Gojo and Geto's past, the Star Plasma Vessel, and everything you missed.",
    body: 'The Hidden Inventory arc explores Gojo and Geto\'s past, revealing the Star Plasma Vessel incident that shaped their destinies.',
    imageUrl: articleJjk,
    readTime: '7 min read',
    author: 'Hassan Raza',
    authorAvatar: 'https://i.pravatar.cc/100?img=15',
    publishedAt: '2025-01-03',
    category: CATEGORIES[0],
    rating: 4.9,
    views: 15200,
  },
  {
    id: 6,
    title: 'Marvel Comics: The Future of Superhero Storytelling',
    excerpt: 'From X-Men to Spider-Man, the comics that are redefining the genre.',
    body: 'Marvel Comics continues to push boundaries with new storylines and characters that are redefining superhero storytelling.',
    imageUrl: articleMarvel,
    readTime: '6 min read',
    author: 'Bilal Ahmed',
    authorAvatar: 'https://i.pravatar.cc/100?img=8',
    publishedAt: '2025-01-01',
    category: CATEGORIES[5],
    rating: 4.6,
    views: 7800,
  },
  {
    id: 7,
    title: 'Cosplay as an Art Form: A Beginner Guide',
    excerpt: 'Step-by-step guide to creating an epic cyberpunk samurai cosplay.',
    body: 'Cosplay is more than just costumes — it is art. Learn the techniques, materials, and creativity behind epic cosplay builds.',
    imageUrl: articleCosplay,
    readTime: '10 min read',
    author: 'Zara Ali',
    authorAvatar: 'https://i.pravatar.cc/100?img=10',
    publishedAt: '2024-12-28',
    category: CATEGORIES[7],
    rating: 4.7,
    views: 11200,
  },
  {
    id: 8,
    title: 'The Last of Us Season 2: What to Expect',
    excerpt: 'HBO drops the first teaser for the highly anticipated second season.',
    body: 'The Last of Us Season 2 continues the story of Ellie and Joel in a post-apocalyptic world. The first teaser hints at darker times ahead.',
    imageUrl: articleTlou,
    readTime: '5 min read',
    author: 'Omar Khan',
    authorAvatar: 'https://i.pravatar.cc/100?img=3',
    publishedAt: '2024-12-20',
    category: CATEGORIES[3],
    rating: 4.8,
    views: 13600,
  },
  {
    id: 9,
    title: 'Manga vs Anime: Which One Should You Choose?',
    excerpt: "A detailed comparison of the two mediums, and why you don't have to pick sides.",
    body: 'Manga and anime both have unique strengths. Manga offers more detail and story depth, while anime brings visual and audio experience.',
    imageUrl: articleManga,
    readTime: '6 min read',
    author: 'Maria Khan',
    authorAvatar: 'https://i.pravatar.cc/100?img=1',
    publishedAt: '2025-01-02',
    category: CATEGORIES[6],
    rating: 4.5,
    views: 8900,
  },
  {
    id: 10,
    title: 'Why Indie Games Are Winning Hearts in 2025',
    excerpt: 'Small studios are making huge waves with creative, heartfelt games.',
    body: 'Indie games are redefining gaming. Small studios are creating unique experiences that rival AAA titles in creativity and heart.',
    imageUrl: articleIndie,
    readTime: '6 min read',
    author: 'Ahmed Ali',
    authorAvatar: 'https://i.pravatar.cc/100?img=12',
    publishedAt: '2024-12-15',
    category: CATEGORIES[1],
    rating: 4.8,
    views: 10400,
  },
];



const ArticleModal = ({ article, onClose }) => {
  if (!article) return null;

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
            src={article.imageUrl}
            alt={article.title}
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
                backgroundColor: `${article.category.color}40`,
                color: article.category.color,
                border: `1px solid ${article.category.color}80`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: article.category.color }}
              />
              {article.category.name}
            </span>
          </div>
        </div>

        
        <div className="p-6 md:p-8">
          <h2 className="font-orbitron text-2xl md:text-3xl font-black text-[var(--cream)] leading-tight">
            {article.title}
          </h2>

          
          <div className="flex items-center gap-3 mt-4">
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-10 h-10 rounded-full border-2"
              style={{ borderColor: article.category.color }}
            />
            <div>
              <p className="text-sm text-[var(--cream)] font-semibold">
                {article.author}
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                Published on {article.publishedAt}
              </p>
            </div>
          </div>

          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <FiClock size={14} className="text-[var(--primary)]" />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1.5 text-[var(--yellow)]">
              <FiStar size={14} className="fill-current" />
              {article.rating}
            </span>
            <span className="flex items-center gap-1.5">
              <FiTrendingUp size={14} className="text-[var(--primary)]" />
              {article.views.toLocaleString()} views
            </span>
          </div>

          <div className="my-6 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

          
          <div>
            <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] uppercase tracking-widest mb-3">
              Story
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {article.body || article.excerpt}
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



const ArticleCard = ({ article, onOpen }) => {
  return (
    <div
      onClick={() => onOpen(article)}
      className="group grid grid-cols-[110px_1fr] md:grid-cols-[140px_1fr] gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 backdrop-blur-md hover:border-[var(--primary)]/60 transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-24 md:h-28 rounded-xl overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      <div className="min-w-0 flex flex-col justify-between">
        <div>
          <span
            className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1.5"
            style={{
              backgroundColor: `${article.category.color}20`,
              color: article.category.color,
              border: `1px solid ${article.category.color}40`,
            }}
          >
            {article.category.name}
          </span>

          <h3 className="font-orbitron text-sm md:text-base font-bold text-[var(--cream)] leading-tight line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
            {article.title}
          </h3>

          <p className="text-xs text-[var(--muted)] mt-1.5 line-clamp-2 leading-relaxed hidden md:block">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <FiClock size={10} /> {article.readTime}
          </span>
          <span className="flex items-center gap-1 text-[var(--yellow)]">
            <FiStar size={10} /> {article.rating}
          </span>
        </div>
      </div>
    </div>
  );
};



const TrendingCard = ({ article, idx, onOpen }) => {
  return (
    <div
      onClick={() => onOpen(article)}
      className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/30 backdrop-blur-md hover:border-[var(--primary)]/60 transition-all duration-300 cursor-pointer"
    >
      
      <div className="relative h-40 overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/30 to-transparent" />

        
        <div
          className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-black text-sm backdrop-blur-md border-2"
          style={{
            backgroundColor:
              idx === 0 ? '#FFD70020' : idx === 1 ? '#C0C0C020' : '#CD7F3220',
            borderColor:
              idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32',
            color:
              idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32',
          }}
        >
          {idx + 1}
        </div>
      </div>

      
      <div className="p-4">
        <span
          className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2"
          style={{
            backgroundColor: `${article.category.color}20`,
            color: article.category.color,
            border: `1px solid ${article.category.color}40`,
          }}
        >
          {article.category.name}
        </span>

        <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] leading-tight line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {article.title}
        </h3>

        <div className="flex items-center gap-3 mt-3 text-[10px] text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <FiClock size={10} /> {article.readTime}
          </span>
          <span className="flex items-center gap-1">
            <FiTrendingUp size={10} /> {article.views.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};



const Articles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = useMemo(() => {
    let articles = [...ALL_ARTICLES];

    if (searchQuery.trim() !== '') {
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      articles = articles.filter((a) => a.category.slug === selectedCategory);
    }

    if (sortBy === 'popular') {
      articles.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'latest') {
      articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === 'rating') {
      articles.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'az') {
      articles.sort((a, b) => a.title.localeCompare(b.title));
    }

    return articles;
  }, [searchQuery, selectedCategory, sortBy]);

  const trendingArticles = useMemo(() => {
    return [...ALL_ARTICLES].sort((a, b) => b.views - a.views).slice(0, 3);
  }, []);

  const stats = useMemo(() => {
    const totalArticles = ALL_ARTICLES.length;
    const totalReadTime = ALL_ARTICLES.reduce((sum, a) => {
      const mins = parseInt(a.readTime) || 0;
      return sum + mins;
    }, 0);
    const avgRating =
      ALL_ARTICLES.reduce((sum, a) => sum + a.rating, 0) / totalArticles;
    const totalAuthors = new Set(ALL_ARTICLES.map((a) => a.author)).size;

    return {
      totalArticles,
      totalReadTime,
      avgRating: avgRating.toFixed(1),
      totalAuthors,
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">

      
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/50 bg-[var(--surface)]/40 backdrop-blur-md px-3 py-1 mb-5">
              <FiBookOpen className="text-[var(--yellow)]" size={12} />
              <span className="text-[10px] tracking-widest uppercase text-[var(--yellow)] font-semibold">
                Fandom Stories & Insights
              </span>
            </div>

            <h1 className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-black text-[var(--cream)] leading-tight">
              Articles &amp;{' '}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--raspberry)] bg-clip-text text-transparent">
                Stories
              </span>
            </h1>

            <p className="text-[var(--muted)] mt-4 max-w-md text-sm md:text-base leading-relaxed">
              Deep dives, reviews, and stories from across the fandom universe — written by fans, for fans.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/submit-content"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold text-sm hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)]"
              >
                Write an Article <FiArrowRight size={14} />
              </Link>
              <a
                href="#all-articles"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md text-[var(--cream)] font-semibold text-sm hover:border-[var(--primary)]/60 transition"
              >
                Browse All
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] shadow-[0_0_60px_var(--glow)]">
              <img
                src={articlesHero}
                alt="Articles hero"
                className="w-full h-[280px] md:h-[340px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  <FiBookOpen className="text-[var(--primary)]" size={12} />
                  <span className="text-[10px] text-[var(--cream)] font-semibold">
                    {stats.totalArticles} Articles
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  <FiStar className="text-[var(--yellow)]" size={12} />
                  <span className="text-[10px] text-[var(--cream)] font-semibold">
                    {stats.avgRating} avg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <FiTrendingUp className="text-[var(--primary)]" />
          <h2 className="font-orbitron text-lg md:text-xl font-bold text-[var(--cream)]">
            Trending Now
          </h2>
          <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest ml-2">
            Most read this week
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingArticles.map((article, idx) => (
            <TrendingCard
              key={article.id}
              article={article}
              idx={idx}
              onOpen={setSelectedArticle}
            />
          ))}
        </div>
      </section>

      
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)]/40 via-[var(--nav)]/30 to-[var(--bg)]/20 backdrop-blur-md p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[var(--primary)] opacity-10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-[var(--border)]">
            <div className="text-center md:px-4">
              <p className="font-orbitron text-3xl md:text-4xl font-black text-[var(--cream)]">
                {stats.totalArticles}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-2">
                Articles Published
              </p>
            </div>
            <div className="text-center md:px-4">
              <p className="font-orbitron text-3xl md:text-4xl font-black text-[var(--cream)]">
                {stats.totalReadTime}
                <span className="text-base text-[var(--muted)] font-normal ml-1">min</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-2">
                Total Reading
              </p>
            </div>
            <div className="text-center md:px-4">
              <p className="font-orbitron text-3xl md:text-4xl font-black text-[var(--cream)]">
                {stats.avgRating}
                <span className="text-base text-[var(--yellow)] font-normal ml-1">★</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-2">
                Avg Rating
              </p>
            </div>
            <div className="text-center md:px-4">
              <p className="font-orbitron text-3xl md:text-4xl font-black text-[var(--cream)]">
                {stats.totalAuthors}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-2">
                Contributors
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section id="all-articles" className="max-w-6xl mx-auto px-4 pb-20 relative z-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FiBookOpen className="text-[var(--primary)]" />
            <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">
              All Articles
            </h2>
            <span className="text-xs text-[var(--muted)] ml-2">
              ({filteredArticles.length})
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex items-center gap-2 text-[var(--muted)] text-xs mr-2 shrink-0">
              <FiFilter size={14} /> Filter:
            </div>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_10px_var(--glow)]'
                  : 'bg-[var(--surface)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
              }`}
            >
              All
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.slug
                    ? 'text-[var(--cream)] shadow-[0_0_10px_var(--glow)]'
                    : 'bg-[var(--surface)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === cat.slug ? cat.color : undefined,
                }}
              >
                {cat.name}
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

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onOpen={setSelectedArticle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">
              No articles found for "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-[var(--primary)] text-xs font-semibold hover:text-[var(--yellow)] transition"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      
      <section className="max-w-6xl mx-auto px-4 pb-20 relative z-10">
        <div className="relative rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)]/60 via-[var(--nav)]/60 to-[var(--bg)]/80 backdrop-blur-md p-8 md:p-12 text-center overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="font-orbitron text-2xl md:text-4xl font-bold text-[var(--cream)]">
              Got a story to share?
            </h2>
            <p className="text-[var(--muted)] mt-3 max-w-xl mx-auto text-sm md:text-base">
              Submit your own fan article, review, or story.
            </p>

            <Link
              to="/submit-content"
              className="inline-flex items-center gap-2 mt-6 px-7 py-3.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)] text-sm"
            >
              Submit Your Article <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};

export default Articles;