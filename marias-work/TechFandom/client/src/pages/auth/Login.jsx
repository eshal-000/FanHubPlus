import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
} from 'react-icons/fi';
import loginBg from '../../assets/login-hero-portrait.jpg';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: localStorage.getItem('fhp_remember') || '',
    password: '',
    rememberMe: !!localStorage.getItem('fhp_remember'),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const validate = () => {
    if (!form.email) return 'Please enter your email.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (!form.password) return 'Please enter your password.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      await login(form.email, form.password, form.rememberMe);
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-full bg-[var(--bg)] flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-5xl h-[90vh] max-h-[640px] grid md:grid-cols-2 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md shadow-[0_0_30px_var(--glow)]">

        {/* LEFT — Comic Theme Image */}
        <div className="hidden md:block relative overflow-hidden">
          <img
            src={loginBg}
            alt="Comic themed artwork"
            className="w-full h-full object-cover"
          />
          {/* Pink overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 via-transparent to-[var(--bg)]/40" />
        </div>

        {/* RIGHT — Form */}
        <div className="p-6 md:p-8 bg-[var(--nav)]/60 flex flex-col justify-center overflow-hidden">

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-orbitron text-2xl md:text-3xl font-extrabold text-[var(--cream)]">
              Welcome Back
            </h1>
            <p className="text-[var(--muted)] mt-1 text-xs md:text-sm">
              Continue your fandom journey ✨
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] pl-9 pr-3 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/50 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)] transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] pl-9 pr-10 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/50 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--yellow)] transition"
                >
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[var(--muted)] cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="accent-[var(--primary)]"
                />
                Remember Me
              </label>
              <Link
                to="/forgot-password"
                className="text-[var(--primary)] hover:text-[var(--yellow)] transition font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--primary)] text-[var(--cream)] font-semibold py-2.5 hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[var(--cream)] border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <FiLogIn /> Log In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--muted)] mt-5">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[var(--primary)] font-semibold hover:text-[var(--yellow)] transition"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;