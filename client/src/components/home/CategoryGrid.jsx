import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import useCategories from '../../hooks/useCategories'

export default function CategoryGrid() {
  const { categories, error, loading } = useCategories()

  return (
    <section className="bg-bg py-20" id="categories">
      <div className="fp-container">
        <div className="mb-10 text-center">
          <p className="special text-sm uppercase tracking-[0.28em] text-yellow">Explore</p>
          <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.75rem)] font-black text-cream">
            Explore Your Universe
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted">
            Eight curated worlds. One shared home for every fan.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div className="aspect-[4/5] animate-pulse rounded-2xl bg-card" key={item} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
            <p className="text-sm text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
            <p className="text-sm text-muted">No categories are published yet.</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 24 }}
              transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: '-50px' }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Link
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-primary/25 shadow-[0_4px_24px_rgba(153,0,77,0.22)] transition-all duration-400 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_0_28px_rgba(255,0,107,0.42),0_14px_40px_rgba(153,0,77,0.32)]"
                to={`/explore/${category.slug}`}
              >
                
                <div
                  className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                  style={{
                    boxShadow: 'inset 0 0 24px rgba(255,0,107,0.18)',
                  }}
                />

                {category.image ? (
                  <img
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                    loading="lazy"
                    src={category.image}
                  />
                ) : (
                  <div className="h-full w-full bg-card" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#230018] via-[#230018]/45 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between p-3.5 sm:p-4">
                  <span className="font-orbitron text-sm font-bold uppercase tracking-wider text-cream sm:text-base">
                    {category.name}
                  </span>
                  <ArrowUpRight
                    className="text-yellow transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    size={17}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
          </div>
        )}
      </div>
    </section>
  )
}
