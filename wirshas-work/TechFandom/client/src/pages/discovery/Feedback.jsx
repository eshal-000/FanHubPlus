import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Lightbulb,
  Loader2,
  Mail,
  Send,
  Star,
  User as UserIcon,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import BookmarkBadge from "@/components/common/BookmarkBadge";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}`;

const FEEDBACK_TYPES = [
  {
    value: "bug",
    label: "Bug",
    icon: Bug,
    blurb: "Something broken?",
    accent: "border-[var(--primary)] bg-primary/10 text-[var(--cream)]",
    chip: "bg-[var(--primary)] text-[var(--cream)]",
  },
  {
    value: "suggestion",
    label: "Suggestion",
    icon: Lightbulb,
    blurb: "Make the hub better",
    accent: "border-[var(--yellow)] bg-yellow/10 text-[var(--cream)]",
    chip: "bg-[var(--yellow)] text-[var(--bg)]",
  },
  {
    value: "query",
    label: "Query",
    icon: Mail,
    blurb: "Ask us anything",
    accent: "border-[var(--muted)] bg-surface-light/40 text-[var(--cream)]",
    chip: "bg-[var(--surface-light)] text-[var(--cream)] border border-[var(--border)]",
  },
];

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

function SuccessCard({ onReset, lastType }) {
  const typeMeta = FEEDBACK_TYPES.find((t) => t.value === lastType) || FEEDBACK_TYPES[0];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-surface/40 p-8 text-center shadow-[0_0_20px_var(--glow)] backdrop-blur-md"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] shadow-[0_0_20px_var(--glow)]"
      >
        <CheckCircle2 className="h-8 w-8 text-[var(--cream)]" />
      </motion.span>

      <h2 className="font-['Orbitron'] text-xl font-bold tracking-wide text-[var(--cream)]">
        MESSAGE RECEIVED!
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Thanks for your <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeMeta.chip}`}>{typeMeta.label}</span>{" "}
        — it's now in the team's queue. We read every submission.
      </p>

      <Button
        onClick={onReset}
        className="mt-6 bg-[var(--primary)] text-[var(--cream)] shadow-[0_0_20px_var(--glow)] hover:bg-[var(--raspberry)]"
      >
        Submit Another
      </Button>
    </motion.div>
  );
}

export default function Feedback() {

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fanhub_user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("fanhub_user") || "null"));
      } catch {

      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isLoggedIn = Boolean(user?.token || localStorage.getItem("token"));

  const [form, setForm] = useState({ type: "bug", subject: "", message: "", name: "", email: "", rating: 0 });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null); 
  const [submitted, setSubmitted] = useState(false);
  const [lastType, setLastType] = useState("bug");

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" })); 
    setBanner(null);
  };

  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = "Subject is required.";
    else if (form.subject.trim().length < 4) e.subject = "Subject needs at least 4 characters.";

    if (!form.message.trim()) e.message = "Message is required.";
    else if (form.message.trim().length < MESSAGE_MIN)
      e.message = `Message needs at least ${MESSAGE_MIN} characters.`;
    else if (form.message.length > MESSAGE_MAX)
      e.message = `Message must be under ${MESSAGE_MAX} characters.`;

    if (!isLoggedIn) {
      if (!form.name.trim()) e.name = "Name is required for guest submissions.";
      if (!form.email.trim()) e.email = "Email is required so we can reply.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        e.email = "That email doesn't look right.";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    setBanner(null);
    try {
      const payload = {
        type: form.type,
        subject: form.subject.trim(),
        message: form.message.trim(),
        rating: form.rating || null,
      };
      if (!isLoggedIn) {
        payload.name = form.name.trim();
        payload.email = form.email.trim();
      }
      await axios.post(`${API}/feedback`, payload);
      setLastType(form.type);
      setSubmitted(true);
    } catch (err) {
      setBanner({
        kind: "error",
        text: err.response?.data?.message || "Submission failed — please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = useMemo(() => form.message.length, [form.message]);
  const inputBase =
    "border-[var(--border)] bg-nav/60 text-[var(--cream)] placeholder:text-muted/50 focus-visible:ring-[var(--primary)]";

  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[var(--primary)] opacity-10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <Breadcrumbs />
          <BookmarkBadge />
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="font-['Orbitron'] text-3xl font-bold tracking-wide">
            SEND <span className="text-[var(--primary)]">FEEDBACK</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--muted)]">
            Found a bug, got an idea, or just curious? The Fan Hub Plus team wants to hear it.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessCard
              key="success"
              lastType={lastType}
              onReset={() => {
                setSubmitted(false);
                setForm({ type: "bug", subject: "", message: "", name: "", email: "", rating: 0 });
                setErrors({});
              }}
            />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]"
            >
              {}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl border border-[var(--border)] bg-surface/40 p-6 shadow-[0_0_20px_var(--glow)] backdrop-blur-md"
              >
                {}
                {banner && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="mb-5 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm"
                  >
                    {banner.text}
                  </motion.div>
                )}

                {}
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Feedback Type <span className="text-[var(--primary)]">*</span>
                  </legend>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {FEEDBACK_TYPES.map((t) => {
                      const active = form.type === t.value;
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setField("type", t.value)}
                          className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-all ${
                            active ? t.accent : "border-[var(--border)] bg-nav/40 hover:bg-surface-light/40"
                          } ${active ? "shadow-[0_0_20px_var(--glow)]" : ""}`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>
                            <span className="block text-sm font-semibold">{t.label}</span>
                            <span className="block text-[10px] text-[var(--muted)]">{t.blurb}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="mt-5">
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    How would you rate the hub?
                  </legend>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const lit = n <= form.rating;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setField("rating", form.rating === n ? 0 : n)}
                          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                          aria-pressed={lit}
                          className="rounded-lg p-1 transition-all hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              lit
                                ? "fill-[var(--yellow)] text-[var(--yellow)] drop-shadow-[0_0_6px_var(--glow)]"
                                : "text-[var(--muted)]/60"
                            }`}
                          />
                        </button>
                      );
                    })}
                    {form.rating > 0 && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-2 rounded-full bg-[var(--surface-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--yellow)]"
                      >
                        {form.rating}/5
                      </motion.span>
                    )}
                  </div>
                </fieldset>

                {}
                <div className="mt-5 space-y-1.5">
                  <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Subject <span className="text-[var(--primary)]">*</span>
                  </Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                    placeholder="One line summary"
                    aria-invalid={!!errors.subject}
                    className={inputBase}
                  />
                  {errors.subject && (
                    <p role="alert" className="text-xs text-[var(--primary)]">{errors.subject}</p>
                  )}
                </div>

                {}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Message <span className="text-[var(--primary)]">*</span>
                    </Label>
                    <span
                      className={`text-[10px] ${
                        charCount > MESSAGE_MAX ? "text-[var(--primary)]" : "text-[var(--muted)]"
                      }`}
                    >
                      {charCount}/{MESSAGE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder={`Tell us everything (min ${MESSAGE_MIN} characters)…`}
                    aria-invalid={!!errors.message}
                    className={`w-full rounded-md border px-3 py-2 text-sm ${inputBase}`}
                  />
                  {errors.message && (
                    <p role="alert" className="text-xs text-[var(--primary)]">{errors.message}</p>
                  )}
                </div>

                {}
                {isLoggedIn ? (
                  <div className="mt-4 rounded-xl border border-[var(--border)] bg-nav/40 px-4 py-3">
                    <p className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <UserIcon className="h-3.5 w-3.5 text-[var(--yellow)]" />
                      Submitting as{" "}
                      <span className="font-semibold text-[var(--cream)]">
                        {user?.name || user?.username || "member"}
                      </span>
                      {user?.email && <span className="truncate">({user.email})</span>}
                      <span className="ml-auto rounded-full bg-[var(--surface-light)] px-2 py-0.5 text-[10px]">
                        logged in
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Name <span className="text-[var(--primary)]">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Your name"
                        aria-invalid={!!errors.name}
                        className={inputBase}
                      />
                      {errors.name && (
                        <p role="alert" className="text-xs text-[var(--primary)]">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Email <span className="text-[var(--primary)]">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        className={inputBase}
                      />
                      {errors.email && (
                        <p role="alert" className="text-xs text-[var(--primary)]">{errors.email}</p>
                      )}
                    </div>
                  </div>
                )}

                {}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 h-11 w-full bg-[var(--primary)] font-['Orbitron'] text-sm font-semibold tracking-wider text-[var(--cream)] shadow-[0_0_20px_var(--glow)] transition-all hover:bg-[var(--raspberry)] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> SENDING…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> SEND FEEDBACK
                    </>
                  )}
                </Button>
              </form>

              {}
              <aside className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="rounded-2xl border border-[var(--border)] bg-surface/40 p-5 backdrop-blur-md"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] shadow-[0_0_20px_var(--glow)]">
                    <HeartHandshake className="h-5 w-5 text-[var(--cream)]" />
                  </span>
                  <h2 className="font-['Orbitron'] text-sm font-bold tracking-wider text-[var(--cream)]">
                    WE READ EVERY SUBMISSION
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                    Every bug report, idea and question lands directly in the admin team's queue —
                    no bots, no black hole.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="rounded-2xl border border-[var(--border)] bg-surface/40 p-5 backdrop-blur-md"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--yellow)]">
                    <Clock3 className="h-5 w-5 text-[var(--bg)]" />
                  </span>
                  <h2 className="font-['Orbitron'] text-sm font-bold tracking-wider text-[var(--cream)]">
                    RESPONSE TIME
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                    Bugs: usually within 48 hours. Suggestions: reviewed every sprint. Queries:
                    we reply to the email you provide.
                  </p>
                </motion.div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
