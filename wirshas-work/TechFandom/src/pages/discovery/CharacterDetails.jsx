import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import LoginPromptModal from "@/components/common/LoginPromptModal";
import useBookmarks from "@/hooks/useBookmarks";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading character">
      <div className="h-4 w-64 animate-pulse rounded bg-[var(--surface-light)]/60" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        <div className="aspect-[4/5] animate-pulse rounded-2xl bg-[var(--surface-light)]/50" />
        <div className="space-y-4">
          <div className="h-8 w-1/2 animate-pulse rounded bg-[var(--surface-light)]/60" />
          <div className="h-3 w-40 animate-pulse rounded bg-[var(--surface-light)]/50" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-[var(--surface-light)]/40" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-[var(--surface-light)]/40" />
        </div>
      </div>
    </div>
  );
}

function RelatedMiniCard({ type, item }) {
  const href =
    type === "article" ? `/articles/${item._id}` :
    type === "media" ? `/media/${item._id}` :
    type === "merch" ? `/merch/${item._id}` :
    `/characters/${item._id}`;

  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-3 backdrop-blur-md transition-all hover:border-[var(--primary)]/50 hover:shadow-[0_0_20px_var(--glow)]"
    >
      {item.image || item.coverImage || item.thumbnailUrl ? (
        <img
          src={item.image || item.coverImage || item.thumbnailUrl}
          alt={item.title || item.name}
          className="h-12 w-12 shrink-0 rounded-lg border border-[var(--border)] object-cover"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-light)] text-xs font-['Orbitron'] text-[var(--yellow)]">
          {(item.title || item.name || "?")[0]?.toUpperCase()}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[var(--cream)] group-hover:text-[var(--yellow)]">
          {item.title || item.name}
        </span>
        <span className="text-xs capitalize text-[var(--muted)]">
          {item.fandom || type}
        </span>
      </span>
    </Link>
  );
}

export default function CharacterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [related, setRelated] = useState({ articles: [], media: [], merch: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isBookmarked, toggle, requireLogin, showLoginPrompt, closeLoginPrompt } = useBookmarks();

  useEffect(() => {
    let cancelled = false;
    const fetchChar = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${API}/characters/${id}`);
        setCharacter(data?.character || data);
        setRelated({
          articles: data?.relatedContent?.articles || [],
          media: data?.relatedContent?.media || [],
          merch: data?.relatedContent?.merch || [],
        });
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Character not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchChar();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const saved = character ? isBookmarked(character._id) : false;

  const handleBookmark = async () => {
    if (requireLogin()) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      await toggle(character._id, "character");
    } catch {
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans']"><DetailsSkeleton /></div>;

  if (error || !character) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
        <Sparkles className="h-10 w-10 text-[var(--muted)]" />
        <p className="text-lg">{error || "Character not found."}</p>
        <Button
          onClick={() => navigate("/characters")}
          className="bg-[var(--primary)] text-[var(--cream)] hover:bg-[var(--raspberry)]"
        >
          Back to Characters
        </Button>
      </div>
    );
  }

  const traits = Array.isArray(character.traits)
    ? character.traits
    : character.traits
    ? String(character.traits).split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[var(--primary)] opacity-10 blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Characters", to: "/characters" },
            { label: character.name, isLast: true },
          ]}
        />

        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 text-[var(--muted)] hover:text-[var(--cream)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_0_20px_var(--glow)]">
              {character.image ? (
                <img
                  src={character.image}
                  alt={`${character.name} — ${character.fandom || "fandom"} character portrait`}
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-[var(--surface)]">
                  <Sparkles className="h-14 w-14 text-[var(--muted)]/50" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-['Orbitron'] text-3xl font-bold tracking-wide sm:text-4xl">
                  {character.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {character.fandom && (
                    <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-semibold text-[var(--bg)]">
                      {character.fandom}
                    </span>
                  )}
                  {character.category && (
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-wider text-[var(--muted)]">
                      {character.category}
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={handleBookmark}
                aria-pressed={saved}
                className={`${
                  saved
                    ? "bg-[var(--surface-light)] text-[var(--yellow)]"
                    : "bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
                }`}
              >
                {saved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                {saved ? "Bookmarked" : "Bookmark"}
              </Button>
            </div>

            <section className="mt-6" aria-label="Biography">
              <h2 className="font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">BIO</h2>
              <div
                className="prose-invert mt-2 space-y-3 text-sm leading-relaxed text-[var(--cream)]/90 [&_a]:text-[var(--primary)] [&_h2]:font-['Orbitron'] [&_h2]:text-base [&_h3]:font-['Orbitron'] [&_h3]:text-sm [&_img]:rounded-xl [&_p]:text-[var(--cream)]/90"
                dangerouslySetInnerHTML={{ __html: character.bio || "<em>No bio recorded yet.</em>" }}
              />
            </section>

            {traits.length > 0 && (
              <section className="mt-6" aria-label="Traits">
                <h2 className="font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">TRAITS</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {traits.map((t, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)]/40 px-3 py-1 text-xs text-[var(--cream)] backdrop-blur-md"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8" aria-label="Related content">
              <h2 className="font-['Orbitron'] text-sm tracking-widest text-[var(--muted)]">
                RELATED CONTENT
              </h2>
              <Tabs defaultValue="articles" className="mt-3">
                <TabsList className="border border-[var(--border)] bg-[var(--surface)]/40 backdrop-blur-md">
                  <TabsTrigger value="articles" className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--cream)]">
                    Articles ({related.articles.length})
                  </TabsTrigger>
                  <TabsTrigger value="media" className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--cream)]">
                    Media ({related.media.length})
                  </TabsTrigger>
                  <TabsTrigger value="merch" className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--cream)]">
                    Merch ({related.merch.length})
                  </TabsTrigger>
                </TabsList>

                {["articles", "media", "merch"].map((type) => (
                  <TabsContent key={type} value={type} className="mt-4">
                    {related[type].length === 0 ? (
                      <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 px-4 py-6 text-center text-sm text-[var(--muted)] backdrop-blur-md">
                        No related {type} yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {related[type].map((item) => (
                          <RelatedMiniCard key={item._id} type={type} item={item} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          </motion.div>
        </div>
      </div>

      <LoginPromptModal open={showLoginPrompt} onClose={closeLoginPrompt} />
    </div>
  );
}
