import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiBookmark, FiStar } from 'react-icons/fi';

const ContentCard = ({ item }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes || 0);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('fhp_liked_content') || '[]');
    const bookmarked = JSON.parse(localStorage.getItem('fhp_bookmarks') || '[]');
    if (liked.includes(item.id)) {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
    if (bookmarked.includes(item.id)) setIsBookmarked(true);
  }, [item.id]);

  // Route: if this is a movie, go to /movies/:slug; else, stay clickable for modal
  const handleCardClick = (e) => {
    if (item.isMovieDetail) {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/movies/${item.slug || item.id}`);
    }
    // else: nothing — modal opening is handled by parent (ExploreCategory)
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const liked = JSON.parse(localStorage.getItem('fhp_liked_content') || '[]');
    if (isLiked) {
      localStorage.setItem(
        'fhp_liked_content',
        JSON.stringify(liked.filter((id) => id !== item.id))
      );
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      localStorage.setItem(
        'fhp_liked_content',
        JSON.stringify([...liked, item.id])
      );
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const bookmarked = JSON.parse(localStorage.getItem('fhp_bookmarks') || '[]');
    if (isBookmarked) {
      localStorage.setItem(
        'fhp_bookmarks',
        JSON.stringify(bookmarked.filter((id) => id !== item.id))
      );
      setIsBookmarked(false);
    } else {
      localStorage.setItem(
        'fhp_bookmarks',
        JSON.stringify([...bookmarked, item.id])
      );
      setIsBookmarked(true);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md hover:border-[var(--primary)]/60 hover:shadow-[0_0_25px_var(--glow)] transition-all duration-300 flex flex-col h-full ${
        item.isMovieDetail ? 'cursor-pointer' : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${
                item.category?.color || '#F59E0B'
              }30 0%, var(--surface) 100%)`,
            }}
          >
            <FiStar
              size={28}
              style={{ color: item.category?.color || '#F59E0B' }}
            />
            <p className="font-orbitron text-[10px] uppercase tracking-widest text-[var(--muted)] mt-2 px-3 text-center">
              {item.title}
            </p>
          </div>
        )}

        {item.category && (
          <span
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
            style={{
              backgroundColor: `${item.category.color}30`,
              color: item.category.color,
              border: `1px solid ${item.category.color}50`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: item.category.color }}
            />
            {item.type || item.category.name}
          </span>
        )}

        <button
          onClick={handleBookmark}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition z-10 ${
            isBookmarked
              ? 'bg-[var(--primary)] text-[var(--cream)]'
              : 'bg-black/50 text-[var(--cream)] hover:bg-[var(--primary)]'
          }`}
          aria-label="Bookmark"
        >
          <FiBookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wider text-[var(--yellow)] font-semibold">
          {item.type}
        </span>

        <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] mt-1.5 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {item.title}
        </h3>

        <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[var(--muted)]">
            <FiStar size={12} className="text-[var(--yellow)]" />
            <span>{item.rating || '—'}</span>
          </div>

          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition ${
              isLiked ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--primary)]'
            }`}
            aria-label="Like"
          >
            <FiHeart size={12} className={isLiked ? 'fill-current' : ''} />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;