import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import LoginPromptModal from '../components/common/LoginPromptModal'
import PremiumContentDetails from '../components/content/PremiumContentDetails'
import useBookmarks from '../hooks/useBookmarks'
import mariaApi from '../services/mariaApi'
import { applyContentAssetOverrides } from '../utils/fandomAssets'

const ContentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showShareToast, setShowShareToast] = useState(false)
  const { closeLoginPrompt, isBookmarked, showLoginPrompt, toggle } = useBookmarks()

  useEffect(() => {
    let mounted = true

    async function fetchContent() {
      try {
        setLoading(true)
        setError('')
        const { data } = await mariaApi.get(`/contents/${id}`)
        if (mounted) setContent(applyContentAssetOverrides(data.content))
      } catch (err) {
        if (mounted) {
          setContent(null)
          setError(err?.response?.data?.message || err.message || 'Content not found')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchContent()
    return () => {
      mounted = false
    }
  }, [id])

  const handleBookmark = async () => {
    if (!content?._id) return
    try {
      await toggle(content._id, 'content')
    } catch (err) {
      console.error('Bookmark content error:', err)
    }
  }

  const handleShare = async () => {
    if (!content) return
    try {
      if (navigator.share) {
        await navigator.share({ title: content.title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShowShareToast(true)
        window.setTimeout(() => setShowShareToast(false), 2000)
      }
    } catch (err) {
      console.error('Share content error:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--cream)]">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 px-8 py-6 text-center shadow-[0_0_30px_var(--glow)]">
          <p className="font-orbitron text-sm font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
            Loading fandom file
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">Preparing verified MongoDB details...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--cream)]">
        <div className="max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)]/50 p-8 text-center shadow-[0_0_30px_var(--glow)]">
          <p className="font-orbitron text-xl font-bold">{error || 'Content not found'}</p>
          <button
            className="mt-6 rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--cream)]"
            onClick={() => navigate('/explore')}
            type="button"
          >
            Back to Explore
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PremiumContentDetails
        content={content}
        onBookmark={handleBookmark}
        onShare={handleShare}
        saved={isBookmarked(content._id)}
      />
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--cream)] shadow-[0_0_24px_var(--glow)]">
          <FiCheck size={16} /> Link copied
        </div>
      )}
      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </>
  )
}

export default ContentDetails
