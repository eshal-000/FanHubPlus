import { useEffect } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  getPlayableMediaUrl,
  isDirectAudioUrl,
  isDirectVideoUrl,
} from '../../utils/mediaAssets'

export default function TrailerModal({ embedUrl, open, onClose, title }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const src = getPlayableMediaUrl(embedUrl)
  const isDirectVideo = isDirectVideoUrl(src)
  const isDirectAudio = isDirectAudioUrl(src)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl border border-primary/40 bg-black shadow-[0_0_40px_rgba(255,0,107,0.22)]"
            exit={{ opacity: 0, scale: 0.96 }}
            initial={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(100%, 960px, calc((100vh - 8rem) * 16 / 9))' }}
          >
            <button
              aria-label="Close trailer"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-cream hover:border-yellow"
              onClick={onClose}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="aspect-video w-full">
              {!src ? (
                <div className="grid h-full w-full place-items-center p-6 text-center">
                  <p className="text-sm text-muted">
                    This media record needs a verified trailer or video URL.
                  </p>
                </div>
              ) : isDirectAudio ? (
                <div className="grid h-full w-full place-items-center p-6">
                  <audio className="w-full" controls src={src} />
                </div>
              ) : isDirectVideo ? (
                <video className="h-full w-full bg-black" controls src={src} />
              ) : (
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                  src={src}
                  title={`${title || 'Media'} trailer`}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
