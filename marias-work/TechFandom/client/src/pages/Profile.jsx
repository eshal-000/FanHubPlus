import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiEdit,
  FiCheck,
  FiX,
  FiCamera,
  FiSave,
  FiHeart,
  FiBell,
  FiMoon,
  FiType,
  FiGlobe,
  FiShield,
  FiLogOut,
  FiStar,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';

// ============================================
// DEFAULT DATA
// ============================================
const DEFAULT_FANDOMS = ['anime', 'gaming', 'k-pop', 'movies'];

const FANDOM_COLORS = [
  '#FF006B', // Pink
  '#A855F7', // Purple
  '#EC4899', // Hot Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#10B981', // Green
  '#F472B6', // Rose
  '#8B5CF6', // Violet
];

// ============================================
// MAIN COMPONENT
// ============================================
const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || 'Maria Khan',
    email: user?.email || 'maria@fanhub.com',
    bio: 'Anime lover, K-Pop enthusiast, and part-time gamer. Always looking for new fandoms to join! ✨',
    favoriteFandoms: DEFAULT_FANDOMS,
  });

  const [preferences, setPreferences] = useState({
    darkMode: true,
    fontSize: 'medium',
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
  });

  const [avatar, setAvatar] = useState(user?.avatarUrl || 'https://i.pravatar.cc/200?img=1');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Load saved data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('fhp_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setForm((prev) => ({ ...prev, ...parsed.form }));
      setPreferences((prev) => ({ ...prev, ...parsed.preferences }));
      if (parsed.avatar) setAvatar(parsed.avatar);
    }
  }, []);

  // Fandom DNA chart data
  const fandomData = form.favoriteFandoms.map((slug, i) => {
    const cat = CATEGORIES.find((c) => c.slug === slug);
    return {
      name: cat?.name || slug,
      value: 100 / form.favoriteFandoms.length,
      color: FANDOM_COLORS[i % FANDOM_COLORS.length],
    };
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleFandom = (slug) => {
    setForm((prev) => ({
      ...prev,
      favoriteFandoms: prev.favoriteFandoms.includes(slug)
        ? prev.favoriteFandoms.filter((s) => s !== slug)
        : [...prev.favoriteFandoms, slug],
    }));
  };

  const handleSave = () => {
    localStorage.setItem(
      'fhp_profile',
      JSON.stringify({
        form,
        preferences,
        avatar,
      })
    );

    // Update user in context
    if (updateUser) {
      updateUser({ ...user, name: form.name, avatarUrl: avatar });
    }

    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', Icon: FiUser },
    { id: 'fandoms', label: 'Fandom DNA', Icon: FiHeart },
    { id: 'preferences', label: 'Preferences', Icon: FiBell },
    { id: 'account', label: 'Account', Icon: FiShield },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">

      {/* Saved Toast */}
      {saved && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] text-sm font-semibold shadow-[0_0_30px_var(--glow)] flex items-center gap-2">
          <FiCheck size={16} /> Profile saved!
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-10 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-[var(--primary)] opacity-20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-[var(--raspberry)] opacity-15 blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] hover:border-[var(--primary)] transition text-sm mb-8"
          >
            <FiArrowLeft size={14} /> Back
          </button>

          {/* Profile Card */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md overflow-hidden">
            {/* Cover */}
            <div className="relative h-32 md:h-40 bg-gradient-to-r from-[var(--primary)]/40 via-[var(--raspberry)]/30 to-[var(--primary)]/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary),transparent_70%)] opacity-30" />
            </div>

            {/* Avatar + Info */}
            <div className="relative px-6 md:px-8 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-12 md:-mt-16">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={avatar}
                    alt={form.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-[var(--surface)] shadow-[0_0_30px_var(--glow)]"
                  />
                  {editing && (
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center cursor-pointer hover:bg-[var(--raspberry)] transition shadow-lg">
                      <FiCamera size={16} className="text-[var(--cream)]" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Name + Email */}
                <div className="flex-1 md:pb-2">
                  {editing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full md:w-80 rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-lg font-bold text-[var(--cream)] outline-none focus:border-[var(--primary)] transition"
                      />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full md:w-80 rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)] transition"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="font-orbitron text-2xl md:text-4xl font-black text-[var(--cream)]">
                        {form.name}
                      </h1>
                      <p className="text-sm text-[var(--muted)] mt-1 flex items-center gap-2">
                        <FiMail size={12} /> {form.email}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-3 max-w-lg leading-relaxed">
                        {form.bio}
                      </p>
                    </>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 md:pb-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] text-sm"
                      >
                        <FiSave size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--nav)] text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)] transition text-sm"
                      >
                        <FiX size={14} /> Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] text-sm"
                    >
                      <FiEdit size={14} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="max-w-5xl mx-auto px-4 mb-6 relative z-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_15px_var(--glow)]'
                  : 'bg-[var(--surface)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
              }`}
            >
              <tab.Icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* TAB CONTENT */}
      <section className="max-w-5xl mx-auto px-4 pb-20 relative z-10">

        {/* ============ PROFILE TAB ============ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
              <h2 className="font-orbitron text-lg font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                <FiUser className="text-[var(--primary)]" size={18} />
                About Me
              </h2>

              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)] transition resize-none"
                />
              ) : (
                <p className="text-[var(--muted)] leading-relaxed">
                  {form.bio}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Bookmarks', value: 12, Icon: FiStar, color: '#FF006B' },
                { label: 'Submissions', value: 5, Icon: FiTrendingUp, color: '#A855F7' },
                { label: 'Fandoms', value: form.favoriteFandoms.length, Icon: FiHeart, color: '#EC4899' },
                { label: 'Days Active', value: 128, Icon: FiCheck, color: '#10B981' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5"
                >
                  <stat.Icon size={20} style={{ color: stat.color }} />
                  <p className="font-orbitron text-2xl font-bold text-[var(--cream)] mt-3">
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ FANDOM DNA TAB ============ */}
        {activeTab === 'fandoms' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Chart */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
                <h2 className="font-orbitron text-lg font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                  <FiHeart className="text-[var(--primary)]" size={18} />
                  Your Fandom DNA
                </h2>

                {fandomData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fandomData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {fandomData.map((entry, i) => (
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
                ) : (
                  <p className="text-center text-[var(--muted)] py-16">
                    Select fandoms below to see your DNA
                  </p>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {fandomData.map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                        border: `1px solid ${item.color}40`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fandom Selector */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
                <h2 className="font-orbitron text-lg font-bold text-[var(--cream)] mb-4">
                  Select Your Fandoms
                </h2>
                <p className="text-xs text-[var(--muted)] mb-4">
                  Choose your favorite fandoms — the chart updates automatically.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = form.favoriteFandoms.includes(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleFandom(cat.slug)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                          isSelected
                            ? 'text-[var(--cream)] shadow-[0_0_10px_var(--glow)]'
                            : 'bg-[var(--nav)]/40 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
                        }`}
                        style={{
                          backgroundColor: isSelected ? cat.color : undefined,
                        }}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <FiCheck size={12} className="ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSave}
                  className="w-full mt-5 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] text-sm"
                >
                  <FiSave size={14} /> Save Fandoms
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ PREFERENCES TAB ============ */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">

            {/* Dark Mode */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                  <FiMoon size={18} className="text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cream)]">Dark Mode</p>
                  <p className="text-xs text-[var(--muted)]">Use dark theme across the app</p>
                </div>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, darkMode: !preferences.darkMode })}
                className={`w-12 h-6 rounded-full transition relative ${
                  preferences.darkMode ? 'bg-[var(--primary)]' : 'bg-[var(--nav)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                    preferences.darkMode ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Font Size */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--yellow)]/20 flex items-center justify-center">
                  <FiType size={18} className="text-[var(--yellow)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cream)]">Font Size</p>
                  <p className="text-xs text-[var(--muted)]">Adjust text size for readability</p>
                </div>
              </div>
              <div className="flex gap-2">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPreferences({ ...preferences, fontSize: size })}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition capitalize ${
                      preferences.fontSize === size
                        ? 'bg-[var(--primary)] text-[var(--cream)]'
                        : 'bg-[var(--nav)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Notifications */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                  <FiMail size={18} className="text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cream)]">Email Notifications</p>
                  <p className="text-xs text-[var(--muted)]">Get updates about your submissions</p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    emailNotifications: !preferences.emailNotifications,
                  })
                }
                className={`w-12 h-6 rounded-full transition relative ${
                  preferences.emailNotifications ? 'bg-[var(--primary)]' : 'bg-[var(--nav)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                    preferences.emailNotifications ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Public Profile */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                  <FiGlobe size={18} className="text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cream)]">Public Profile</p>
                  <p className="text-xs text-[var(--muted)]">Let others see your profile</p>
                </div>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, publicProfile: !preferences.publicProfile })}
                className={`w-12 h-6 rounded-full transition relative ${
                  preferences.publicProfile ? 'bg-[var(--primary)]' : 'bg-[var(--nav)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                    preferences.publicProfile ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] text-sm mt-4"
            >
              <FiSave size={14} /> Save Preferences
            </button>
          </div>
        )}

        {/* ============ ACCOUNT TAB ============ */}
        {activeTab === 'account' && (
          <div className="space-y-4">

            {/* Change Password */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                  <FiShield size={18} className="text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cream)]">Password</p>
                  <p className="text-xs text-[var(--muted)]">Keep your account secure</p>
                </div>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-xs text-[var(--primary)] hover:text-[var(--yellow)] font-semibold transition"
              >
                Change Password →
              </Link>
            </div>

            {/* Logout */}
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-md p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <FiLogOut size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--cream)]">Logout</p>
                  <p className="text-xs text-[var(--muted)]">Sign out from your account</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full bg-red-500/80 text-[var(--cream)] font-semibold hover:bg-red-500 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;