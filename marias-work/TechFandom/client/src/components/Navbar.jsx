import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Compass,
  FileText,
  Home as HomeIcon,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MoonStar,
  PlayCircle,
  Search,
  ShoppingBag,
  Sun,
  UserCircle,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
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
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const { clearSession, isAuthChecking, isAuthenticated, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-primary/35 bg-nav shadow-2xl shadow-black/35">
      {/* --- TOP ROW --- */}
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
            <ThemeToggleButton />
          </div>

          <button
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-card text-yellow sm:hidden"
            onClick={() => setOpen(!open)}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* --- BOTTOM ROW: centered nav links WITH icons --- */}
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

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="grid gap-4 border-t border-border bg-card p-4 xl:hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            <SearchForm inputId="global-search-mobile" />

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
                <ThemeToggleButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function SearchForm({ className = '', inputId = 'global-search' }) {
  return (
    <form
      className={`group flex items-center gap-2 rounded-full border border-primary/40 bg-[#390B2B] px-3 py-1.5 shadow-inner shadow-black/30 transition-all duration-300 focus-within:border-yellow focus-within:shadow-[0_0_18px_rgba(255,0,107,0.35)] ${className}`}
      onSubmit={(e) => e.preventDefault()}
      role="search"
    >
      <Search aria-hidden="true" className="shrink-0 text-yellow" size={17} />
      <label className="sr-only" htmlFor={inputId}>
        Search Fan Hub Plus
      </label>
      <input
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-cream outline-none ring-0 placeholder:text-muted focus:outline-none focus:ring-0"
        id={inputId}
        placeholder="Search fandoms, characters, articles and events"
        style={{ outline: 'none', boxShadow: 'none' }}
        type="search"
      />
      <button
        className="special hidden rounded-full bg-primary px-4 py-1.5 text-xs text-[#FFF3DE] transition hover:shadow-glow md:inline-flex"
        type="submit"
      >
        Search
      </button>
    </form>
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

/**
 * NOTE ON THE JOIN US BUTTON:
 * Previously this used the shared `.btn-primary` class, which (in your global
 * stylesheet/tailwind config) is sized for hero/CTA contexts and reads as
 * oversized in the compact navbar row. Rather than editing `.btn-primary`
 * globally — which would also resize your Hero and Footer CTA buttons — this
 * button now carries its own compact, self-contained styling scoped only to
 * the navbar, matching the 40px height of the theme toggle beside it.
 */
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

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-card text-yellow shadow-[0_0_12px_rgba(255,0,107,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow hover:shadow-[0_0_20px_rgba(255,0,107,0.45)]"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      type="button"
    >
      {theme === 'dark' ? <MoonStar size={18} /> : <Sun size={18} />}
    </button>
  )
}

export default Navbar
