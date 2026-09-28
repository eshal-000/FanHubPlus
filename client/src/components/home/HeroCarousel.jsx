import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const HERO_IMAGES = [
  '/images/hero/fandom-herocarousal-characters1.png',
  '/images/hero/fandom-herocarousal-characters2.png',
]

const CAROUSEL_INTERVAL = 4500

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)



  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handleChange = (e) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    HERO_IMAGES.forEach((src) => {
      const img = new Image()
      img.src = src
    })

    if (prefersReduced || paused) return undefined

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % HERO_IMAGES.length)
    }, CAROUSEL_INTERVAL)

    return () => clearInterval(timer)
  }, [prefersReduced, paused])

  return (
    <div
      className="relative flex h-full w-full items-center justify-center lg:pr-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={
            prefersReduced
              ? undefined
              : { opacity: [0.55, 0.85, 0.55], scale: [1, 1.08, 1] }
          }
          className="absolute h-[80%] w-[80%] max-h-[640px] max-w-[640px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,0,107,0.55) 0%, rgba(153,0,77,0.30) 45%, transparent 72%)',
            filter: 'blur(60px)',
            opacity: prefersReduced ? 0.65 : undefined,
          }}
          transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div
          animate={
            prefersReduced
              ? undefined
              : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.12, 1] }
          }
          className="absolute h-[50%] w-[50%] max-h-[400px] max-w-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,227,71,0.22) 0%, rgba(255,0,107,0.28) 55%, transparent 78%)',
            filter: 'blur(70px)',
            opacity: prefersReduced ? 0.5 : undefined,
          }}
          transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative flex h-full w-full items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={HERO_IMAGES[index]}
            alt="Fan Hub Plus character collage"
            animate={{ opacity: 1, scale: 1.15, y: 0 }}
            className="absolute h-full w-full object-contain object-center"
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 1.08, y: -18 }}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 1.08, y: 18 }}
            src={HERO_IMAGES[index]}
            style={{
              filter:
                'drop-shadow(0 25px 60px rgba(255,0,107,0.35)) drop-shadow(0 0 40px rgba(153,0,77,0.35))',
            }}
            transition={{ duration: prefersReduced ? 0.2 : 1.15, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}
