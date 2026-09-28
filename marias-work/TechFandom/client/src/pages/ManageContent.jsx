import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiSearch, FiGrid, FiX } from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';

const ManageContent = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'article', categorySlug: CATEGORIES[0].slug, description: '', imageUrl: '', status: 'published' });

  const fetchContents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/contents');
      setContents(data.contents);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/contents/${editing._id}`, form);
      } else {
        await axios.post('/api/contents', form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ title: '', type: 'article', categorySlug: CATEGORIES[0].slug, description: '', imageUrl: '', status: 'published' });
      fetchContents();
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content?')) return;
    try {
      await axios.delete(`/api/contents/${id}`);
      fetchContents();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      type: item.type,
      categorySlug: item.categorySlug,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      status: item.status,
    });
    setShowModal(true);
  };

  const filtered = contents.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 border border-[var(--border)] text-[var(--cream)] text-sm mb-6">
          <FiArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiGrid className="text-[var(--primary)]" />
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">Manage Content</h1>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold text-sm">
            <FiPlus size={14} /> Add Content
          </button>
        </div>

        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search content..."
            className="w-full rounded-full bg-[var(--nav)] border border-[var(--border)] pl-11 pr-4 py-2.5 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)]" />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--nav)]/60 border-b border-[var(--border)]">
              <tr>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Title</th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Category</th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Type</th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Status</th>
                <th className="text-right text-xs uppercase tracking-wider text-[var(--muted)] p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-[var(--muted)]">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-[var(--muted)]">No content found</td></tr>
              ) : filtered.map((item) => {
                const cat = CATEGORIES.find((c) => c.slug === item.categorySlug);
                return (
                  <tr key={item._id} className="border-b border-[var(--border)] last:border-0">
                    <td className="p-4 text-sm text-[var(--cream)]">{item.title}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: `${cat?.color || '#666'}20`, color: cat?.color || '#999' }}>
                        {cat?.name || item.categorySlug}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--muted)]">{item.type}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${item.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition mr-1">
                        <FiEdit size={14} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition">
                        <FiTrash2 size={14} />
                      </button>
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
              <h2 className="font-orbitron text-xl text-[var(--cream)]">{editing ? 'Edit Content' : 'Add Content'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)]"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)]" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none">
                {['article', 'video', 'audio', 'image', 'gallery', 'review', 'news'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none">
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" rows="3" />
              <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <button type="submit" className="w-full py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold">
                {editing ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageContent;