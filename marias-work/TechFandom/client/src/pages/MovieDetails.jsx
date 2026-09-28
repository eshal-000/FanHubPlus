import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  FiArrowLeft,
  FiStar,
  FiClock,
  FiCalendar,
  FiGlobe,
  FiFilm,
  FiUser,
  FiUsers,
  FiPlay,
  FiChevronRight,
  FiHome,
} from 'react-icons/fi';
import { getMovieBySlug, getRelatedMovies } from '../data/movies';

// ============================================
// PLACEHOLDER (colored circle with initial)
// ============================================
const Placeholder = ({ name, size = 'md', color }) => {
  const dims =
    size === 'lg' ? 'w-24 h-24 text-3xl' : size === 'md' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-lg';
  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center font-orbitron font-black shrink-0`}
      style={{
        backgroundColor: `${color}25`,
        color: color,
        border: `2px solid ${color}60`,
      }}
    >
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const movie = getMovieBySlug(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4">
        <p className="font-orbitron text-[var(--cream)] text-xl mb-4">Movie not found</p>
        <button
          onClick={() => navigate('/explore/movies')}
          className="px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold text-sm"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  const related = getRelatedMovies(movie);

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden border-b border-[var(--border)]"
        style={{
          background: `linear-gradient(135deg, ${movie.color}18 0%, var(--bg) 55%, var(--bg) 100%)`,
        }}
      >
        {/* Mesh blobs */}
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ backgroundColor: movie.color }}
        />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[var(--primary)] opacity-10 blur-[120px] pointer-events-none" />

        {/* Back + Breadcrumb */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 pt-6">
          <button
            onClick={() => navigate('/explore/movies')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] text-sm hover:border-[var(--primary)]/60 transition"
          >
            <FiArrowLeft size={14} /> Back
          </button>

          <div className="hidden md:flex items-center gap-1.5 mt-4 text-[10px] uppercase tracking-widest text-[var(--muted)]">
            <Link to="/explore" className="hover:text-[var(--cream)] transition flex items-center gap-1">
              <FiHome size={10} /> Explore
            </Link>
            <FiChevronRight size={10} />
            <Link to="/explore/movies" className="hover:text-[var(--cream)] transition">
              Movies
            </Link>
            <FiChevronRight size={10} />
            <span className="text-[var(--cream)]">{movie.title}</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-14 grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-8 md:gap-10">
          {/* Poster */}
          <div className="relative">
            <div
              className="aspect-[2/3] w-[200px] md:w-full mx-auto rounded-2xl overflow-hidden border-2"
              style={{
                borderColor: `${movie.color}40`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${movie.color}25`,
              }}
            >
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
                  style={{
                    background: `linear-gradient(135deg, ${movie.color}30 0%, var(--surface) 100%)`,
                  }}
                >
                  <FiFilm size={40} style={{ color: movie.color }} />
                  <p className="font-orbitron text-xs uppercase tracking-widest text-[var(--muted)] mt-3">
                    Poster Coming Soon
                  </p>
                  <p className="font-orbitron text-sm font-bold text-[var(--cream)] mt-2 leading-tight">
                    {movie.title}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0">
            {/* Category badge */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
              style={{
                backgroundColor: `${movie.color}25`,
                color: movie.color,
                border: `1px solid ${movie.color}60`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: movie.color }} />
              Movie
            </span>

            <h1 className="font-orbitron text-3xl md:text-4xl lg:text-5xl font-black text-[var(--cream)] leading-tight mt-3">
              {movie.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <FiCalendar size={13} style={{ color: movie.color }} />
                {movie.releaseYear}
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock size={13} style={{ color: movie.color }} />
                {movie.runtime}
              </span>
              <span className="flex items-center gap-1.5">
                <FiGlobe size={13} style={{ color: movie.color }} />
                {movie.country}
              </span>
              <span className="flex items-center gap-1.5">
                <FiFilm size={13} style={{ color: movie.color }} />
                {movie.language}
              </span>
            </div>

            {/* Genre chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[var(--surface)]/60 border border-[var(--border)] text-[var(--muted)]"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Trailer button (hidden if no approved URL) */}
            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-orbitron font-bold text-sm uppercase tracking-wider hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)]"
              >
                <FiPlay size={14} fill="currentColor" /> Watch Trailer
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT — 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div>
              <h2 className="font-orbitron text-xl font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full" style={{ backgroundColor: movie.color }} />
                Synopsis
              </h2>
              <p className="text-[var(--muted)] leading-[1.85] text-[15px]">
                {movie.synopsis}
              </p>
            </div>

            {/* Director */}
            <div>
              <h2 className="font-orbitron text-xl font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                <FiUser className="text-[var(--primary)]" size={18} />
                Director
              </h2>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md">
                {movie.directorPhoto ? (
                  <img
                    src={movie.directorPhoto}
                    alt={movie.director}
                    className="w-16 h-16 rounded-full object-cover border-2"
                    style={{ borderColor: `${movie.color}60` }}
                  />
                ) : (
                  <Placeholder name={movie.director} color={movie.color} />
                )}
                <div>
                  <p className="font-orbitron text-base font-bold text-[var(--cream)]">
                    {movie.director}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Director</p>
                </div>
              </div>
            </div>

            {/* Cast */}
            {movie.cast?.length > 0 && (
              <div>
                <h2 className="font-orbitron text-xl font-bold text-[var(--cream)] mb-4 flex items-center gap-2">
                  <FiUsers className="text-[var(--primary)]" size={18} />
                  Main Cast
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {movie.cast.map((member, i) => (
                    <div
                      key={i}
                      className="text-center p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md hover:border-[var(--primary)]/50 transition"
                    >
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto border-2"
                          style={{ borderColor: `${movie.color}60` }}
                        />
                      ) : (
                        <div className="flex justify-center">
                          <Placeholder name={member.name} color={movie.color} />
                        </div>
                      )}
                      <p className="font-semibold text-sm text-[var(--cream)] mt-3 leading-tight">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-[var(--muted)] mt-1 leading-tight">
                        as {member.characterName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
              <h3 className="font-orbitron text-base font-bold text-[var(--cream)] mb-5">
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Country</span>
                  <span className="text-[var(--cream)] font-semibold">{movie.country}</span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Release Year</span>
                  <span className="text-[var(--cream)] font-semibold">{movie.releaseYear}</span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Runtime</span>
                  <span className="text-[var(--cream)] font-semibold">{movie.runtime}</span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Language</span>
                  <span className="text-[var(--cream)] font-semibold">{movie.language}</span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Genre</span>
                  <span className="text-[var(--cream)] font-semibold text-right">
                    {movie.genres.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Movies */}
            {related.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-6">
                <h3 className="font-orbitron text-base font-bold text-[var(--cream)] mb-5">
                  You Might Also Like
                </h3>
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/movies/${r.slug}`}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--nav)]/40 hover:border-[var(--primary)]/60 transition"
                    >
                      <div
                        className="w-12 h-16 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${r.color}40 0%, var(--surface) 100%)`,
                        }}
                      >
                        <FiFilm size={16} style={{ color: r.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[var(--cream)] truncate group-hover:text-[var(--primary)] transition">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                          {r.releaseYear} · {r.country}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              to="/explore/movies"
              className="block text-center px-6 py-3 rounded-full border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md text-[var(--cream)] text-sm font-semibold hover:border-[var(--primary)]/60 transition"
            >
              ← Browse All Movies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MovieDetails;