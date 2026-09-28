import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiFileText, FiSearch, FiX } from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';

const ManageArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', author: 'Fan Hub Plus', categorySlug: CATEGORIES[0].slug, excerpt: '', body: '', imageUrl: '', status: 'published' });

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/articles');
      setArticles(data.articles);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await axios.put(`/api/articles/${editing._id}`, form);
      else await axios.post('/api/articles', form);
      setShowModal(false); setEditing(null);
      setForm({ title: '', author: 'Fan Hub Plus', categorySlug: CATEGORIES[0].slug, excerpt: '', body: '', imageUrl: '', status: 'published' });
      fetchArticles();
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    try { await axios.delete(`/api/articles/${id}`); fetchArticles(); } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, author: item.author, categorySlug: item.categorySlug, excerpt: item.excerpt || '', body: item.body || '', imageUrl: item.imageUrl || '', status: item.status });
    setShowModal(true);
  };

  const filtered = articles.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 border border-[var(--border)] text-[var(--cream)] text-sm mb-6">
          <FiArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiFileText className="text-[var(--primary)]" />
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-[var(--cream)]">Manage Articles</h1>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold text-sm">
            <FiPlus size={14} /> Add Article
          </button>
        </div>

        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search articles..."
            className="w-full rounded-full bg-[var(--nav)] border border-[var(--border)] pl-11 pr-4 py-2.5 text-sm text-[var(--cream)] outline-none focus:border-[var(--primary)]" />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--nav)]/60 border-b border-[var(--border)]">
              <tr>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Title</th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Author</th>
                <th className="text-left text-xs uppercase tracking-wider text-[var(--muted)] p-4">Status</th>
                <th className="text-right text-xs uppercase tracking-wider text-[var(--muted)] p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-[var(--muted)]">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-[var(--muted)]">No articles found</td></tr>
              ) : filtered.map((a) => (
                <tr key={a._id} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-4 text-sm text-[var(--cream)]">{a.title}</td>
                  <td className="p-4 text-sm text-[var(--muted)]">{a.author}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${a.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{a.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(a)} className="p-2 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 mr-1"><FiEdit size={14} /></button>
                    <button onClick={() => handleDelete(a._id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><FiTrash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron text-xl text-[var(--cream)]">{editing ? 'Edit Article' : 'Add Article'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)]"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" />
              <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" />
              <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none">
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" />
              <textarea placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" rows="2" />
              <textarea placeholder="Body (use ## for headings)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full rounded-lg bg-[var(--nav)] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--cream)] outline-none" rows="8" />
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

export default ManageArticles;