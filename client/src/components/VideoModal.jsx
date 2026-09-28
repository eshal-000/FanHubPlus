import { useEffect } from 'react';
import { FiX, FiClock } from 'react-icons/fi';

const VideoModal = ({ video, onClose }) => {
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

  if (!video) return null;

  const isAudio = video.type === 'Audio';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[0_0_40px_var(--glow)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[var(--cream)] hover:bg-[var(--primary)] transition flex items-center justify-center"
        >
          <FiX size={18} />
        </button>

        
        {isAudio ? (
          <div className="flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ height: '320px' }}>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover opacity-25 blur-2xl"
            />
            <div className="relative z-10 w-full max-w-md">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-28 h-28 rounded-2xl object-cover mx-auto mb-4 shadow-[0_0_30px_var(--glow)] border-2"
                style={{ borderColor: video.category.color }}
              />
              <h3 className="font-orbitron text-sm font-bold text-[var(--cream)] text-center mb-4 line-clamp-1">
                {video.title}
              </h3>
              <audio controls className="w-full">
                <source src={video.audioUrl || ''} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        ) : (
          <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={video.url}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${video.category.color}20`,
                color: video.category.color,
                border: `1px solid ${video.category.color}40`,
              }}
            >
              {video.category.icon} {video.category.name}
            </span>
            <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
              <FiClock size={9} /> {video.duration}
            </span>
            {video.views && (
              <span className="text-[10px] text-[var(--muted)]">
                {video.views.toLocaleString()} views
              </span>
            )}
          </div>

          <h2 className="font-orbitron text-base md:text-lg font-bold text-[var(--cream)] mb-1.5 line-clamp-1">
            {video.title}
          </h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;