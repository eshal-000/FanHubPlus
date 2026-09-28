import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUpload,
  FiImage,
  FiCheck,
  FiAlertCircle,
  FiSend,
  FiType,
  FiTag,
  FiAlignLeft,
  FiX,
} from 'react-icons/fi';
import { CATEGORIES } from '../data/categories';

const SubmitContent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: '',
    fandom: '',
    body: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image must be under 5MB' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Only image files allowed' });
      return;
    }

    setImageFile(file);
    setErrors({ ...errors, image: '' });

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    else if (form.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!form.category) newErrors.category = 'Please select a category';
    if (!form.fandom.trim()) newErrors.fandom = 'Fandom name is required';
    if (!form.body.trim()) newErrors.body = 'Content body is required';
    else if (form.body.length < 50) newErrors.body = 'Content must be at least 50 characters';
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowAlert(true);
      return;
    }

    setLoading(true);
    setShowAlert(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const categoryObj = CATEGORIES.find((c) => c.slug === form.category);

      const newSubmission = {
        id: Date.now(),
        title: form.title,
        category: categoryObj,
        fandom: form.fandom,
        body: form.body,
        imageUrl: imagePreview || 'https://picsum.photos/seed/submission/600/400',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        adminNote: null,
        views: 0,
        likes: 0,
      };

      const existing = JSON.parse(localStorage.getItem('fhp_submissions') || '[]');
      const updated = [newSubmission, ...existing];
      localStorage.setItem('fhp_submissions', JSON.stringify(updated));

      setSuccess(true);

      setTimeout(() => {
        navigate('/my-submissions');
      }, 2000);
    } catch (err) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoData = () => {
    setForm({
      title: 'Top 10 Anime Fight Scenes of All Time',
      category: 'anime',
      fandom: 'Jujutsu Kaisen',
      body: `Anime has given us some of the most iconic fight scenes in entertainment history.

## 1. Gojo vs Toji (Jujutsu Kaisen)
The Hidden Inventory arc delivered one of the most intense fights in modern anime.

## 2. Levi vs Beast Titan (Attack on Titan)
Captain Levi's aerial assault on the Beast Titan remains iconic.

## 3. Naruto vs Sasuke (Naruto Shippuden)
The final battle between two brothers, friends, and rivals.

## 4. Goku vs Frieza (Dragon Ball Z)
The first Super Saiyan transformation. A moment that changed anime forever.

## 5. Tanjiro vs Rui (Demon Slayer)
Ufotable's animation at its finest.`,
    });
    setErrors({});
  };

  const handleCloseAlert = () => setShowAlert(false);

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_var(--glow)]">
            <FiCheck size={40} className="text-[var(--cream)]" />
          </div>
          <h1 className="font-orbitron text-3xl font-bold text-[var(--cream)] mb-3">
            Submission Sent!
          </h1>
          <p className="text-[var(--muted)] text-sm mb-6">
            Your content has been submitted for review.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Redirecting to My Submissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] relative">

      {/* ALERT MODAL */}
      {showAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={handleCloseAlert}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border-2 border-red-500/50 bg-[var(--surface)] p-6 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseAlert}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--nav)] text-[var(--muted)] hover:text-[var(--cream)] flex items-center justify-center transition"
            >
              <FiX size={16} />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={32} className="text-red-400" />
            </div>

            <h2 className="font-orbitron text-xl font-bold text-[var(--cream)] text-center mb-2">
              Form Incomplete!
            </h2>
            <p className="text-[var(--muted)] text-sm text-center mb-5">
              Please fill all required fields before submitting.
            </p>

            <div className="space-y-2 mb-5">
              {Object.values(errors).filter(Boolean).map((error, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-red-300 bg-red-500/10 rounded-lg px-3 py-2"
                >
                  <FiAlertCircle size={12} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCloseAlert}
              className="w-full py-3 rounded-full bg-[var(--primary)] text-[var(--cream)] font-semibold hover:bg-[var(--raspberry)] transition text-sm"
            >
              Got it, let me fix it
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-10 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-[var(--primary)] opacity-20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-[var(--raspberry)] opacity-15 blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nav)]/80 backdrop-blur-md border border-[var(--border)] text-[var(--cream)] hover:border-[var(--primary)] transition text-sm"
            >
              <FiArrowLeft size={14} /> Back
            </button>

            <button
              type="button"
              onClick={fillDemoData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[var(--yellow)]/50 bg-[var(--yellow)]/10 text-[var(--yellow)] font-semibold hover:bg-[var(--yellow)]/20 transition text-sm"
            >
              ⚡ Fill Demo Data
            </button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/50 bg-[var(--surface)]/60 backdrop-blur-sm px-3 py-1 mb-5">
              <FiSend className="text-[var(--yellow)]" size={12} />
              <span className="text-[10px] tracking-widest uppercase text-[var(--yellow)] font-semibold">
                Share Your Voice
              </span>
            </div>

            <h1 className="font-orbitron text-4xl md:text-5xl font-black text-[var(--cream)] leading-tight">
              Submit Your
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--raspberry)] bg-clip-text text-transparent">
                Fan Content
              </span>
            </h1>

            <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto text-sm md:text-base">
              Got an article, review, or story to share? Submit it here and get featured.
            </p>
          </div>
        </div>
      </section>

      {/* FORM — 2 COLUMN */}
      <section className="max-w-6xl mx-auto px-4 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-5">

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--cream)] mb-3">
                <FiType size={14} className="text-[var(--primary)]" />
                Title <span className="text-[var(--primary)]">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Top 10 Anime Fight Scenes"
                className={`w-full rounded-lg bg-[var(--nav)] border px-4 py-3 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/50 outline-none transition ${
                  errors.title
                    ? 'border-red-500/60 focus:border-red-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)]'
                }`}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {errors.title}
                </p>
              )}
              <p className="text-[10px] text-[var(--muted)] mt-2">
                {form.title.length} / 100 characters
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5 space-y-4">

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--cream)] mb-3">
                  <FiTag size={14} className="text-[var(--primary)]" />
                  Category <span className="text-[var(--primary)]">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full rounded-lg bg-[var(--nav)] border px-4 py-3 text-sm text-[var(--cream)] outline-none transition cursor-pointer ${
                    errors.category
                      ? 'border-red-500/60'
                      : 'border-[var(--border)] focus:border-[var(--primary)]'
                  }`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <FiAlertCircle size={12} /> {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--cream)] mb-3">
                  <FiTag size={14} className="text-[var(--primary)]" />
                  Fandom <span className="text-[var(--primary)]">*</span>
                </label>
                <input
                  type="text"
                  name="fandom"
                  value={form.fandom}
                  onChange={handleChange}
                  placeholder="e.g., Jujutsu Kaisen"
                  className={`w-full rounded-lg bg-[var(--nav)] border px-4 py-3 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/50 outline-none transition ${
                    errors.fandom
                      ? 'border-red-500/60'
                      : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)]'
                  }`}
                />
                {errors.fandom && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <FiAlertCircle size={12} /> {errors.fandom}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--cream)] mb-3">
                <FiImage size={14} className="text-[var(--primary)]" />
                Cover Image <span className="text-[var(--muted)] text-xs">(optional)</span>
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-[var(--cream)] text-xs font-semibold hover:bg-red-500/80 transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] cursor-pointer transition bg-[var(--nav)]/30">
                  <FiUpload size={20} className="text-[var(--muted)] mb-2" />
                  <p className="text-sm text-[var(--cream)] font-semibold">
                    Click to upload
                  </p>
                  <p className="text-[10px] text-[var(--muted)] mt-1">
                    PNG, JPG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md p-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--cream)] mb-3">
                <FiAlignLeft size={14} className="text-[var(--primary)]" />
                Content Body <span className="text-[var(--primary)]">*</span>
              </label>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={14}
                placeholder="Write your article, review, or story here... (min 50 characters)"
                className={`w-full rounded-lg bg-[var(--nav)] border px-4 py-3 text-sm text-[var(--cream)] placeholder:text-[var(--muted)]/50 outline-none transition resize-none ${
                  errors.body
                    ? 'border-red-500/60'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--glow)]'
                }`}
              />
              {errors.body && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {errors.body}
                </p>
              )}
              <p className="text-[10px] text-[var(--muted)] mt-2">
                {form.body.length} characters (min 50)
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--yellow)]/30 bg-[var(--yellow)]/5 p-5">
              <h3 className="font-orbitron text-sm font-bold text-[var(--yellow)] mb-3 flex items-center gap-2">
                📋 Submission Guidelines
              </h3>
              <ul className="space-y-2 text-xs text-[var(--muted)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--yellow)] mt-0.5">•</span>
                  Content must be original or properly credited
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--yellow)] mt-0.5">•</span>
                  No offensive or inappropriate content
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--yellow)] mt-0.5">•</span>
                  Admin will review within 24-48 hours
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--yellow)] mt-0.5">•</span>
                  Approved content will be published with your name
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full bg-[var(--primary)] text-[var(--cream)] font-orbitron font-bold py-4 hover:bg-[var(--raspberry)] transition shadow-[0_0_30px_var(--glow)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm uppercase tracking-wider cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[var(--cream)] border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiSend size={16} /> Submit for Review
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default SubmitContent;