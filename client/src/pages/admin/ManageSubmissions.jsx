import { useState, useEffect, useMemo } from 'react';
import { FiCheck, FiX, FiEye, FiFileText, FiSearch } from 'react-icons/fi';
import AdminShell from '../../components/admin/AdminShell';
import mariaApi from '../../services/mariaApi';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B' },
  approved: { label: 'Approved', color: '#10B981' },
  rejected: { label: 'Rejected', color: '#EF4444' },
  published: { label: 'Published', color: '#06B6D4' },
};

const ManageSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await mariaApi.get('/submissions');
      setSubmissions(data.submissions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleAction = async (id, status) => {
    try {
      await mariaApi.patch(`/submissions/${id}`, { status });
      fetchSubmissions();
    } catch (err) { console.error(err); }
  };

  const filtered = useMemo(() => {
    let subs = [...submissions];
    if (filterStatus !== 'all') subs = subs.filter((s) => s.status === filterStatus);
    if (searchQuery.trim()) subs = subs.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return subs;
  }, [submissions, filterStatus, searchQuery]);

  return (
    <AdminShell title="Manage Submissions" subtitle="Maria's fan-submitted content review queue.">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <FiFileText className="text-[var(--primary)]" />
          <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">Manage Submissions</h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search submissions..."
              className="w-full rounded-full bg-[var(--nav)] border border-[var(--border)] pl-11 pr-4 py-2.5 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)]" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'pending', 'approved', 'published', 'rejected'].map((status) => (
              <button key={status} onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${filterStatus === status ? 'bg-[var(--primary)] text-[var(--cream)]' : 'bg-[var(--surface)]/60 text-[var(--muted)] border border-[var(--border)]'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-[var(--muted)] py-10">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-10">No submissions found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((sub) => {
              const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
              return (
                <div key={sub._id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">by {sub.userId?.name || 'User'}</span>
                  </div>
                  <h3 className="font-orbitron text-base font-bold text-[var(--cream)] mb-1">{sub.title}</h3>
                  <p className="text-xs text-[var(--muted)] mb-4">Category: {sub.category}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--border)]">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--nav)]/60 text-[var(--muted)] border border-[var(--border)]">
                      <FiEye size={12} /> View
                    </button>
                    {sub.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(sub._id, 'approved')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-500/20 text-green-300 hover:bg-green-500/30">
                          <FiCheck size={12} /> Approve
                        </button>
                        <button onClick={() => handleAction(sub._id, 'rejected')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30">
                          <FiX size={12} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default ManageSubmissions;
