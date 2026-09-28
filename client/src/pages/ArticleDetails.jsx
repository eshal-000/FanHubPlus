import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mariaApi from '../services/mariaApi';
import { FiArrowLeft, FiShare2, FiBookmark, FiHeart, FiCheck } from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';
import LoginPromptModal from '../components/common/LoginPromptModal';
import useBookmarks from '../hooks/useBookmarks';

const ArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { closeLoginPrompt, isBookmarked, showLoginPrompt, toggle } = useBookmarks();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const { data } = await mariaApi.get(`/articles/${id}`);
        setArticle(data.article);
      } catch (err) {
        console.error('Fetch article error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const category = useMemo(() => {
    if (!article) return CATEGORIES[0];
    return CATEGORIES.find((c) => c.slug === article.categorySlug) || CATEGORIES[0];
  }, [article]);

  const saved = isBookmarked(article?._id);

  const handleBookmark = async () => {
    if (!article?._id) return;
    try {
      await toggle(article._id, 'article');
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--cream)]">Loading...</div>;
  if (!article) return <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--cream)]">Article not found</div>;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="fixed top-0 left-0 right-0 z-50 h-1">
        <div className="h-full transition-all" style={{ width: `${scrollProgress}%`, backgroundColor: category.color }} />
      </div>

      <section className="relative h-[60vh] min-h-[450px] overflow-hidden">
        <img src={article.imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-[var(--bg)]/30" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] text-sm">
          <FiArrowLeft size={14} /> Back
        </button>
        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 pb-16 max-w-4xl mx-auto w-full">
          <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full text-[10px] font-bold mb-4 uppercase tracking-widest backdrop-blur-md"
            style={{ backgroundColor: `${category.color}30`, color: category.color, border: `1px solid ${category.color}70` }}>
            {category.name} · Article
          </span>
          <h1 className="font-orbitron text-3xl md:text-5xl font-black text-[var(--cream)] leading-tight"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.95)' }}>
            {article.title}
          </h1>
          <div className="flex items-center gap-4 mt-6">
            <img src={article.authorAvatar || 'https://i.pravatar.cc/100'} alt={article.author} className="w-10 h-10 rounded-full border-2" style={{ borderColor: category.color }} />
            <div>
              <p className="text-sm font-semibold text-[var(--cream)]">{article.author}</p>
              <p className="text-[10px] text-[var(--muted)]">{article.readTime} · {article.views?.toLocaleString()} views</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 -mt-6 relative z-30">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${isLiked ? 'text-[var(--cream)]' : 'bg-[var(--nav)]/60 text-[var(--muted)] border border-[var(--border)]'}`}
              style={{ backgroundColor: isLiked ? category.color : undefined }}>
              <FiHeart size={14} className={isLiked ? 'fill-current' : ''} /> {article.likes || 0}
            </button>
            <button onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${saved ? 'bg-[var(--primary)] text-[var(--cream)]' : 'bg-[var(--nav)]/60 text-[var(--muted)] border border-[var(--border)]'}`}>
              <FiBookmark size={14} className={saved ? 'fill-current' : ''} /> {saved ? 'Saved' : 'Save'}
            </button>
          </div>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--nav)]/60 text-[var(--muted)] border border-[var(--border)]">
            <FiShare2 size={14} /> Share
          </button>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14">
        <p className="text-lg text-[var(--cream)] leading-relaxed mb-8 border-l-4 pl-6" style={{ borderColor: category.color }}>{article.excerpt}</p>
        {article.body?.split('\n').map((line, i) => {
          const t = line.trim();
          if (!t) return null;
          if (t.startsWith('## ')) {
            return <h2 key={i} className="font-orbitron text-2xl font-bold text-[var(--cream)] mt-10 mb-4 relative pl-5">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: category.color }} />
              {t.replace('## ', '')}
            </h2>;
          }
          return <p key={i} className="text-[var(--muted)] leading-[1.85] mb-4 text-[17px]">{t}</p>;
        })}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[var(--border)]">
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-[var(--surface)]/60 border border-[var(--border)] text-[var(--muted)] text-xs">#{tag}</span>
            ))}
          </div>
        )}
      </section>

      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] text-sm font-semibold flex items-center gap-2">
          <FiCheck size={16} /> Link copied!
        </div>
      )}
      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </div>
  );
};

export default ArticleDetails;
