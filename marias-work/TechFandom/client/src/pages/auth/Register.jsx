import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from 'react-icons/fi';
import animeBg from '../../assets/anime-bg.jpg';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    if (!agree) return 'Please accept the Terms & Conditions.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
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

        {/* LEFT — Anime Image (Aapki apni image) */}
        <div className="hidden md:block relative overflow-hidden">
          <img
            src={animeBg}
            alt="Anime themed artwork"
            className="w-full h-full object-cover"
          />
          {/* Pink overlay for theme match */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/30 via-transparent to-[var(--bg)]/50" />
        </div>

        {/* RIGHT — Form */}
        <div className="p-6 md:p-8 bg-[var(--nav)]/60 flex flex-col justify-center overflow-hidden">

          {/* Heading */}
          <div className="mb-5">
            <h1 className="font-orbitron text-2xl md:text-3xl font-extrabold text-[var(--cream)]">
              Create Account
            </h1>
            <p className="text-[var(--muted)] mt-1 text-xs md:text-sm">
              Join the fandom universe ✨
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Maria Khan"
                  className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] pl-9 pr-3 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/50 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)] transition"
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] pl-9 pr-10 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/50 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--yellow)] transition"
                >
                  {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 text-xs text-[var(--muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 accent-[var(--primary)]"
              />
              <span>
                I agree to the{' '}
                <span className="text-[var(--yellow)] hover:underline cursor-pointer">
                  Terms
                </span>{' '}
                &{' '}
                <span className="text-[var(--yellow)] hover:underline cursor-pointer">
                  Privacy
                </span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--primary)] text-[var(--cream)] font-semibold py-2.5 hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[var(--cream)] border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FiCheckCircle /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--muted)] mt-4">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--primary)] font-semibold hover:text-[var(--yellow)] transition"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;