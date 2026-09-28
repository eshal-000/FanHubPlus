import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiClock, FiUser, FiStar, FiArrowRight } from 'react-icons/fi';

const ArticleModal = ({ article, onClose }) => {
  // Close on ESC + lock body scroll
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_0_40px_var(--glow)] scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalSlideIn 0.3s ease' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition flex items-center justify-center"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>

        {/* Hero Image */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/40 to-transparent" />

          {/* Category Badge */}
          <div className="absolute bottom-4 left-6">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
              style={{
                backgroundColor: `${article.category.color}30`,
                color: article.category.color,
                border: `1px solid ${article.category.color}60`,
              }}
            >
              <span>{article.category.icon}</span>
              {article.category.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Title */}
          <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)] leading-tight">
            {article.title}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[var(--muted)]">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <FiUser size={12} /> {article.author}
              </span>
            )}
            {article.readTime && (
              <span className="flex items-center gap-1.5">
                <FiClock size={12} /> {article.readTime}
              </span>
            )}
            {article.rating && (
              <span className="flex items-center gap-1.5 text-[var(--yellow)]">
                <FiStar size={12} /> {article.rating}
              </span>
            )}
          </div>

          {/* Excerpt */}
          <p className="text-[var(--muted)] mt-5 leading-relaxed text-[15px]">
            {article.excerpt}
          </p>

          {/* Preview (body se pehle 2 paragraphs) */}
          {article.body && (
            <div className="mt-4 text-[var(--muted)] leading-relaxed text-[15px]">
              {article.body
                .split('\n')
                .filter((l) => l.trim() && !l.trim().startsWith('##'))
                .slice(0, 2)
                .map((line, i) => (
                  <p key={i} className="mb-3">
                    {line.trim()}
                  </p>
                ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[var(--border)]">
            <Link
              to={`/content/${article.id}`}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-[var(--cream)] transition hover:shadow-[0_0_20px_var(--glow)]"
              style={{ backgroundColor: article.category.color }}
            >
              Read Full Article <FiArrowRight size={14} />
            </Link>

            <button
              onClick={onClose}
              className="px-5 py-3 rounded-full text-sm font-semibold bg-[var(--nav)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ArticleModal;