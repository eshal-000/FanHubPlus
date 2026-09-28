import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookmark,
  FiFileText,
  FiUsers,
  FiTrendingUp,
  FiSend,
  FiUser,
  FiCompass,
  FiCalendar,
  FiActivity,
  FiHeart,
  FiMessageCircle,
  FiStar,
  FiArrowRight,
  FiPlay,
  FiAward,
  FiClock,
  FiPlus,
  FiChevronRight,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';

// ============================================
// MOCK DATA
// ============================================
const ACTIVITY_DATA = [
  { day: 'Mon', activity: 12, saves: 4 },
  { day: 'Tue', activity: 19, saves: 7 },
  { day: 'Wed', activity: 15, saves: 5 },
  { day: 'Thu', activity: 27, saves: 12 },
  { day: 'Fri', activity: 22, saves: 9 },
  { day: 'Sat', activity: 34, saves: 15 },
  { day: 'Sun', activity: 28, saves: 11 },
];

const FANDOM_DATA = [
  { name: 'Anime', value: 35, color: '#FF006B' },
  { name: 'Gaming', value: 25, color: '#A855F7' },
  { name: 'K-Pop', value: 20, color: '#EC4899' },
  { name: 'Movies', value: 12, color: '#F59E0B' },
  { name: 'Others', value: 8, color: '#06B6D4' },
];

const MOCK_FANDOMS = [
  { ...CATEGORIES[0], members: 2400 },
  { ...CATEGORIES[1], members: 1800 },
  { ...CATEGORIES[4], members: 3200 },
  { ...CATEGORIES[2], members: 1500 },
];

const MOCK_EVENTS = [
  { id: 1, title: 'BTS Anniversary Event', date: 'Jun 13', tag: 'Music', color: '#A855F7', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200' },
  { id: 2, title: 'Anime Watch Party', date: 'Jun 16', tag: 'Anime', color: '#FF006B', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200' },
  { id: 3, title: 'Marvel Movie Night', date: 'Jun 20', tag: 'Movies', color: '#F59E0B', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200' },
];

const MOCK_ACTIVITY = [
  { id: 1, user: 'Ayesha_7', userAvatar: 'https://i.pravatar.cc/100?img=5', action: 'commented on your post', detail: '"This is so beautiful!"', time: '2h', icon: FiMessageCircle, color: '#FF006B' },
  { id: 2, user: 'JungkookLover', userAvatar: 'https://i.pravatar.cc/100?img=12', action: 'joined BTS fandom', time: '3h', icon: FiUsers, color: '#A855F7' },
  { id: 3, user: 'AnimeQueen', userAvatar: 'https://i.pravatar.cc/100?img=9', action: 'liked your post', time: '5h', icon: FiHeart, color: '#EC4899' },
  { id: 4, user: 'Haider', userAvatar: 'https://i.pravatar.cc/100?img=3', action: 'added a product', time: '6h', icon: FiTrendingUp, color: '#10B981' },
];

const QUOTES = [
  { text: "Fandoms aren't just hobbies, they're communities.", author: 'Fan Hub Plus' },
  { text: "Every fan has a story worth telling.", author: 'Fan Hub Plus' },
  { text: "Together, we celebrate what we love.", author: 'Fan Hub Plus' },
];

// ============================================
// MAIN COMPONENT
// ============================================
const Dashboard = () => {
  const { user } = useAuth();
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [mood, setMood] = useState('');
  const [activeChart, setActiveChart] = useState('area');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setMood('Good Morning');
    else if (hour < 17) setMood('Good Afternoon');
    else if (hour < 21) setMood('Good Evening');
    else setMood('Good Night');
  }, []);

  const stats = useMemo(() => {
    const bookmarks = JSON.parse(localStorage.getItem('fhp_bookmarks') || '[]');
    const submissions = JSON.parse(localStorage.getItem('fhp_submissions') || '[]');
    return {
      bookmarks: bookmarks.length || 12,
      submissions: submissions.length || 5,
      fandoms: 4,
      posts: 28,
    };
  }, []);

  const displayName = user?.name?.split(' ')[0] || 'Maria';

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-[var(--primary)] opacity-10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-[var(--raspberry)] opacity-10 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* ============ COMPACT WELCOME HEADER ============ */}
        <section className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--yellow)] font-semibold mb-2">
                {mood} ✨
              </p>
              <h1 className="font-orbitron text-2xl md:text-4xl font-black text-[var(--cream)] leading-tight">
                Welcome back, <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--raspberry)] bg-clip-text text-transparent">{displayName}</span>
              </h1>
              <p className="text-sm text-[var(--muted)] mt-2">
                Here's what's happening in your fandom universe today.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/submit-content"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] text-sm"
              >
                <FiPlus size={14} /> Create Post
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--nav)]/60 text-[var(--cream)] font-semibold hover:border-[var(--primary)] border border-[var(--border)] transition text-sm"
              >
                <FiCompass size={14} /> Explore
              </Link>
            </div>
          </div>

          {/* Quote Bar */}
          <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--surface)]/60 via-[var(--nav)]/60 to-[var(--surface)]/60 backdrop-blur-md px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--yellow)]/20 flex items-center justify-center shrink-0">
              <FiStar size={18} className="text-[var(--yellow)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[var(--yellow)] font-semibold">
                Quote of the Day
              </p>
              <p className="font-orbitron text-sm md:text-base text-[var(--cream)] italic truncate">
                "{quote.text}"
              </p>
            </div>
            <span className="hidden md:block text-[10px] text-[var(--muted)] shrink-0">
              — {quote.author}
            </span>
          </div>
        </section>

        {/* ============ STATS ROW ============ */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Bookmarks', value: stats.bookmarks, Icon: FiBookmark, color: '#FF006B', trend: '+2 this week' },
            { label: 'Submissions', value: stats.submissions, Icon: FiFileText, color: '#A855F7', trend: '+1 new' },
            { label: 'Favorite Fandoms', value: stats.fandoms, Icon: FiUsers, color: '#EC4899', trend: 'Joined 4' },
            { label: 'Community Posts', value: stats.posts, Icon: FiTrendingUp, color: '#10B981', trend: '+12% ↑' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5 hover:border-[var(--primary)]/40 transition overflow-hidden group"
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition"
                style={{ backgroundColor: stat.color }}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.Icon size={18} style={{ color: stat.color }} />
                  </div>
                  <span
                    className="text-[10px] font-semibold flex items-center gap-0.5"
                    style={{ color: stat.color }}
                  >
                    {stat.trend}
                  </span>
                </div>
                <p className="font-orbitron text-3xl font-bold text-[var(--cream)]">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ============ CHARTS ROW ============ */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Activity Chart (Area) */}
          <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="font-orbitron text-base md:text-lg font-bold text-[var(--cream)]">
                  Weekly Activity
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Your engagement over the last 7 days
                </p>
              </div>

              <div className="flex gap-1 bg-[var(--nav)]/40 rounded-full p-1">
                {['area', 'bar'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveChart(type)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition ${
                      activeChart === type
                        ? 'bg-[var(--primary)] text-[var(--cream)]'
                        : 'text-[var(--muted)] hover:text-[var(--cream)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'area' ? (
                  <AreaChart data={ACTIVITY_DATA}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF006B" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#FF006B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,243,222,0.06)" />
                    <XAxis
                      dataKey="day"
                      stroke="#D6B9CA"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#D6B9CA"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        color: 'var(--cream)',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="activity"
                      stroke="#FF006B"
                      strokeWidth={2}
                      fill="url(#colorActivity)"
                    />
                    <Area
                      type="monotone"
                      dataKey="saves"
                      stroke="#A855F7"
                      strokeWidth={2}
                      fill="url(#colorSaves)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={ACTIVITY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,243,222,0.06)" />
                    <XAxis
                      dataKey="day"
                      stroke="#D6B9CA"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#D6B9CA"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                    />
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

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[var(--border)]">
              <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                Activity
              </span>
              <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="w-3 h-3 rounded-full bg-[#A855F7]" />
                Saves
              </span>
            </div>
          </div>

          {/* Fandom Distribution (Pie) */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
            <div className="mb-5">
              <h2 className="font-orbitron text-base md:text-lg font-bold text-[var(--cream)]">
                Fandom Distribution
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Your content by category
              </p>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={FANDOM_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {FANDOM_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
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

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {FANDOM_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] text-[var(--muted)] truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-[var(--cream)] font-semibold ml-auto">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* QUICK ACTIONS */}
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
              <h2 className="font-orbitron text-base md:text-lg font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                <FiAward className="text-[var(--yellow)]" size={18} />
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Submit Content', Icon: FiSend, to: '/submit-content', color: '#FF006B' },
                  { label: 'My Bookmarks', Icon: FiBookmark, to: '/bookmarks', color: '#A855F7' },
                  { label: 'My Profile', Icon: FiUser, to: '/profile', color: '#EC4899' },
                  { label: 'Explore', Icon: FiCompass, to: '/explore', color: '#10B981' },
                ].map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="group rounded-xl border border-[var(--border)] bg-[var(--nav)]/40 p-4 hover:border-[var(--primary)]/60 hover:scale-[1.02] transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <action.Icon size={18} style={{ color: action.color }} />
                    </div>
                    <p className="text-xs font-semibold text-[var(--cream)]">
                      {action.label}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* FAVORITE FANDOMS */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-orbitron text-base md:text-lg font-bold text-[var(--cream)] flex items-center gap-2">
                  <FiHeart className="text-[var(--primary)]" size={18} />
                  Your Favorite Fandoms
                </h2>
                <Link
                  to="/explore"
                  className="text-xs text-[var(--primary)] hover:text-[var(--yellow)] transition flex items-center gap-1"
                >
                  View All <FiArrowRight size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MOCK_FANDOMS.map((fandom) => (
                  <Link
                    key={fandom.id}
                    to={`/explore/${fandom.slug}`}
                    className="group relative rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/60 transition-all duration-300 aspect-[4/5]"
                  >
                    <img
                      src={fandom.image}
                      alt={fandom.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-orbitron text-sm font-bold text-[var(--cream)]">
                        {fandom.name}
                      </h3>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5 flex items-center gap-1">
                        <FiUsers size={10} />
                        {(fandom.members / 1000).toFixed(1)}K
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT (1/3) */}
          <div className="space-y-6">

            {/* UPCOMING EVENTS */}
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-orbitron text-base font-bold text-[var(--cream)] flex items-center gap-2">
                  <FiCalendar className="text-[var(--primary)]" size={16} />
                  Upcoming Events
                </h2>
              </div>

              <div className="space-y-3">
                {MOCK_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--nav)]/40 transition cursor-pointer"
                  >
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-[var(--cream)] truncate">
                        {event.title}
                      </h3>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5 flex items-center gap-1">
                        <FiClock size={9} /> {event.date}
                      </p>
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                        style={{
                          backgroundColor: `${event.color}20`,
                          color: event.color,
                        }}
                      >
                        {event.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-orbitron text-base font-bold text-[var(--cream)] flex items-center gap-2">
                  <FiActivity className="text-[var(--primary)]" size={16} />
                  Recent Activity
                </h2>
              </div>

              <div className="space-y-4">
                {MOCK_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={activity.userAvatar}
                        alt={activity.user}
                        className="w-8 h-8 rounded-full"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--surface)]"
                        style={{ backgroundColor: activity.color }}
                      >
                        <activity.icon size={8} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--muted)] leading-snug">
                        <span className="font-semibold text-[var(--cream)]">
                          {activity.user}
                        </span>{' '}
                        {activity.action}
                      </p>
                      {activity.detail && (
                        <p className="text-[11px] text-[var(--muted)]/80 italic mt-1">
                          {activity.detail}
                        </p>
                      )}
                      <p className="text-[10px] text-[var(--muted)]/60 mt-1">
                        {activity.time} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;