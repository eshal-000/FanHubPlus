import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiArrowRight,
  FiAward,
  FiBookmark,
  FiCalendar,
  FiClock,
  FiCompass,
  FiFileText,
  FiHeart,
  FiPlus,
  FiSend,
  FiStar,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../data/categories'
import mariaApi from '../services/mariaApi'

const QUOTES = [
  { text: "Fandoms aren't just hobbies, they're communities.", author: 'Fan Hub Plus' },
  { text: 'Every fan has a story worth telling.', author: 'Fan Hub Plus' },
  { text: 'Together, we celebrate what we love.', author: 'Fan Hub Plus' },
]

const EVENT_COLORS = {
  convention: '#FF006B',
  premiere: '#F59E0B',
  screening: '#06B6D4',
  'cosplay-meetup': '#A855F7',
}

function toSlug(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  const lower = text.toLowerCase()
  if (['k-pop', 'k pop', 'kpop'].includes(lower)) return 'k-pop'
  if (['tv-shows', 'tv shows', 'television'].includes(lower)) return 'tv-shows'
  return lower
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function categoryFor(value) {
  const slug = toSlug(value)
  return CATEGORIES.find((category) => category.slug === slug || toSlug(category.name) === slug) || null
}

function getBookmarkItem(bookmark) {
  return bookmark?.item || bookmark?.itemData || {}
}

function getBookmarkTitle(bookmark) {
  const item = getBookmarkItem(bookmark)
  return item.title || item.name || 'Saved item'
}

function getBookmarkCategory(bookmark) {
  const item = getBookmarkItem(bookmark)
  return categoryFor(item.categorySlug || item.category || item.fandom)
}

function getBookmarkHref(bookmark) {
  const item = getBookmarkItem(bookmark)
  const id = item._id || bookmark.itemId
  const pathByType = {
    article: '/articles',
    character: '/characters',
    content: '/content',
    media: '/media',
    merch: '/merch',
    merchandise: '/merch',
    video: '/content',
  }
  return `${pathByType[bookmark.itemType] || '/content'}/${id}`
}

function getSubmissionCategory(submission) {
  return categoryFor(submission.category || submission.fandom)
}

function asDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

function formatDate(value) {
  const date = asDate(value)
  if (!date) return 'Date unavailable'
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

function relativeTime(value) {
  const date = asDate(value)
  if (!date) return 'Recently'
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

function createWeeklyActivity(bookmarks, submissions) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    return {
      activity: 0,
      date,
      key: date.toISOString().slice(0, 10),
      saves: 0,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    }
  })
  const byKey = new Map(days.map((day) => [day.key, day]))

  for (const bookmark of bookmarks) {
    const date = asDate(bookmark.createdAt)
    const key = date?.toISOString().slice(0, 10)
    if (key && byKey.has(key)) {
      byKey.get(key).activity += 1
      byKey.get(key).saves += 1
    }
  }

  for (const submission of submissions) {
    const date = asDate(submission.createdAt)
    const key = date?.toISOString().slice(0, 10)
    if (key && byKey.has(key)) byKey.get(key).activity += 1
  }

  return days.map(({ date: _date, key: _key, ...day }) => day)
}

function createRecentActivity(bookmarks, submissions) {
  const bookmarkActivities = bookmarks.map((bookmark) => ({
    id: `bookmark-${bookmark._id || bookmark.itemId}`,
    action: 'saved',
    color: getBookmarkCategory(bookmark)?.color || '#FF006B',
    detail: getBookmarkTitle(bookmark),
    href: getBookmarkHref(bookmark),
    icon: FiBookmark,
    time: bookmark.createdAt,
  }))

  const submissionActivities = submissions.map((submission) => ({
    id: `submission-${submission._id}`,
    action: submission.status === 'published' ? 'published' : 'submitted',
    color: getSubmissionCategory(submission)?.color || '#A855F7',
    detail: submission.title || 'Untitled submission',
    href: '/my-submissions',
    icon: FiFileText,
    time: submission.publishedAt || submission.createdAt,
  }))

  return [...bookmarkActivities, ...submissionActivities]
    .filter((activity) => asDate(activity.time))
    .sort((a, b) => asDate(b.time) - asDate(a.time))
    .slice(0, 4)
}

function greetingForHour() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  if (hour < 21) return 'Good Evening'
  return 'Good Night'
}

const Dashboard = () => {
  const { clearSession, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [quote] = useState(() => QUOTES[new Date().getDay() % QUOTES.length])
  const [mood] = useState(greetingForHour)
  const [activeChart, setActiveChart] = useState('area')
  const [loadedAt, setLoadedAt] = useState(() => new Date())
  const [dashboardUser, setDashboardUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      if (!token) return
      try {
        setLoading(true)
        setError('')

        const [profileResponse, bookmarksResponse, submissionsResponse, eventsResponse] = await Promise.all([
          mariaApi.get('/profile'),
          mariaApi.get('/bookmarks'),
          mariaApi.get('/submissions/mine'),
          mariaApi.get('/events?timeFilter=upcoming&limit=3').catch(() => ({ data: { items: [] } })),
        ])

        if (!mounted) return

        setDashboardUser(profileResponse.data.user || null)
        setBookmarks(bookmarksResponse.data.items || bookmarksResponse.data.bookmarks || [])
        setSubmissions(submissionsResponse.data.submissions || [])
        setEvents(eventsResponse.data.items || [])
        setLoadedAt(new Date())
      } catch (err) {
        if (!mounted) return
        if (err.response?.status === 401 || err.response?.status === 403) {
          clearSession()
          navigate('/login', { replace: true, state: { from: location } })
          return
        }
        setError('Could not verify your dashboard data. Please try again.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      mounted = false
    }
  }, [clearSession, location, navigate, token])

  const favoriteFandoms = useMemo(
    () => (Array.isArray(dashboardUser?.favoriteFandoms) ? dashboardUser.favoriteFandoms.filter(Boolean) : []),
    [dashboardUser],
  )

  const bookmarkCountsByCategory = useMemo(() => {
    const counts = new Map()
    for (const bookmark of bookmarks) {
      const category = getBookmarkCategory(bookmark)
      if (category) counts.set(category.slug, (counts.get(category.slug) || 0) + 1)
    }
    return counts
  }, [bookmarks])

  const fandomData = useMemo(() => {
    const counts = new Map()

    for (const bookmark of bookmarks) {
      const category = getBookmarkCategory(bookmark)
      if (category) counts.set(category.slug, (counts.get(category.slug) || 0) + 1)
    }

    for (const submission of submissions) {
      const category = getSubmissionCategory(submission)
      if (category) counts.set(category.slug, (counts.get(category.slug) || 0) + 1)
    }

    if (counts.size === 0) {
      for (const fandom of favoriteFandoms) {
        const category = categoryFor(fandom)
        if (category) counts.set(category.slug, 1)
      }
    }

    return [...counts.entries()]
      .map(([slug, value]) => {
        const category = categoryFor(slug)
        return {
          color: category?.color || '#06B6D4',
          name: category?.name || slug,
          value,
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [bookmarks, favoriteFandoms, submissions])

  const activityData = useMemo(() => createWeeklyActivity(bookmarks, submissions), [bookmarks, submissions])
  const recentActivity = useMemo(() => createRecentActivity(bookmarks, submissions), [bookmarks, submissions])

  const favoriteCards = useMemo(
    () =>
      favoriteFandoms
        .map((fandom) => categoryFor(fandom))
        .filter(Boolean)
        .slice(0, 4),
    [favoriteFandoms],
  )

  const stats = useMemo(() => {
    const now = loadedAt.getTime()
    const recentBookmarks = bookmarks.filter((bookmark) => {
      const date = asDate(bookmark.createdAt)
      return date && now - date.getTime() <= 7 * 24 * 60 * 60 * 1000
    }).length
    const pendingSubmissions = submissions.filter((submission) => submission.status === 'pending').length
    const publishedSubmissions = submissions.filter((submission) => submission.status === 'published').length

    return {
      bookmarks: bookmarks.length,
      favoriteFandoms: favoriteFandoms.length,
      pendingSubmissions,
      publishedSubmissions,
      recentBookmarks,
      submissions: submissions.length,
    }
  }, [bookmarks, favoriteFandoms.length, loadedAt, submissions])

  const displayName = dashboardUser?.name?.split(' ')[0] || 'Fan'

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center text-sm text-[var(--muted)]">
          Verifying your dashboard...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center">
          <FiActivity className="mx-auto mb-4 text-[var(--primary)]" size={34} />
          <h1 className="font-orbitron text-2xl font-bold text-[var(--cream)]">Dashboard unavailable</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-20 -top-24 h-[420px] w-[420px] rounded-full bg-[var(--primary)] opacity-10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-[var(--raspberry)] opacity-10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--yellow)]">
                {mood} *
              </p>
              <h1 className="font-orbitron text-2xl font-black leading-tight text-[var(--cream)] md:text-4xl">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--raspberry)] bg-clip-text text-transparent">
                  {displayName}
                </span>
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Here's what's happening in your fandom universe today.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/submit-content"
                className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition hover:bg-[var(--raspberry)]"
              >
                <FiPlus size={14} /> Create Post
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--nav)]/60 px-5 py-2.5 text-sm font-semibold text-[var(--cream)] transition hover:border-[var(--primary)]"
              >
                <FiCompass size={14} /> Explore
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--surface)]/60 via-[var(--nav)]/60 to-[var(--surface)]/60 px-6 py-4 backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--yellow)]/20">
              <FiStar className="text-[var(--yellow)]" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--yellow)]">
                Quote of the Day
              </p>
              <p className="font-orbitron truncate text-sm italic text-[var(--cream)] md:text-base">
                "{quote.text}"
              </p>
            </div>
            <span className="hidden shrink-0 text-[10px] text-[var(--muted)] md:block">
              - {quote.author}
            </span>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: 'Bookmarks',
              value: stats.bookmarks,
              Icon: FiBookmark,
              color: '#FF006B',
              trend: `${stats.recentBookmarks} this week`,
            },
            {
              label: 'Submissions',
              value: stats.submissions,
              Icon: FiFileText,
              color: '#A855F7',
              trend: `${stats.pendingSubmissions} pending`,
            },
            {
              label: 'Favorite Fandoms',
              value: stats.favoriteFandoms,
              Icon: FiUsers,
              color: '#EC4899',
              trend: `${stats.favoriteFandoms} selected`,
            },
            {
              label: 'Community Posts',
              value: stats.publishedSubmissions,
              Icon: FiTrendingUp,
              color: '#10B981',
              trend: `${stats.publishedSubmissions} published`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-5 backdrop-blur-md transition hover:border-[var(--primary)]/40"
            >
              <div
                className="absolute right-0 top-0 h-20 w-20 rounded-full opacity-10 blur-2xl transition group-hover:opacity-20"
                style={{ backgroundColor: stat.color }}
              />
              <div className="relative">
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.Icon size={18} style={{ color: stat.color }} />
                  </div>
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: stat.color }}>
                    {stat.trend}
                  </span>
                </div>
                <p className="font-orbitron text-3xl font-bold text-[var(--cream)]">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-6 backdrop-blur-md lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-orbitron text-base font-bold text-[var(--cream)] md:text-lg">
                  Weekly Activity
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Verified bookmarks and submissions from the last 7 days
                </p>
              </div>

              <div className="flex gap-1 rounded-full bg-[var(--nav)]/40 p-1">
                {['area', 'bar'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveChart(type)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                      activeChart === type
                        ? 'bg-[var(--primary)] text-[var(--cream)]'
                        : 'text-[var(--muted)] hover:text-[var(--cream)]'
                    }`}
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                {activeChart === 'area' ? (
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#FF006B" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#FF006B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSaves" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,243,222,0.06)" strokeDasharray="3 3" />
                    <XAxis axisLine={false} dataKey="day" fontSize={11} stroke="#D6B9CA" tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} fontSize={11} stroke="#D6B9CA" tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        color: 'var(--cream)',
                        fontSize: '12px',
                      }}
                    />
                    <Area dataKey="activity" fill="url(#colorActivity)" stroke="#FF006B" strokeWidth={2} type="monotone" />
                    <Area dataKey="saves" fill="url(#colorSaves)" stroke="#A855F7" strokeWidth={2} type="monotone" />
                  </AreaChart>
                ) : (
                  <BarChart data={activityData}>
                    <CartesianGrid stroke="rgba(255,243,222,0.06)" strokeDasharray="3 3" />
                    <XAxis axisLine={false} dataKey="day" fontSize={11} stroke="#D6B9CA" tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} fontSize={11} stroke="#D6B9CA" tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        color: 'var(--cream)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="activity" fill="#FF006B" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="saves" fill="#A855F7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center gap-5 border-t border-[var(--border)] pt-4">
              <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="h-3 w-3 rounded-full bg-[var(--primary)]" />
                Activity
              </span>
              <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="h-3 w-3 rounded-full bg-[#A855F7]" />
                Saves
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-6 backdrop-blur-md">
            <div className="mb-5">
              <h2 className="font-orbitron text-base font-bold text-[var(--cream)] md:text-lg">
                Fandom Distribution
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Based on your saved items and submissions
              </p>
            </div>

            {fandomData.length > 0 ? (
              <>
                <div className="h-52">
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={fandomData}
                        dataKey="value"
                        innerRadius={50}
                        nameKey="name"
                        outerRadius={80}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {fandomData.map((entry) => (
                          <Cell fill={entry.color} key={entry.name} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          color: 'var(--cream)',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {fandomData.map((item) => (
                    <div className="flex items-center gap-2" key={item.name}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-[11px] text-[var(--muted)]">{item.name}</span>
                      <span className="ml-auto text-[11px] font-semibold text-[var(--cream)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--nav)]/40 p-5 text-center text-xs text-[var(--muted)]">
                Save items or submit content to build your distribution.
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-6 backdrop-blur-md">
              <h2 className="font-orbitron mb-4 flex items-center gap-2 text-base font-bold text-[var(--cream)] md:text-lg">
                <FiAward className="text-[var(--yellow)]" size={18} />
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'Submit Content', Icon: FiSend, to: '/submit-content', color: '#FF006B' },
                  { label: 'My Bookmarks', Icon: FiBookmark, to: '/bookmarks', color: '#A855F7' },
                  { label: 'My Profile', Icon: FiUser, to: '/profile', color: '#EC4899' },
                  { label: 'Explore', Icon: FiCompass, to: '/explore', color: '#10B981' },
                ].map((action) => (
                  <Link
                    className="group rounded-xl border border-[var(--border)] bg-[var(--nav)]/40 p-4 transition-all hover:scale-[1.02] hover:border-[var(--primary)]/60"
                    key={action.label}
                    to={action.to}
                  >
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <action.Icon size={18} style={{ color: action.color }} />
                    </div>
                    <p className="text-xs font-semibold text-[var(--cream)]">{action.label}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-orbitron flex items-center gap-2 text-base font-bold text-[var(--cream)] md:text-lg">
                  <FiHeart className="text-[var(--primary)]" size={18} />
                  Your Favorite Fandoms
                </h2>
                <Link
                  className="flex items-center gap-1 text-xs text-[var(--primary)] transition hover:text-[var(--yellow)]"
                  to="/profile"
                >
                  Edit <FiArrowRight size={12} />
                </Link>
              </div>

              {favoriteCards.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {favoriteCards.map((fandom) => {
                    const savedCount = bookmarkCountsByCategory.get(fandom.slug) || 0
                    return (
                      <Link
                        className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--border)] transition-all duration-300 hover:border-[var(--primary)]/60"
                        key={fandom.id}
                        to={`/explore/${fandom.slug}`}
                      >
                        <img
                          alt={fandom.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          src={fandom.image}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="font-orbitron text-sm font-bold text-[var(--cream)]">{fandom.name}</h3>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[var(--muted)]">
                            <FiBookmark size={10} />
                            {savedCount > 0 ? `${savedCount} saved` : 'Favorite fandom'}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-8 text-center">
                  <FiHeart className="mx-auto mb-3 text-[var(--primary)]" size={28} />
                  <h3 className="font-orbitron text-xl font-bold text-[var(--cream)]">No favorite fandoms yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                    Add favorite fandoms from your profile and they will appear here.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-orbitron flex items-center gap-2 text-base font-bold text-[var(--cream)]">
                  <FiCalendar className="text-[var(--primary)]" size={16} />
                  Upcoming Events
                </h2>
              </div>

              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => {
                    const eventColor = EVENT_COLORS[event.eventType] || '#FF006B'
                    return (
                      <Link
                        className="group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-[var(--nav)]/40"
                        key={event._id}
                        to={`/events/${event._id}`}
                      >
                        {event.imageUrl ? (
                          <img
                            alt={event.title}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover"
                            src={event.imageUrl}
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--nav)] text-[var(--muted)]">
                            <FiCalendar size={18} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xs font-semibold text-[var(--cream)]">{event.title}</h3>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[var(--muted)]">
                            <FiClock size={9} /> {formatDate(event.startDate)}
                          </p>
                          <span
                            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold"
                            style={{ backgroundColor: `${eventColor}20`, color: eventColor }}
                          >
                            {event.city || event.eventType}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--nav)]/40 p-4 text-xs text-[var(--muted)]">
                  No upcoming events are available right now.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-orbitron flex items-center gap-2 text-base font-bold text-[var(--cream)]">
                  <FiActivity className="text-[var(--primary)]" size={16} />
                  Recent Activity
                </h2>
              </div>

              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <Link className="flex items-start gap-3" key={activity.id} to={activity.href}>
                      <div className="relative shrink-0">
                        {dashboardUser?.avatarUrl ? (
                          <img alt={dashboardUser.name} className="h-8 w-8 rounded-full object-cover" src={dashboardUser.avatarUrl} />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--nav)] text-xs font-bold text-[var(--cream)]">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div
                          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--surface)]"
                          style={{ backgroundColor: activity.color }}
                        >
                          <activity.icon className="text-white" size={8} />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug text-[var(--muted)]">
                          You <span className="font-semibold text-[var(--cream)]">{activity.action}</span>{' '}
                          {activity.detail}
                        </p>
                        <p className="mt-1 text-[10px] text-[var(--muted)]/60">{relativeTime(activity.time)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--nav)]/40 p-4 text-xs text-[var(--muted)]">
                  Your verified bookmarks and submissions will appear here.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
