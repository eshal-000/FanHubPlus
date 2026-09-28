import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  ImageOff,
  ShoppingBag,
  Sparkles,
  Tag as TagIcon,
  ArrowUpRight,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Info,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DemoLinkModal from "@/components/common/DemoLinkModal";
import LoginPromptModal from "@/components/common/LoginPromptModal";
import useBookmarks from "@/hooks/useBookmarks";
import MerchCard from "@/components/discovery/MerchCard";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

function GlowBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--primary)] opacity-[0.12] blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-40 top-1/3 h-[450px] w-[450px] rounded-full bg-[var(--raspberry)] opacity-[0.14] blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-[var(--yellow)] opacity-[0.08] blur-[110px]"
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading merch">
      <div className="h-4 w-56 animate-pulse rounded bg-surface-light/60" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-surface-light/50" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-surface-light/60" />
          <div className="h-3 w-40 animate-pulse rounded bg-surface-light/50" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-surface-light/40" />
          <div className="h-10 w-44 animate-pulse rounded-lg bg-surface-light/40" />
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
  const [demoLink, setDemoLink] = useState(null);
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
    return (
      <div className="relative min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans']">
        <GlowBackground />
        <div className="relative z-10">
          <DetailsSkeleton />
        </div>
      </div>
    );

  if (error || !merch) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
        <GlowBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <ShoppingBag className="h-12 w-12 text-[var(--muted)]" />
          <p className="text-lg">{error || "Merch item not found."}</p>
          <Button
            onClick={() => navigate("/merch")}
            className="bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
          >
            Back to Merch
          </Button>
        </div>
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
    if (requireLogin()) return;
    try {
      await toggle(merch._id, "merch");
    } catch {}
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <GlowBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Merch", to: "/merch" },
            { label: merch.name, isLast: true },
          ]}
        />

        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2 text-[var(--muted)] hover:text-[var(--cream)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]"
              style={{ boxShadow: "0 0 40px rgba(255, 0, 107, 0.15)" }}
            >
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
                    <ImageOff className="h-16 w-16 text-muted/40" />
                  </span>
                )}
              </AnimatePresence>

              {merch.isUpcoming && (
                <span className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)]">
                  <Sparkles className="h-3 w-3" />
                  Upcoming Drop
                </span>
              )}

              {images.length > 1 && (
                <span className="absolute right-5 top-5 rounded-full border border-[var(--border)] bg-nav/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--cream)] backdrop-blur-md">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-pressed={activeImage === i}
                    className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all ${
                      activeImage === i
                        ? "border-[var(--primary)] shadow-[0_0_20px_var(--glow)] scale-105"
                        : "border-[var(--border)] opacity-60 hover:opacity-100 hover:scale-105"
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
              <div className="flex-1">
                <h1 className="font-['Orbitron'] text-3xl font-bold leading-tight tracking-wide sm:text-4xl">
                  {merch.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {merch.fandom && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-bold text-[var(--bg)]">
                      <TagIcon className="h-3 w-3" />
                      {merch.fandom}
                    </span>
                  )}
                  {merch.category && (
                    <span className="rounded-full border border-[var(--border)] bg-surface/40 px-3 py-1 text-xs uppercase tracking-wider text-[var(--muted)] backdrop-blur-md">
                      {merch.category}
                    </span>
                  )}
                  {merch.isUpcoming && (
                    <span className="rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={handleBookmark}
                aria-pressed={saved}
                size="sm"
                className={`shrink-0 ${
                  saved
                    ? "bg-[var(--surface-light)] text-[var(--yellow)] hover:bg-[var(--surface-light)]"
                    : "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
                }`}
              >
                {saved ? (
                  <>
                    <BookmarkCheck className="mr-1.5 h-4 w-4" /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-1.5 h-4 w-4" /> Save
                  </>
                )}
              </Button>
            </div>

            {(merch.tags?.length || 0) > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {merch.tags.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-3 py-1 text-xs font-semibold text-[var(--primary)] backdrop-blur-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div
              className="mt-6 rounded-2xl border border-[var(--border)] bg-surface/40 p-5 backdrop-blur-md"
              style={{ boxShadow: "0 0 20px rgba(255, 0, 107, 0.06)" }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15">
                  <Info className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-xs font-bold tracking-widest text-[var(--cream)]">
                    SHOWCASE ONLY
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                    Fan Hub Plus is a discovery platform. Purchases happen on the official store — click the button below to visit.
                  </p>
                </div>
              </div>
            </div>

            <section className="mt-8" aria-label="Description">
              <h2 className="mb-3 flex items-center gap-2 font-['Orbitron'] text-sm font-bold tracking-widest text-[var(--muted)]">
                DESCRIPTION
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--primary)] to-transparent" />
              </h2>
              <div
                className="prose prose-invert max-w-none text-sm leading-relaxed text-cream/90 [&_a]:text-[var(--primary)] [&_a]:underline [&_h2]:font-['Orbitron'] [&_h3]:font-['Orbitron'] [&_img]:rounded-xl [&_img]:shadow-[0_0_20px_var(--glow)] [&_li]:marker:text-[var(--primary)] [&_strong]:text-[var(--yellow)]"
                dangerouslySetInnerHTML={{
                  __html: merch.description || "<p>No description provided yet.</p>",
                }}
              />
            </section>

            {merch.externalUrl ? (
              <button
                onClick={() => setDemoLink(merch.externalUrl)}
                className="group mt-8 inline-flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--raspberry)] px-6 py-4 font-['Orbitron'] text-sm font-bold uppercase tracking-wider text-[var(--cream)] shadow-[0_0_30px_var(--glow)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_40px_var(--glow)] sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  View on Official Store
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            ) : (
              <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-surface/40 px-6 py-4 text-sm font-semibold text-[var(--muted)] backdrop-blur-md">
                <Info className="h-4 w-4" />
                Official store link coming soon
              </div>
            )}
          </motion.div>
        </div>

        {relatedMerch.length > 0 && (
          <section className="mt-16 border-t border-[var(--border)] pt-10" aria-label="Related merch">
            <div className="mb-6 flex items-center gap-4">
              <h2 className="flex items-center gap-2 font-['Orbitron'] text-lg font-bold tracking-widest text-[var(--cream)]">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                RELATED <span className="text-[var(--primary)]">MERCH</span>
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-[var(--primary)] to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedMerch.slice(0, 4).map((m, i) => (
                <MerchCard key={m._id} merch={m} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />

      <DemoLinkModal
        open={!!demoLink}
        onClose={() => setDemoLink(null)}
        url={demoLink}
        title="OFFICIAL STORE"
      />
    </div>
  );
}