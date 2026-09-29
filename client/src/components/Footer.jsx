import { ArrowUpRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

const categories = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga', 'Cosplay']

function Footer() {
  return (
    <footer className="site-footer relative mt-20 px-4 pb-8 text-cream">
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-24 -translate-y-full text-[var(--footer-bg)]">
        <svg
          aria-hidden="true"
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 96"
        >
          <path
            d="M0 60C240 96 480 20 720 20C960 20 1200 96 1440 60V96H0Z"
            fill="currentColor"
          />
          <path
            d="M0 60C240 96 480 20 720 20C960 20 1200 96 1440 60"
            fill="none"
            stroke="var(--footer-wave-stroke)"
            strokeOpacity="0.72"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      <div className="pointer-events-none absolute right-[-8rem] top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-10rem] h-64 w-64 rounded-full bg-raspberry/25 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl pt-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="special text-xl text-yellow">Different fandoms. Same home.</p>
          <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] font-black leading-tight text-cream">
            Your universe is waiting.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted">
            Find your fandom path, save what you love and return when the community opens its doors.
          </p>
          <Link className="btn-primary special mt-6 inline-flex items-center gap-2 text-base" to="/login">
            Join the Fandom <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="grid gap-9 border-t border-border pt-10 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <Logo className="scale-90 origin-left" />
            <p className="mt-4 text-sm leading-7 text-muted">
              Fan Hub Plus is the shared home for curated fandom discovery across eight official categories.
            </p>
            <div className="mt-5 flex gap-3">
              <SocialIcon label="Twitter">X</SocialIcon>
              <SocialIcon label="Instagram">IG</SocialIcon>
              <SocialIcon label="Facebook">FB</SocialIcon>
              <SocialIcon label="GitHub">GH</SocialIcon>
            </div>
          </div>

          <FooterColumn
            links={[
              ['Home', '/'], ['Explore', '/explore'], ['Characters', '/characters'], ['Articles', '/articles'], ['Media', '/media'],
            ]}
            title="Quick Links"
          />

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-yellow">Fandom Categories</h3>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted">
              {categories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>
          </div>

          <FooterColumn
            links={[
              ['Events', '/events'], ['Releases', '/releases'], ['Merch', '/merch'], ['About', '/about'], ['Feedback', '/feedback'], ['Sitemap', '/#sitemap'],
            ]}
            title="More"
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026 Async Divas. Fan Hub Plus.</p>
          <p className="flex items-center gap-2">
            Built for TechWiz with <Heart className="text-primary" size={16} /> Fandom Pulse.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ links, title }) {
  return (
    <div>
      <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-yellow">{title}</h3>
      <ul className="mt-4 grid gap-2.5 text-sm text-muted">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link className="transition hover:text-yellow" to={to}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({ children, label }) {
  return (
    <span
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-[0.65rem] font-extrabold text-yellow transition hover:-translate-y-1 hover:border-yellow hover:shadow-glow"
      role="img"
      title={label}
    >
      {children}
    </span>
  )
}

export default Footer
