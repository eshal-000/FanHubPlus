import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowLeft,
  FiAlertCircle,
} from 'react-icons/fi';
import animeBg from '../../assets/anime-bg.jpg';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.password) return 'Please enter a new password.';
    if (form.password.length < 6)
      return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset/${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: form.password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setSuccess('Password reset successfully! Redirecting to login... 🎉');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If token is invalid
  if (!tokenValid) {
    return (
      <main className="h-screen w-full bg-[var(--bg)] flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-md rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md shadow-[0_0_30px_var(--glow)] p-8 text-center">
          <FiAlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h1 className="font-orbitron text-2xl font-extrabold text-[var(--cream)] mb-2">
            Invalid Link
          </h1>
          <p className="text-[var(--muted)] text-sm mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] text-[var(--cream)] font-semibold px-6 py-2.5 hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] text-sm"
          >
            Request New Link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-[var(--bg)] flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-5xl h-[90vh] max-h-[640px] grid md:grid-cols-2 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md shadow-[0_0_30px_var(--glow)]">

        {/* LEFT — Anime Image */}
        <div className="hidden md:block relative overflow-hidden">
          <img
            src={animeBg}
            alt="Anime themed artwork"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/30 via-transparent to-[var(--bg)]/50" />
        </div>

        {/* RIGHT — Form */}
        <div className="p-6 md:p-8 bg-[var(--nav)]/60 flex flex-col justify-center overflow-hidden">

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-orbitron text-2xl md:text-3xl font-extrabold text-[var(--cream)]">
              Reset Password
            </h1>
            <p className="text-[var(--muted)] mt-1 text-xs md:text-sm">
              Set a new password for your account 🔐
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs px-3 py-2">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-3 rounded-lg border border-green-500/40 bg-green-500/10 text-green-300 text-xs px-3 py-2">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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
                Confirm New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--primary)] text-[var(--cream)] font-semibold py-2.5 hover:bg-[var(--raspberry)] transition shadow-[0_0_20px_var(--glow)] disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[var(--cream)] border-t-transparent rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <FiCheckCircle /> Reset Password
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <Link
            to="/login"
            className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--yellow)] transition"
          >
            <FiArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;