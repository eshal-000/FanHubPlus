import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiBookmark, FiStar } from 'react-icons/fi';
import useBookmarks from '../hooks/useBookmarks';
import LoginPromptModal from './common/LoginPromptModal';
import { imageFor } from '../utils/contentDisplay';

const ContentCard = ({ item }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes || 0);
  const { closeLoginPrompt, isBookmarked, showLoginPrompt, toggle } = useBookmarks();
  const contentId = item._id || item.id;
  const saved = isBookmarked(contentId);
  const category =
    (item.categoryInfo && typeof item.categoryInfo === 'object' && item.categoryInfo) ||
    (item.category && typeof item.category === 'object' && item.category) ||
    null;
  const categoryColor = category?.color || 'var(--primary)';
  const categoryName = category?.name || item.category || item.categorySlug || 'Fandom';
  const detailTarget = `/content/${item.slug || contentId}`;
  const hasRating = item.rating !== null && item.rating !== undefined && item.rating !== '';
  const cardImage = imageFor(item);

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
      console.error('Bookmark content error:', err);
    }
  };

  const openDetails = () => {
    navigate(detailTarget);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetails();
    }
  };

  return (
    <>
      <div
        onClick={openDetails}
        onKeyDown={handleKeyDown}
        role="link"
        tabIndex={0}
        className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md hover:border-[var(--primary)]/60 hover:shadow-[0_0_25px_var(--glow)] transition-all duration-300 flex flex-col h-full"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {cardImage ? (
            <img
              src={cardImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--nav)] text-xs text-[var(--muted)]">
              No image
            </div>
          )}

          {categoryName && (
            <span
              className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
              style={{
                backgroundColor: `${categoryColor}30`,
                color: categoryColor,
                border: `1px solid ${categoryColor}50`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
              {item.type || categoryName}
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
            <FiBookmark size={14} className={saved ? 'fill-current' : ''} />
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
            {hasRating ? (
              <div className="flex items-center gap-1 text-[var(--muted)]">
                <FiStar size={12} className="text-[var(--yellow)]" />
                <span>{item.rating}</span>
              </div>
            ) : (
              <span className="text-[var(--muted)]">{categoryName}</span>
            )}

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
      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </>
  );
};

export default ContentCard;
