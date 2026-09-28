import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import animeBg from '../../assets/anime-bg.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) return 'Please enter your email.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email.';
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
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      setSuccess('Reset link sent! Check your email inbox. 📧');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              Forgot Password?
            </h1>
            <p className="text-[var(--muted)] mt-1 text-xs md:text-sm">
              No worries! We'll send you a reset link 🔐
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] pl-9 pr-3 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/50 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)] transition"
                />
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
                  Sending link...
                </>
              ) : (
                <>
                  <FiSend /> Send Reset Link
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

export default ForgotPassword;