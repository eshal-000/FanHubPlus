import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUser, FiSearch, FiX } from 'react-icons/fi';
import { CATEGORIES } from '../../data/categories';
import AdminShell from '../../components/admin/AdminShell';
import mariaApi from '../../services/mariaApi';

const ManageCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', series: '', categorySlug: CATEGORIES[0].slug, imageUrl: '', bio: '', status: 'published' });

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const { data } = await mariaApi.get('/characters');
      setCharacters(data.characters);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCharacters(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await mariaApi.put(`/characters/${editing._id}`, form);
      else await mariaApi.post('/characters', form);
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', series: '', categorySlug: CATEGORIES[0].slug, imageUrl: '', bio: '', status: 'published' });
      fetchCharacters();
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this character?')) return;
    try { await mariaApi.delete(`/characters/${id}`); fetchCharacters(); } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, series: item.series || '', categorySlug: item.categorySlug, imageUrl: item.imageUrl || '', bio: item.bio || '', status: item.status });
    setShowModal(true);
  };

  const filtered = characters.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AdminShell title="Manage Characters" subtitle="Maria's character profiles and category mapping.">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiUser className="text-[var(--primary)]" />
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">Manage Characters</h1>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold text-sm">
            <FiPlus size={14} /> Add Character
          </button>
        </div>

        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search characters..."
            className="w-full rounded-full bg-[var(--nav)] border border-[var(--border)] pl-11 pr-4 py-2.5 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)]" />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--nav)]/60 border-b border-[var(--border)]">
              <tr>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Name</th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Series</th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Category</th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Status</th>
                <th className="text-right text-xs uppercase tracking-wider text-[var(--muted)] p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-[var(--muted)]">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-[var(--muted)]">No characters found</td></tr>
              ) : filtered.map((c) => {
                const cat = CATEGORIES.find((x) => x.slug === c.categorySlug);
                return (
                  <tr key={c._id} className="border-b border-[var(--border)] last:border-0">
                    <td className="p-4 text-sm text-[var(--cream)] font-semibold">{c.name}</td>
                    <td className="p-4 text-sm text-[var(--muted)]">{c.series}</td>
                    <td className="p-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: `${cat?.color || '#666'}20`, color: cat?.color || '#999' }}>
                        {cat?.name || c.categorySlug}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${c.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(c)} className="p-2 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 mr-1"><FiEdit size={14} /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><FiTrash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron text-xl text-[var(--cream)]">{editing ? 'Edit Character' : 'Add Character'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)]"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" />
              <input placeholder="Series" value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" />
              <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none">
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" />
              <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" rows="3" />
              <button type="submit" className="w-full py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold">
                {editing ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export default ManageCharacters;
