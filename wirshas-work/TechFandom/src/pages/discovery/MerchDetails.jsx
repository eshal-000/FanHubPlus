import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, ImageOff, ShoppingBag } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import LoginPromptModal from "@/components/common/LoginPromptModal";
import useBookmarks from "@/hooks/useBookmarks";
import MerchCard from "@/components/discovery/MerchCard";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading merch">
      <div className="h-4 w-56 animate-pulse rounded bg-[var(--surface-light)]/60" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-[var(--surface-light)]/50" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-[var(--surface-light)]/60" />
          <div className="h-3 w-40 animate-pulse rounded bg-[var(--surface-light)]/50" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-[var(--surface-light)]/40" />
          <div className="h-10 w-44 animate-pulse rounded-lg bg-[var(--surface-light)]/40" />
        </div>
      </div>
    </div>
  );
}

export default function MerchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [merch, setMerch] = useState(null);
  const [relatedMerch, setRelatedMerch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const { isBookmarked, toggle, requireLogin, showLoginPrompt, closeLoginPrompt } = useBookmarks();

  useEffect(() => {
    let cancelled = false;
    const fetchMerch = async () => {
      setLoading(true);
      setError("");
      setActiveImage(0);
      try {
        const { data } = await axios.get(`${API}/merch/${id}`);
        setMerch(data?.merch || data);
        setRelatedMerch(data?.relatedMerch || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Merch item not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMerch();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading)
    return <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans']"><DetailsSkeleton /></div>;

  if (error || !merch) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
        <ShoppingBag className="h-10 w-10 text-[var(--muted)]" />
        <p className="text-lg">{error || "Merch item not found."}</p>
        <Button
          onClick={() => navigate("/merch")}
          className="bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]"
        >
          Back to Merch
        </Button>
      </div>
    );
  }

  const images = (Array.isArray(merch.images) && merch.images.length
    ? merch.images
    : merch.image
    ? [merch.image]
    : []
  ).filter(Boolean);

  const saved = isBookmarked(merch._id);

  const handleBookmark = async () => {
    if (requireLogin()) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      await toggle(merch._id, "merch");
    } catch {
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--primary)] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Merch", to: "/merch" },
            { label: merch.name, isLast: true },
          ]}
        />

        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 text-[var(--muted)] hover:text-[var(--cream)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_0_20px_var(--glow)]">
              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <motion.img
                    key={activeImage}
                    src={images[activeImage]}
                    alt={`${merch.name} — product photo ${activeImage + 1} of ${images.length}`}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-12 w-12 text-[var(--muted)]/40" />
                  </span>
                )}
              </AnimatePresence>

              {merch.isUpcoming && (
                <span className="absolute left-4 top-4 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--cream)]">
                  Upcoming Drop
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-pressed={activeImage === i}
                    className={`h-16 w-16 overflow-hidden rounded-lg border transition-all ${
                      activeImage === i
                        ? "border-[var(--primary)] shadow-[0_0_20px_var(--glow)]"
                        : "border-[var(--border)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-['Orbitron'] text-2xl font-bold leading-tight tracking-wide sm:text-3xl">
                  {merch.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {merch.fandom && (
                    <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-semibold text-[var(--bg)]">
                      {merch.fandom}
                    </span>
                  )}
                  {merch.category && (
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-wider text-[var(--muted)]">
                      {merch.category}
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={handleBookmark}
                aria-pressed={saved}
                className={`shrink-0 ${
                  saved
                    ? "bg-[var(--surface-light)] text-[var(--yellow)]"
                    : "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
                }`}
              >
                {saved ? "Bookmarked" : "Bookmark"}
              </Button>
            </div>

            {(merch.tags?.length || 0) > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {merch.tags.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface)]/40 px-3 py-1 text-xs text-[var(--cream)] backdrop-blur-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <section className="mt-6" aria-label="Description">
              <h2 className="font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">
                DESCRIPTION
              </h2>
              <div
                className="prose prose-invert mt-2 max-w-none text-sm leading-relaxed text-[var(--cream)]/90 [&_a]:text-[var(--primary)] [&_h2]:font-['Orbitron'] [&_h3]:font-['Orbitron'] [&_img]:rounded-xl [&_img]:shadow-[0_0_20px_var(--glow)] [&_li]:marker:text-[var(--primary)] [&_strong]:text-[var(--yellow)]"
                dangerouslySetInnerHTML={{
                  __html: merch.description || "<p>No description provided yet.</p>",
                }}
              />
            </section>

            {merch.externalUrl && (
              <a
                href={merch.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-['Orbitron'] text-sm font-semibold tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition-all hover:bg-[var(--raspberry)] hover:shadow-[0_0_30px_var(--glow)]"
              >
                VIEW ON OFFICIAL STORE <ExternalLink className="h-4 w-4" />
              </a>
            )}

            <p className="mt-3 text-xs text-[var(--muted)]">
              Fan Hub Plus is a showcase only — purchases happen on the official store.
            </p>
          </motion.div>
        </div>

        {relatedMerch.length > 0 && (
          <section className="mt-14" aria-label="Related merch">
            <h2 className="mb-4 font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">
              RELATED MERCH
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedMerch.slice(0, 4).map((m, i) => (
                <MerchCard key={m._id} merch={m} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </div>
  );
}
