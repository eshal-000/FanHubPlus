import { useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function CastSection({ cast }) {
  const [activeActor, setActiveActor] = useState(null)

  if (!cast || cast.length === 0) return null

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-orbitron text-lg font-bold uppercase tracking-wider text-yellow">
          Cast
        </h2>
        <span className="text-xs text-muted">
          {cast.length} {cast.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {cast.map((member) => (
          <button
            className="group w-28 shrink-0 text-left focus:outline-none sm:w-32"
            key={member._id}
            onClick={() => setActiveActor(member)}
            type="button"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-xl border border-border bg-card transition group-hover:border-primary/60 group-hover:shadow-[0_0_18px_rgba(255,0,107,0.3)]">
              {member.imageUrl ? (
                <img
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  src={member.imageUrl}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#390B2B] to-[#99004D]">
                  <span className="font-orbitron text-2xl font-bold text-cream/60">
                    {member.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-1 text-xs font-semibold text-cream">
              {member.name}
            </p>
            {member.characterName && (
              <p className="line-clamp-1 text-[0.65rem] text-muted">
                as {member.characterName}
              </p>
            )}
          </button>
        ))}
      </div>

      
      <AnimatePresence>
        {activeActor && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setActiveActor(null)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-primary/40 bg-card p-6"
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Close actor details"
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-border bg-bg text-cream hover:border-yellow"
                onClick={() => setActiveActor(null)}
                type="button"
              >
                <X size={16} />
              </button>

              <div className="flex gap-4">
                {activeActor.imageUrl && (
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
                    <img
                      alt={activeActor.name}
                      className="h-full w-full object-cover"
                      src={activeActor.imageUrl}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-orbitron text-lg font-bold text-cream">
                    {activeActor.name}
                  </h3>
                  {activeActor.characterName && (
                    <p className="mt-1 text-sm text-yellow">
                      as {activeActor.characterName}
                    </p>
                  )}
                </div>
              </div>

              {activeActor.bio && (
                <p className="mt-4 text-sm leading-7 text-muted">
                  {activeActor.bio}
                </p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                {activeActor.dateOfBirth && (
                  <div>
                    <dt className="text-muted">Date of Birth</dt>
                    <dd className="text-cream">
                      {new Date(activeActor.dateOfBirth).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {activeActor.nationality && (
                  <div>
                    <dt className="text-muted">Nationality</dt>
                    <dd className="text-cream">{activeActor.nationality}</dd>
                  </div>
                )}
              </dl>

              {activeActor.notableWorks?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted">Notable Works</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-cream">
                    {activeActor.notableWorks.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}