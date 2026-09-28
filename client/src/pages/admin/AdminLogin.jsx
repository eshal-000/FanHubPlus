import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const ADMIN_API = `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/auth/login`;

const pageAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(ADMIN_API, form);

      if (!data?.token) throw new Error("No token received from server");

      setSession({ token: data.token, user: data.user });

      const requestedPath = location.state?.from?.pathname?.startsWith("/admin")
        ? `${location.state.from.pathname}${location.state.from.search || ""}${location.state.from.hash || ""}`
        : "/admin";

      navigate(requestedPath, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-4 font-['Plus_Jakarta_Sans']">
      {}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[var(--primary)] opacity-25 blur-[120px]"
        animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[var(--raspberry)] opacity-25 blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.18, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        variants={pageAnim}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {}
        <div className="rounded-2xl border border-[var(--border)] bg-surface/40 p-8 shadow-[0_0_20px_var(--glow)] backdrop-blur-md sm:p-10">
          {}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-[0_0_20px_var(--glow)]"
            >
              <ShieldCheck className="h-8 w-8 text-[var(--cream)]" />
            </motion.div>
            <h1 className="font-['Orbitron'] text-2xl font-bold tracking-wider text-[var(--cream)]">
              FAN HUB <span className="text-[var(--primary)]">PLUS</span>
            </h1>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-[var(--muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--yellow)]" />
              Restricted Area — Admin Access Only
            </p>
          </div>

          {}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-[var(--cream)]"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--cream)]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@fanhubplus.io"
                value={form.email}
                onChange={handleChange}
                className="border-[var(--border)] bg-nav/60 text-[var(--cream)] placeholder:text-muted/50 focus-visible:ring-[var(--primary)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--cream)]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="border-[var(--border)] bg-nav/60 pr-10 text-[var(--cream)] placeholder:text-muted/50 focus-visible:ring-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-[var(--primary)] font-['Orbitron'] text-sm font-semibold tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition-all hover:bg-[var(--raspberry)] hover:shadow-[0_0_30px_var(--glow)] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AUTHENTICATING…
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  SECURE LOGIN
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--muted)]">
            <Lock className="h-3 w-3" />
            Sessions are secured with JWT · Unauthorized access is logged
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted/70">
          Not an admin?{" "}
          <Link to="/" className="text-[var(--primary)] underline-offset-2 hover:underline">
            Return to Fan Hub
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
