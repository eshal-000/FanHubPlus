import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  ChevronDown,
  Clock,
  Compass,
  FileText,
  Home as HomeIcon,
  Info,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  MoonStar,
  PlayCircle,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  Type,
  UserCircle,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { searchFanHubPlus } from '../services/globalSearch.js'
import Logo from './Logo.jsx'

const navLinks = [
  { label: 'Home', to: '/', Icon: HomeIcon },
  { label: 'Explore', to: '/explore', Icon: Compass },
  { label: 'Characters', to: '/characters', Icon: Users },
  { label: 'Articles', to: '/articles', Icon: FileText },
  { label: 'Media', to: '/media', Icon: PlayCircle },
  { label: 'Events', to: '/events', Icon: Calendar },
  { label: 'Releases', to: '/releases', Icon: Clock },
  { label: 'Merch', to: '/merch', Icon: ShoppingBag },
  { label: 'About', to: '/about', Icon: Info },
  { label: 'Feedback', to: '/feedback', Icon: MessageSquare },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const { clearSession, isAuthChecking, isAuthenticated, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-primary/35 bg-nav shadow-2xl shadow-black/35">

      <div className="bg-nav">
        <div className="fp-container flex items-center justify-between gap-4 py-3">
          <Logo className="shrink-0" />

          <SearchForm
            className="mx-auto hidden max-w-xl flex-1 md:flex"
            inputId="global-search-desktop"
          />

          <div className="hidden items-center gap-2.5 sm:flex">
            <AuthControls
              clearSession={clearSession}
              isAuthChecking={isAuthChecking}
              isAuthenticated={isAuthenticated}
              user={user}
            />
            <AccessibilityMenu />
          </div>

          <button
            aria-label="Toggle menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-yellow xl:hidden"
            onClick={() => setOpen(!open)}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>


      <nav className="border-t border-border/40 bg-nav">
        <div className="fp-container flex items-center justify-center py-1.5">
          <div className="hidden items-center gap-0.5 xl:flex">
            {navLinks.map((link) => (
              <PrimaryNavLink key={link.to} link={link} />
            ))}
          </div>

          <div className="flex items-center xl:hidden">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-yellow">
              Fandom Pulse
            </p>
          </div>
        </div>
      </nav>


      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="grid max-h-[calc(100dvh-7rem)] gap-4 overflow-y-auto border-t border-border bg-card p-4 xl:hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            <SearchForm inputId="global-search-mobile" onNavigate={() => setOpen(false)} />

            <div className="grid gap-2 sm:grid-cols-2">
              {navLinks.map((link) => (
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      isActive
                        ? 'border-yellow bg-yellow/10 text-yellow'
                        : 'border-border text-cream hover:border-primary hover:text-yellow'
                    }`
                  }
                  key={link.to}
                  onClick={() => setOpen(false)}
                  to={link.to}
                >
                  {({ isActive }) => (
                    <>
                      <link.Icon
                        aria-hidden="true"
                        className={isActive ? 'text-yellow' : 'text-cream/80'}
                        size={16}
                      />
                      <span>{link.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="grid gap-3 border-t border-border pt-4 sm:hidden">
              <AuthControls
                clearSession={clearSession}
                isAuthChecking={isAuthChecking}
                isAuthenticated={isAuthenticated}
                onNavigate={() => setOpen(false)}
                user={user}
              />
              <div className="flex justify-end">
                <AccessibilityMenu />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function SearchForm({ className = '', inputId = 'global-search', onNavigate }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      setError('')
      return undefined
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true)
        setError('')
        const nextResults = await searchFanHubPlus(trimmed)
        if (!cancelled) {
          setResults(nextResults)
          setOpen(true)
        }
      } catch (err) {
        if (!cancelled) {
          setResults([])
          setError(err?.message || 'Search failed')
          setOpen(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 240)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  function goToResult(result) {
    if (!result?.url) return
    setOpen(false)
    setQuery('')
    onNavigate?.()
    navigate(result.url)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (results[0]) goToResult(results[0])
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <form
        className="group flex w-full items-center gap-2 rounded-full border border-primary/40 bg-card px-3 py-1.5 shadow-inner shadow-black/20 transition-all duration-300 focus-within:border-yellow focus-within:shadow-[0_0_18px_rgba(255,0,107,0.28)]"
        onSubmit={handleSubmit}
        role="search"
      >
        <Search aria-hidden="true" className="shrink-0 text-yellow" size={17} />
        <label className="sr-only" htmlFor={inputId}>
          Search Fan Hub Plus
        </label>
        <input
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-cream outline-none ring-0 placeholder:text-muted focus:outline-none focus:ring-0"
          id={inputId}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search fandoms, characters, articles and events"
          style={{ outline: 'none', boxShadow: 'none' }}
          type="search"
          value={query}
        />
        {loading ? (
          <Loader2 className="shrink-0 animate-spin text-primary" size={17} />
        ) : query ? (
          <button
            aria-label="Clear search"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-light hover:text-primary"
            onClick={() => {
              setQuery('')
              setResults([])
              setOpen(false)
            }}
            type="button"
          >
            <X size={15} />
          </button>
        ) : null}
        <button
          className="special hidden rounded-full bg-primary px-4 py-1.5 text-xs text-[#FFF3DE] transition hover:shadow-glow md:inline-flex"
          type="submit"
        >
          Search
        </button>
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            animate={{ opacity: 1, y: 8 }}
            className="absolute left-0 right-0 top-full z-[70] max-h-[min(440px,70vh)] overflow-hidden rounded-3xl border border-primary/30 bg-card shadow-[0_18px_60px_rgba(0,0,0,0.35),0_0_28px_rgba(255,0,107,0.18)]"
            exit={{ opacity: 0, y: 0 }}
            initial={{ opacity: 0, y: 0 }}
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow">
                Global Search
              </p>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2">
              {loading && (
                <div className="flex items-center gap-3 px-3 py-5 text-sm text-muted">
                  <Loader2 className="animate-spin text-primary" size={18} />
                  Searching Fan Hub Plus...
                </div>
              )}

              {!loading && error && (
                <div className="px-3 py-5 text-sm text-muted">{error}</div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="px-3 py-5 text-sm text-muted">
                  No results found for "{query.trim()}".
                </div>
              )}

              {!loading &&
                !error &&
                results.map((result) => (
                  <button
                    className="group/result flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-surface-light focus-visible:bg-surface-light"
                    key={`${result.type}-${result.url}-${result.title}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => goToResult(result)}
                    type="button"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-nav">
                      {result.image ? (
                        <img
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          src={result.image}
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-primary">
                          <Search size={18} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                          {result.type}
                        </span>
                        {result.meta ? (
                          <span className="truncate text-[11px] text-muted">{result.meta}</span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-sm font-bold text-cream group-hover/result:text-primary">
                        {result.title}
                      </p>
                      {result.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted">{result.description}</p>
                      ) : null}
                    </div>
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PrimaryNavLink({ link }) {
  return (
    <NavLink
      className={({ isActive }) =>
        `group/nav font-jakarta relative flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition duration-300 after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-yellow after:transition-transform ${
          isActive
            ? 'text-yellow after:scale-x-100'
            : 'text-cream/80 after:scale-x-0 hover:text-yellow hover:after:scale-x-100'
        }`
      }
      to={link.to}
    >
      {({ isActive }) => (
        <>
          <link.Icon
            aria-hidden="true"
            className={`shrink-0 transition-colors duration-300 ${
              isActive
                ? 'text-yellow'
                : 'text-cream/80 group-hover/nav:text-primary'
            }`}
            size={15}
          />
          <span>{link.label}</span>
        </>
      )}
    </NavLink>
  )
}


function AuthControls({ clearSession, isAuthChecking, isAuthenticated, onNavigate, user }) {
  if (isAuthChecking) {
    return (
      <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border bg-card px-4 text-[0.8rem] font-bold tracking-wide text-muted">
        Checking...
      </span>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        className="special inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 text-[0.8rem] font-bold tracking-wide text-cream shadow-[0_0_14px_rgba(255,0,107,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FF006B] hover:shadow-[0_0_22px_rgba(255,0,107,0.55)] active:translate-y-0"
        onClick={onNavigate}
        to="/login"
      >
        Join Us
      </Link>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-cream transition hover:border-yellow hover:text-yellow"
        onClick={onNavigate}
        to={user?.role === 'admin' ? '/admin' : '/dashboard'}
      >
        <LayoutDashboard size={16} /> {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
      </Link>

      <Link
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-cream transition hover:border-yellow hover:text-yellow"
        onClick={onNavigate}
        to="/profile"
      >
        <UserCircle size={16} /> {user?.name || 'Profile'}
      </Link>

      <button
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-yellow transition hover:border-primary hover:text-primary"
        onClick={() => {
          clearSession()
          onNavigate?.()
        }}
        type="button"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  )
}

function AccessibilityMenu() {
  const {
    decreaseFontScale,
    fontScale,
    increaseFontScale,
    resetFontScale,
    setTheme,
    theme,
  } = useTheme()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-label="Open theme and font size controls"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-primary/30 bg-card px-3 text-yellow shadow-[0_0_12px_rgba(255,0,107,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow hover:shadow-[0_0_20px_rgba(255,0,107,0.35)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Settings size={17} />
        <ChevronDown className={`transition ${open ? 'rotate-180' : ''}`} size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 8, scale: 1 }}
            className="absolute right-0 top-full z-[80] w-[min(280px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-primary/30 bg-card p-3 text-cream shadow-[0_18px_60px_rgba(0,0,0,0.35),0_0_24px_rgba(255,0,107,0.18)]"
            exit={{ opacity: 0, y: 0, scale: 0.98 }}
            initial={{ opacity: 0, y: 0, scale: 0.98 }}
          >
            <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-yellow">
              Display
            </p>

            <div className="grid gap-2">
              <button
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${
                  theme === 'light'
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-cream hover:border-primary'
                }`}
                onClick={() => setTheme('light')}
                type="button"
              >
                <Sun size={17} /> Light Mode
              </button>
              <button
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-cream hover:border-primary'
                }`}
                onClick={() => setTheme('dark')}
                type="button"
              >
                <MoonStar size={17} /> Dark Mode
              </button>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  <Type size={14} /> Text Size
                </span>
                <span className="text-xs font-semibold capitalize text-yellow">{fontScale}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  className="rounded-2xl border border-border bg-bg/70 px-3 py-2 text-sm font-black text-cream transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={fontScale === 'small'}
                  onClick={decreaseFontScale}
                  type="button"
                >
                  A−
                </button>
                <button
                  className="rounded-2xl border border-border bg-bg/70 px-3 py-2 text-sm font-black text-cream transition hover:border-primary hover:text-primary"
                  onClick={resetFontScale}
                  type="button"
                >
                  A
                </button>
                <button
                  className="rounded-2xl border border-border bg-bg/70 px-3 py-2 text-sm font-black text-cream transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={fontScale === 'xlarge'}
                  onClick={increaseFontScale}
                  type="button"
                >
                  A+
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Navbar
