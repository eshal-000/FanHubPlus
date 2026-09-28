import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clapperboard,
  Gamepad2,
  Headphones,
  Library,
  Mic2,
  Popcorn,
  Shirt,
  Sparkles,
} from "lucide-react";

const FANDOMS = [
  { name: "Anime", icon: Sparkles, blurb: "Heroes, rivals & sakura" },
  { name: "K-Pop", icon: Mic2, blurb: "Bias lists & lightsticks" },
  { name: "Gaming", icon: Gamepad2, blurb: "Boss fights & lore" },
  { name: "Movies", icon: Clapperboard, blurb: "Marathon worthy" },
  { name: "Music", icon: Headphones, blurb: "On repeat forever" },
  { name: "Comics", icon: Library, blurb: "Panels & plot twists" },
  { name: "Sports", icon: Shirt, blurb: "Matchday madness" },
  { name: "Drama", icon: Popcorn, blurb: "Binge-worthy stories" },
];

const LOOP = [...FANDOMS, ...FANDOMS];

export default function FandomSlider() {
  const [paused, setPaused] = useState(false);

  return (
    <section aria-label="Explore fandoms" className="relative mb-10 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/3 h-56 w-56 rounded-full bg-[var(--raspberry)] opacity-20 blur-[110px]"
      />
      <div className="relative z-10 mb-4 flex items-end justify-between px-1">
        <div>
          <h2 className="font-['Orbitron'] text-lg font-bold tracking-widest text-[var(--cream)]">
            PICK YOUR <span className="text-[var(--primary)]">FANDOM</span>
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Slide through the worlds we celebrate.
          </p>
        </div>
        <span className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] sm:flex">
          <Sparkles className="h-3 w-3 text-[var(--yellow)]" /> hover to pause
        </span>
      </div>

      <div
        className="relative z-10 overflow-hidden py-2"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className={`flex w-max gap-4 ${paused ? "[animation-play-state:paused]" : ""} animate-marquee`}
        >
          {LOOP.map((f, i) => {
            const Icon = f.icon;
            const key = `${f.name}-${i}`;
            return (
              <motion.div
                key={key}
                whileHover={{ y: -6, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="shrink-0"
              >
                <Link
                  to={`/characters?fandom=${encodeURIComponent(f.name)}`}
                  className="group flex w-44 flex-col gap-3 rounded-2xl border border-[var(--border)] bg-surface/50 p-4 backdrop-blur-md transition-all hover:border-[var(--primary)] hover:shadow-[0_0_28px_var(--glow)]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-light)] shadow-inner transition-all group-hover:bg-[var(--primary)] group-hover:shadow-[0_0_18px_var(--glow)]">
                    <Icon className="h-5 w-5 text-[var(--yellow)] transition-colors group-hover:text-[var(--cream)]" />
                  </span>
                  <span>
                    <span className="block font-['Orbitron'] text-sm font-bold tracking-wider text-[var(--cream)] group-hover:text-[var(--yellow)]">
                      {f.name.toUpperCase()}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                      {f.blurb.trim()}
                    </span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
