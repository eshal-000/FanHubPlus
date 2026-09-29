import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  ChevronLeft,
  ExternalLink,
  Home,
  MessageCircle,
  Minus,
  RefreshCcw,
  Sparkles,
  X,
} from 'lucide-react'

const CATEGORIES = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga', 'Cosplay']

const GUIDE_SECTIONS = [
  {
    id: 'start',
    title: 'Quick Start',
    path: '/',
    questions: [
      {
        id: 'what-is-fhp',
        label: 'What is Fan Hub Plus?',
        answer:
          'Fan Hub Plus is a fandom discovery hub with curated categories, content details, characters, articles, media, events, releases, merch showcases, bookmarks and account features.',
        path: '/',
      },
      {
        id: 'categories',
        label: 'Which fandom categories are here?',
        answer: `The eight project categories are ${CATEGORIES.join(', ')}. Explore keeps these categories in the approved original order.`,
        path: '/explore',
      },
    ],
  },
  {
    id: 'explore',
    title: 'Explore',
    path: '/explore',
    questions: [
      {
        id: 'browse',
        label: 'How do I browse fandoms?',
        answer:
          'Open Explore to see the eight fandom category cards. Select a category to view its MongoDB-driven content records and dedicated details pages.',
        path: '/explore',
      },
      {
        id: 'details',
        label: 'How do content details work?',
        answer:
          'Category cards open dedicated details pages for the selected record. Details can include posters, banners, descriptions, contributors, media and related information when available.',
        path: '/explore',
      },
    ],
  },
  {
    id: 'characters',
    title: 'Characters',
    path: '/characters',
    questions: [
      {
        id: 'character-list',
        label: 'Where are characters?',
        answer:
          'Use Characters to browse available character profiles, then open a character for its detail page. Hall of Legends and The Podium use the same verified character image mapping.',
        path: '/characters',
      },
      {
        id: 'missing-images',
        label: 'Why might some images be missing?',
        answer:
          'A character image only appears when the database has a real image URL or the project has a matching verified local asset. Unmatched characters stay blank instead of using incorrect placeholders.',
        path: '/characters',
      },
    ],
  },
  {
    id: 'articles',
    title: 'Articles',
    path: '/articles',
    questions: [
      {
        id: 'articles-page',
        label: 'Where can I read articles?',
        answer:
          'Open Articles for the available fandom posts and editorial content. Use search and page controls there when they are available.',
        path: '/articles',
      },
    ],
  },
  {
    id: 'media',
    title: 'Media',
    path: '/media',
    questions: [
      {
        id: 'media-gallery',
        label: 'What is on the Media page?',
        answer:
          'Media shows verified fandom images, videos and existing local audio clips. It avoids placeholder or unrelated media and supports search plus category and media-type filters.',
        path: '/media',
      },
      {
        id: 'play-videos',
        label: 'Can I watch videos here?',
        answer:
          'Yes. Valid YouTube and direct video records open in the media viewer. If a record has no verified playable URL, it is not forced into the gallery.',
        path: '/media',
      },
    ],
  },
  {
    id: 'events',
    title: 'Events',
    path: '/events',
    questions: [
      {
        id: 'events-page',
        label: 'Where are events?',
        answer:
          'Open Events to view available fandom events and event details from the project. PulseBot only links to existing pages.',
        path: '/events',
      },
    ],
  },
  {
    id: 'releases',
    title: 'Releases',
    path: '/releases',
    questions: [
      {
        id: 'release-page',
        label: 'Where are upcoming releases?',
        answer:
          'Open Releases to view the project release tracker and available release details.',
        path: '/releases',
      },
    ],
  },
  {
    id: 'merch',
    title: 'Merch',
    path: '/merch',
    questions: [
      {
        id: 'merch-page',
        label: 'Where is merch?',
        answer:
          'Open Merch to view merchandise showcases that are available in Fan Hub Plus.',
        path: '/merch',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    path: '/dashboard',
    questions: [
      {
        id: 'login',
        label: 'How do I sign in?',
        answer:
          'Use Login to access your account. Regular users go to the user dashboard after login; admins use the separate admin dashboard.',
        path: '/login',
      },
      {
        id: 'dashboard',
        label: 'Where is my dashboard?',
        answer:
          'Your Dashboard shows account-specific user information after the backend session is verified.',
        path: '/dashboard',
      },
    ],
  },
  {
    id: 'bookmarks',
    title: 'Bookmarks',
    path: '/bookmarks',
    questions: [
      {
        id: 'save-items',
        label: 'How do bookmarks work?',
        answer:
          'Logged-in users can save supported content and characters. Guest users are asked to sign in before saving items.',
        path: '/bookmarks',
      },
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    path: '/feedback',
    questions: [
      {
        id: 'send-feedback',
        label: 'How do I send feedback?',
        answer:
          'Open Feedback to send site feedback through the existing Fan Hub Plus feedback page.',
        path: '/feedback',
      },
    ],
  },
]

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function FloatingChatbot() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [sectionId, setSectionId] = useState(null)
  const [questionId, setQuestionId] = useState(null)
  const timestamp = useMemo(getTime, [sectionId, questionId, open])

  const section = GUIDE_SECTIONS.find((item) => item.id === sectionId)
  const question = section?.questions.find((item) => item.id === questionId)

  function openChat() {
    setOpen(true)
    setMinimized(false)
  }

  function goHome() {
    setSectionId(null)
    setQuestionId(null)
  }

  function goBack() {
    if (questionId) {
      setQuestionId(null)
      return
    }
    setSectionId(null)
  }

  function goTo(path) {
    navigate(path)
    setOpen(false)
    setMinimized(false)
  }

  return (
    <>
      <AnimatePresence>
        {open && !minimized && (
          <motion.section
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-label="Fan Hub Plus chatbot guide"
            className="fixed inset-x-3 bottom-20 top-3 z-[45] flex flex-col overflow-hidden rounded-2xl border border-primary/40 bg-[#13000e]/95 shadow-[0_0_40px_rgba(255,0,107,0.24),0_24px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(680px,calc(100dvh-7.5rem))] sm:w-[min(420px,calc(100vw-2rem))] sm:rounded-3xl"
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            role="dialog"
          >
            <div className="relative overflow-hidden border-b border-primary/25 px-3 py-3 sm:px-4 sm:py-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,0,107,0.25),transparent_38%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.22),transparent_34%)]" />
              <div className="relative flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-cream shadow-lg shadow-primary/35 sm:h-11 sm:w-11">
                  <Bot size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="special text-xs uppercase tracking-[0.22em] text-yellow">PulseBot</p>
                  <h2 className="truncate font-orbitron text-base font-black text-cream">
                    Fan Hub Plus Guide
                  </h2>
                </div>
                <button
                  aria-label="Restart PulseBot guide"
                  className="grid h-8 w-8 place-items-center rounded-full border border-cream/10 bg-bg/60 text-muted transition hover:border-yellow hover:text-yellow sm:h-9 sm:w-9"
                  onClick={goHome}
                  type="button"
                >
                  <RefreshCcw size={16} />
                </button>
                <button
                  aria-label="Minimize PulseBot"
                  className="grid h-8 w-8 place-items-center rounded-full border border-cream/10 bg-bg/60 text-muted transition hover:border-yellow hover:text-yellow sm:h-9 sm:w-9"
                  onClick={() => setMinimized(true)}
                  type="button"
                >
                  <Minus size={17} />
                </button>
                <button
                  aria-label="Close PulseBot"
                  className="grid h-8 w-8 place-items-center rounded-full border border-cream/10 bg-bg/60 text-muted transition hover:border-primary hover:text-primary sm:h-9 sm:w-9"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
              <article className="flex gap-2">
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                  <Sparkles size={15} />
                </div>
                <div className="max-w-[86%] rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm leading-6 text-cream/90 shadow-lg">
                  {!section && (
                    <>
                      <p>
                        Hi, I am PulseBot. Pick a page or question below and I will guide you through Fan Hub Plus.
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        This guide uses predefined website answers and does not call Gemini or any external AI service.
                      </p>
                    </>
                  )}

                  {section && !question && (
                    <>
                      <p className="font-semibold text-cream">{section.title}</p>
                      <p className="mt-1 text-muted">Choose a question or open the page directly.</p>
                    </>
                  )}

                  {question && (
                    <>
                      <p className="font-semibold text-cream">{question.label}</p>
                      <p className="mt-2">{question.answer}</p>
                    </>
                  )}

                  <p className="mt-2 text-[0.68rem] text-muted">{timestamp}</p>
                </div>
              </article>

              {(section || question) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/70 px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary/70 hover:text-cream"
                    onClick={goBack}
                    type="button"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/70 px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary/70 hover:text-cream"
                    onClick={goHome}
                    type="button"
                  >
                    <Home size={14} /> Home
                  </button>
                  {section?.path && (
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-bold text-cream shadow-lg shadow-primary/25 transition hover:bg-secondary"
                      onClick={() => goTo(question?.path || section.path)}
                      type="button"
                    >
                      Open Page <ExternalLink size={13} />
                    </button>
                  )}
                </div>
              )}

              {!section && (
                <div className="mt-5 grid gap-2">
                  {GUIDE_SECTIONS.map((item) => (
                    <button
                      className="group flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-[0_0_18px_rgba(255,0,107,0.22)]"
                      key={item.id}
                      onClick={() => {
                        setSectionId(item.id)
                        setQuestionId(null)
                      }}
                      type="button"
                    >
                      {item.title}
                      <ChevronLeft className="rotate-180 text-primary transition group-hover:translate-x-1" size={16} />
                    </button>
                  ))}
                </div>
              )}

              {section && !question && (
                <div className="mt-5 grid gap-2">
                  {section.questions.map((item) => (
                    <button
                      className="rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-[0_0_18px_rgba(255,0,107,0.22)]"
                      key={item.id}
                      onClick={() => setQuestionId(item.id)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-primary/20 bg-bg/45 p-3 sm:p-4">
              <p className="text-center text-xs leading-5 text-muted">
                Use the buttons above to navigate. Free-text chat is disabled for this predefined website guide.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        aria-label={open && minimized ? 'Restore PulseBot guide' : 'Open PulseBot guide'}
        className="fixed bottom-4 right-4 z-[45] grid h-12 w-12 place-items-center rounded-full border border-primary/50 bg-primary text-cream shadow-[0_0_30px_rgba(255,0,107,0.38)] transition hover:bg-secondary focus-visible:outline-yellow sm:bottom-5 sm:right-6 sm:h-14 sm:w-14"
        onClick={openChat}
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="absolute -left-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-yellow text-[10px] font-black text-bg sm:h-7 sm:w-7 sm:text-xs">
          FAQ
        </span>
        <MessageCircle size={25} />
      </motion.button>
    </>
  )
}
