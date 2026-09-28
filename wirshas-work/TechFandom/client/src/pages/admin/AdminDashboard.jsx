import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Activity,
  BookOpen,
  CalendarDays,
  Gamepad2,
  Loader2,
  MessageSquareHeart,
  Popcorn,
  RefreshCw,
  Sparkles,
  Tv,
  Users,
  Wallet,
  TrendingUp,
  Clock,
  Award,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import AdminShell from "@/components/admin/AdminShell";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/stats`;

const AURA_MAP = {
  Gaming: { aura: "#00E5FF", icon: Gamepad2 },
  "K-Pop": { aura: "#FF4FD8", icon: Sparkles },
  Anime: { aura: "#A855F7", icon: Tv },
  Movies: { aura: "#FFB020", icon: Popcorn },
  Music: { aura: "#38BDF8", icon: Activity },
  Comics: { aura: "#FF3B3B", icon: BookOpen },
  Sports: { aura: "#22C55E", icon: TrophyIcon },
};

function TrophyIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function useFandomAura(trendingCategory) {
  const [auraColor, setAuraColor] = useState("#FF006B");
  useEffect(() => {
    if (!trendingCategory) return;
    setAuraColor(AURA_MAP[trendingCategory]?.aura || "#FF006B");
  }, [trendingCategory]);
  return auraColor;
}

function SparklineCard({ label, value, icon: Icon, tint, trend = 0 }) {
  const trendUp = trend >= 0;
  const sparkData = [
    { v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 7 }, { v: 9 }, { v: 12 },
  ];

  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }}>
      <Card className="group relative overflow-hidden border-[var(--border)] bg-surface/40 shadow-[0_0_20px_var(--glow)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
          style={{ backgroundColor: tint }}
        />

        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            {label}
          </CardTitle>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: `${tint}20`, border: `1px solid ${tint}40` }}
          >
            <Icon className="h-4 w-4" style={{ color: tint }} />
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="flex items-end justify-between gap-2">
            <p className="font-['Orbitron'] text-3xl font-bold">{value}</p>
            {trend !== 0 && (
              <span
                className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  trendUp
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                <TrendingUp className={`h-3 w-3 ${!trendUp && "rotate-180"}`} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>

          <div className="mt-3 h-10 opacity-60 transition-opacity group-hover:opacity-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tint} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={tint} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={tint}
                  strokeWidth={1.5}
                  fill={`url(#spark-${label})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TopFansLeaderboard({ fans }) {
  if (!fans?.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
        No fan activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fans.slice(0, 5).map((fan, i) => {
        const rankColors = ["#FFE347", "#C0C0C0", "#CD7F32", "#99004D", "#99004D"];
        return (
          <motion.div
            key={fan._id || i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-nav/40 p-3 backdrop-blur-md"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-['Orbitron'] text-xs font-bold"
              style={{
                backgroundColor: `${rankColors[i]}20`,
                border: `1px solid ${rankColors[i]}80`,
                color: rankColors[i],
              }}
            >
              #{i + 1}
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/20 text-xs font-bold text-[var(--primary)]">
              {(fan.name || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--cream)]">
                {fan.name || "Anonymous Fan"}
              </p>
              <p className="truncate text-[10px] uppercase tracking-wider text-[var(--muted)]">
                {fan.favoriteFandoms?.join(" · ") || "Multi-fandom"}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--yellow)]">
              <Award className="h-3 w-3" />
              <span className="font-bold">{fan.bookmarkCount || fan.points || 0}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ActivityPulse({ auraColor }) {
  const hours = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: Math.floor(Math.random() * 60) + 20,
      })),
    []
  );

  const peak = Math.max(...hours.map((h) => h.value));

  return (
    <div className="flex h-20 items-end gap-1">
      {hours.map((h, i) => {
        const height = (h.value / peak) * 100;
        const isPeak = h.value === peak;
        const isActive = h.hour >= 18 && h.hour <= 23;
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.6, delay: i * 0.02 }}
            className="group relative flex-1 rounded-t-sm"
            style={{
              backgroundColor: isPeak
                ? auraColor
                : isActive
                ? `${auraColor}66`
                : "rgba(255, 0, 107, 0.25)",
              boxShadow: isPeak ? `0 0 12px ${auraColor}` : "none",
            }}
          >
            <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--border)] bg-nav/90 px-1.5 py-0.5 text-[9px] font-bold text-[var(--cream)] opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
              {h.hour}:00 · {h.value}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function FandomMomentum({ categories, auraColor }) {
  if (!categories?.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
        No category data yet.
      </div>
    );
  }

  const maxCount = Math.max(...categories.map((c) => c.count || c.fans || 0));

  return (
    <div className="space-y-3">
      {categories.slice(0, 5).map((c, i) => {
        const name = c.category || c.name;
        const count = c.count || c.fans || 0;
        const pct = (count / maxCount) * 100;
        const meta = AURA_MAP[name] || { aura: auraColor };
        const Icon = AURA_MAP[name]?.icon || Sparkles;

        return (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group"
          >
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" style={{ color: meta.aura }} />
                <span className="font-['Orbitron'] text-xs font-bold tracking-wider text-[var(--cream)]">
                  {name.toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-bold text-[var(--muted)]">{count}</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-[var(--surface-light)]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
                style={{
                  background: `linear-gradient(to right, ${meta.aura}, ${meta.aura}80)`,
                  boxShadow: `0 0 12px ${meta.aura}66`,
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const { data } = await axios.get(API, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const trendingCategory =
    stats?.trendingCategory || stats?.popularCategories?.[0]?.category || "";
  const auraColor = useFandomAura(trendingCategory);
  const AuraIcon = AURA_MAP[trendingCategory]?.icon || Sparkles;

  const categoryData = useMemo(
    () =>
      (stats?.popularCategories || []).map((c) => ({
        name: c.category || c.name,
        fans: c.count || c.fans || 0,
      })),
    [stats]
  );

  const activeUsersData = useMemo(() => stats?.activeUsers || [], [stats]);

  const statCards = [
    {
      label: "Active Users",
      value: stats?.activeUsersCount ?? stats?.totalUsers ?? "—",
      icon: Users,
      tint: "#00E5FF",
      trend: 12,
    },
    {
      label: "Total Content",
      value: stats?.totalContent ?? "—",
      icon: BookOpen,
      tint: "#A855F7",
      trend: 8,
    },
    {
      label: "Upcoming Events",
      value: stats?.upcomingEvents ?? "—",
      icon: CalendarDays,
      tint: "#FFE347",
      trend: -3,
    },
    {
      label: "Feedback Queue",
      value: stats?.pendingFeedback ?? "—",
      icon: MessageSquareHeart,
      tint: "#FF006B",
      trend: 5,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--muted)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="text-sm">Summoning fandom statistics…</p>
      </div>
    );
  }

  return (
    <AdminShell>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 h-[28rem] w-[28rem] rounded-full blur-[140px]"
        animate={{
          backgroundColor: auraColor,
          opacity: [0.16, 0.28, 0.16],
          scale: [1, 1.15, 1],
        }}
        transition={{
          backgroundColor: { duration: 1.2, ease: "easeInOut" },
          opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 right-0 h-[26rem] w-[26rem] rounded-full bg-[var(--raspberry)] blur-[140px]"
        animate={{ opacity: [0.2, 0.32, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="font-['Orbitron'] text-2xl font-bold tracking-wide sm:text-3xl">
              ADMIN <span className="text-[var(--primary)]">DASHBOARD</span>
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
              <motion.span
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-surface/40 px-2.5 py-0.5 text-xs backdrop-blur-md"
                animate={{
                  boxShadow: [
                    `0 0 8px ${auraColor}66`,
                    `0 0 18px ${auraColor}99`,
                    `0 0 8px ${auraColor}66`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <AuraIcon className="h-3.5 w-3.5" style={{ color: auraColor }} />
                Fandom Aura · {trendingCategory || "Warming up"}
              </motion.span>
              The hub is currently vibing with{" "}
              <span className="font-semibold" style={{ color: auraColor }}>
                {trendingCategory || "the fandom"}
              </span>
            </p>
          </div>
          <Button
            onClick={fetchStats}
            variant="outline"
            className="border-[var(--border)] bg-surface/40 text-[var(--cream)] backdrop-blur-md hover:bg-[var(--surface-light)] hover:text-[var(--cream)]"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
            {error}{" "}
            <button onClick={fetchStats} className="font-semibold text-[var(--primary)] underline">
              Retry
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <SparklineCard {...s} />
            </motion.div>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="h-full border-[var(--border)] bg-surface/40 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-['Orbitron'] text-sm tracking-wider text-[var(--cream)]">
                  <Zap className="h-4 w-4 text-[var(--yellow)]" />
                  ACTIVITY PULSE — 24H
                </CardTitle>
                <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  hourly
                </span>
              </CardHeader>
              <CardContent>
                <ActivityPulse auraColor={auraColor} />
                <div className="mt-4 flex justify-between text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:00</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-[var(--border)] bg-surface/40 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-['Orbitron'] text-sm tracking-wider text-[var(--cream)]">
                  <Target className="h-4 w-4 text-[var(--primary)]" />
                  FANDOM MOMENTUM
                </CardTitle>
                <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  top 5
                </span>
              </CardHeader>
              <CardContent>
                <FandomMomentum categories={categoryData} auraColor={auraColor} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card className="h-full border-[var(--border)] bg-surface/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="font-['Orbitron'] text-sm tracking-wider text-[var(--cream)]">
                  ACTIVE USERS — LAST 7 DAYS
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {activeUsersData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                    No activity data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeUsersData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="auraUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={auraColor} stopOpacity={0.65} />
                          <stop offset="100%" stopColor={auraColor} stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,243,222,0.08)" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fill: "#D6B9CA", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#D6B9CA", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#390B2B",
                          border: "1px solid rgba(255,243,222,0.13)",
                          borderRadius: "0.75rem",
                          color: "#FFF3DE",
                        }}
                        labelStyle={{ color: "#FFE347" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke={auraColor}
                        strokeWidth={2.5}
                        fill="url(#auraUsers)"
                        animationDuration={900}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full border-[var(--border)] bg-surface/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="font-['Orbitron'] text-sm tracking-wider text-[var(--cream)]">
                  POPULAR CATEGORIES
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {categoryData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                    No category data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,243,222,0.08)" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#D6B9CA", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-18}
                        textAnchor="end"
                        height={48}
                      />
                      <YAxis tick={{ fill: "#D6B9CA", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(255,0,107,0.08)" }}
                        contentStyle={{
                          backgroundColor: "#390B2B",
                          border: "1px solid rgba(255,243,222,0.13)",
                          borderRadius: "0.75rem",
                          color: "#FFF3DE",
                        }}
                        labelStyle={{ color: "#FFE347" }}
                      />
                      <Bar dataKey="fans" radius={[8, 8, 0, 0]} animationDuration={900}>
                        {categoryData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={i === 0 ? auraColor : "#99004D"}
                            stroke={i === 0 ? auraColor : "none"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8"
        >
          <Card className="border-[var(--border)] bg-surface/40 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-['Orbitron'] text-sm tracking-wider text-[var(--cream)]">
                <Award className="h-4 w-4 text-[var(--yellow)]" />
                TOP FANS LEADERBOARD
              </CardTitle>
              <Link
                to="/admin/users"
                className="text-[10px] font-semibold uppercase tracking-widest text-[var(--primary)] underline hover:text-[var(--yellow)]"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <TopFansLeaderboard fans={stats?.topFans || []} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {[
            { to: "/admin/characters", label: "Characters" },
            { to: "/admin/articles", label: "Articles" },
            { to: "/admin/events", label: "Events" },
            { to: "/admin/releases", label: "Releases" },
            { to: "/admin/merch", label: "Merch" },
            { to: "/admin/users", label: "Users" },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group rounded-xl border border-[var(--border)] bg-surface/40 px-4 py-3 text-center text-sm backdrop-blur-md transition-all hover:border-primary/50 hover:bg-surface-light/60 hover:shadow-[0_0_20px_var(--glow)]"
            >
              <span className="font-['Orbitron'] text-xs tracking-wider text-[var(--cream)] group-hover:text-[var(--yellow)]">
                {q.label.toUpperCase()}
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </AdminShell>
  );
}