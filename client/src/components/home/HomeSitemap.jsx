import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function HomeSitemap() {
  const { isAuthenticated } = useAuth()

  const groups = [
    {
      title: 'Discover',
      links: [
        ['Home', '/'],
        ['Explore', '/explore'],
        ['Characters', '/characters'],
        ['Articles', '/articles'],
        ['Media', '/media'],
      ],
    },
    {
      title: "What's New",
      links: [
        ['Events', '/events'],
        ['Releases', '/releases'],
        ['Merchandise', '/merch'],
      ],
    },
    {
      title: 'Platform',
      links: [
        ['About', '/about'],
        ['Feedback', '/feedback'],
      ],
    },
    {
      title: 'Account',
      links: isAuthenticated
        ? [
            ['Dashboard', '/dashboard'],
            ['Profile', '/profile'],
            ['Bookmarks', '/bookmarks'],
          ]
        : [
            ['Login', '/login'],
            ['Register', '/register'],
          ],
    },
  ]

  return (
    <section className="bg-bg px-4 py-16" id="sitemap">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="special text-sm uppercase tracking-[0.28em] text-yellow">Sitemap</p>
          <h2 className="mt-3 text-[clamp(1.5rem,2.4vw,2.25rem)] font-black text-cream">
            All Fan Hub Plus Routes
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div
              className="rounded-2xl border border-primary/25 bg-card p-5 shadow-[0_4px_24px_rgba(153,0,77,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_0_24px_rgba(255,0,107,0.32),0_12px_36px_rgba(153,0,77,0.26)]"
              key={group.title}
            >
              <h3 className="font-orbitron text-xs font-bold uppercase tracking-widest text-yellow">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.links.map(([label, to]) => (
                  <li key={to}>
                    <Link
                      className="text-sm text-muted transition hover:text-yellow"
                      to={to}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}