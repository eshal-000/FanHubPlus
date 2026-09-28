import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiClock,
  FiCheck,
  FiX,
  FiFileText,
  FiSend,
  FiFilter,
  FiSliders,
  FiTrendingUp,
  FiBarChart2,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';
import mariaApi from '../services/mariaApi';



const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: '#F59E0B', icon: FiClock, step: 1 },
  approved: { label: 'Approved', color: '#10B981', icon: FiCheck, step: 2 },
  published: { label: 'Published', color: '#06B6D4', icon: FiTrendingUp, step: 3 },
  rejected: { label: 'Rejected', color: '#EF4444', icon: FiX, step: 2 },
};



const MySubmissions = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await mariaApi.get('/submissions/mine');
        if (mounted) setSubmissions(data.submissions || []);
      } catch (err) {
        console.error('Load submissions error:', err);
        if (mounted) setError('Could not load submissions. Please sign in and try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadSubmissions();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredSubmissions = useMemo(() => {
    let subs = [...submissions];
    if (filterStatus !== 'all') subs = subs.filter((s) => s.status === filterStatus);
    if (sortBy === 'latest') subs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') subs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'az') subs.sort((a, b) => a.title.localeCompare(b.title));
    return subs;
  }, [submissions, filterStatus, sortBy]);

  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    published: submissions.filter((s) => s.status === 'published').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }), [submissions]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ProgressTracker = ({ status }) => {
    const steps = [
      { id: 1, label: 'Submitted' },
      { id: 2, label: 'Under Review' },
      { id: 3, label: 'Approved/Rejected' },
      { id: 4, label: 'Published' },
    ];

    const currentStatus = STATUS_CONFIG[status];
    const currentStep = currentStatus.step;
    const isRejected = status === 'rejected';

    return (
      <div className="flex items-center gap-1 mt-4">
        {steps.map((step, i) => {
          const isActive = step.id <= currentStep;
          const isCurrent = step.id === currentStep;
          const stepColor = isRejected && step.id >= 3 ? '#EF4444' : currentStatus.color;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                    isActive ? 'text-white' : 'text-[var(--muted)]'
                  }`}
                  style={{
                    backgroundColor: isActive ? stepColor : 'var(--nav)',
                    boxShadow: isCurrent ? `0 0 15px ${stepColor}` : 'none',
                  }}
                >
                  {isActive ? <FiCheck size={12} /> : step.id}
                </div>
                <span
                  className={`text-[9px] mt-1 text-center whitespace-nowrap ${
                    isCurrent ? 'text-[var(--cream)] font-semibold' : 'text-[var(--muted)]'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: step.id < currentStep ? stepColor : 'var(--border)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">

      
      <section className="relative overflow-hidden pt-12 pb-10 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-[var(--primary)] opacity-20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-[var(--raspberry)] opacity-15 blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] hover:border-[var(--primary)] transition text-sm mb-5"
              >
                <FiArrowLeft size={14} /> Back
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/50 bg-[var(--surface)]/60 backdrop-blur-sm px-3 py-1 mb-4">
                <FiFileText className="text-[var(--yellow)]" size={12} />
                <span className="text-[10px] tracking-widest uppercase text-[var(--yellow)] font-semibold">
                  Your Content Dashboard
                </span>
              </div>

              <h1 className="font-orbitron text-4xl md:text-5xl font-black text-[var(--cream)] leading-tight">
                My Submissions
              </h1>
              <p className="text-[var(--muted)] mt-3 max-w-xl text-sm md:text-base">
                Track the status of your submitted content — from review to publication.
              </p>
            </div>

            <Link
              to="/submit-content"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)] text-sm shrink-0"
            >
              <FiSend size={14} /> New Submission
            </Link>
          </div>

          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Total', value: stats.total, color: '#FF006B', Icon: FiBarChart2 },
              { label: 'Pending', value: stats.pending, color: '#F59E0B', Icon: FiClock },
              { label: 'Published', value: stats.published, color: '#06B6D4', Icon: FiTrendingUp },
              { label: 'Rejected', value: stats.rejected, color: '#EF4444', Icon: FiXCircle },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.Icon size={16} style={{ color: stat.color }} />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    {stat.label}
                  </span>
                </div>
                <p className="font-orbitron text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {submissions.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mb-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-2 text-[var(--muted)] text-xs mr-2 shrink-0">
                <FiFilter size={14} /> Filter:
              </div>

              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'published', label: 'Published' },
                { id: 'rejected', label: 'Rejected' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    filterStatus === tab.id
                      ? 'bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_10px_var(--glow)]'
                      : 'bg-[var(--surface)]/60 text-[var(--muted)] hover:text-[var(--cream)] border border-[var(--border)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 text-[var(--muted)] text-xs">
                <FiSliders size={14} /> Sort:
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg bg-[var(--nav)] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--cream)] outline-none focus:border-[var(--primary)] transition cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A → Z</option>
              </select>
            </div>
          </div>
        </section>
      )}

      
      <section className="max-w-6xl mx-auto px-4 pb-20 relative z-10">
        {loading ? (
          <div className="text-center py-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <p className="text-[var(--muted)] text-sm">Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <FiXCircle size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--muted)] text-sm">{error}</p>
          </div>
        ) : submissions.length === 0 ? (
          
          <div className="text-center py-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <div className="w-20 h-20 rounded-full bg-[var(--primary)]/20 flex items-center justify-center mx-auto mb-6">
              <FiFileText size={36} className="text-[var(--primary)]" />
            </div>
            <h3 className="font-orbitron text-2xl font-bold text-[var(--cream)]">
              No Submissions Yet
            </h3>
            <p className="text-[var(--muted)] text-sm mt-3 max-w-md mx-auto leading-relaxed">
              You haven't submitted any content yet. Share your fan stories, reviews, or articles with the community!
            </p>
            <Link
              to="/submit-content"
              className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition shadow-[0_0_25px_var(--glow)] text-sm"
            >
              <FiSend size={14} /> Submit Your First Content
            </Link>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40">
            <FiXCircle size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--muted)] text-sm">
              No {filterStatus} submissions found.
            </p>
            <button
              onClick={() => setFilterStatus('all')}
              className="mt-4 text-[var(--primary)] text-xs font-semibold hover:text-[var(--yellow)] transition"
            >
              Show all
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredSubmissions.map((sub) => {
              const config = STATUS_CONFIG[sub.status];
              const StatusIcon = config.icon;
              const category = CATEGORIES.find((item) => item.slug === sub.category);

              return (
                <div
                  key={sub._id || sub.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md overflow-hidden hover:border-[var(--primary)]/40 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5 p-5">

                    <div className="relative h-40 md:h-full rounded-xl overflow-hidden">
                      <img
                        src={sub.imageUrl}
                        alt={sub.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                          style={{
                            backgroundColor: `${config.color}30`,
                            color: config.color,
                            border: `1px solid ${config.color}60`,
                          }}
                        >
                          <StatusIcon size={10} />
                          {config.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {category && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                                border: `1px solid ${category.color}40`,
                              }}
                            >
                              {category.name}
                            </span>
                          )}
                          <span className="text-[10px] text-[var(--muted)]">
                            Fandom: {sub.fandom}
                          </span>
                        </div>

                        <h3 className="font-orbitron text-lg md:text-xl font-bold text-[var(--cream)] leading-tight">
                          {sub.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[var(--muted)]">
                          <span className="flex items-center gap-1">
                            <FiClock size={10} />
                            Submitted: {formatDate(sub.createdAt)}
                          </span>
                          {sub.reviewedAt && (
                            <span className="flex items-center gap-1">
                              <FiCheck size={10} />
                              Reviewed: {formatDate(sub.reviewedAt)}
                            </span>
                          )}
                        </div>

                        <ProgressTracker status={sub.status} />

                        {sub.adminNote && (
                          <div
                            className="mt-4 p-3 rounded-lg border-l-2 text-xs"
                            style={{
                              backgroundColor: `${config.color}10`,
                              borderColor: config.color,
                            }}
                          >
                            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                              Admin Note:
                            </p>
                            <p className="text-[var(--cream)]">{sub.adminNote}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border)]">
                        {sub.status === 'pending' && (
                          <div className="ml-auto text-xs text-[var(--muted)] italic flex items-center gap-1">
                            <FiClock size={12} /> Awaiting admin review...
                          </div>
                        )}
                        {sub.status === 'approved' && (
                          <div className="ml-auto text-xs font-semibold flex items-center gap-1" style={{ color: config.color }}>
                            <FiCheckCircle size={12} /> Will be published soon
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default MySubmissions;
