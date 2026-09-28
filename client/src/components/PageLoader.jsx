import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import logoUrl from '../assets/logo/fan-hub-plus-wordmark.svg'

export default function PageLoader({ active, variant = 'route' }) {
  const [prefersReduced, setPrefersReduced] = useState(false)


  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])


  useEffect(() => {
    if (!active) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [active])


  useEffect(() => {
    const img = new Image()
    img.src = '/images/hero/loader-img.png'
  }, [])

  if (!active) return null

  const isInitial = variant === 'initial'


  const t = {
    backgroundIn: 0.3,
    logoIn: prefersReduced ? 0.15 : 0.3,
    logoDelay: prefersReduced ? 0 : 0.3,
    headingIn: prefersReduced ? 0.15 : 0.2,
    headingDelay: prefersReduced ? 0 : 0.6,
    barIn: prefersReduced ? 0.15 : 0.2,
    barDelay: prefersReduced ? 0 : 0.6,
    taglineIn: prefersReduced ? 0.15 : 0.2,
    taglineDelay: prefersReduced ? 0 : 0.6,
    fillDuration: 1.3,
    fillDelay: 0.2,
  }


  const barFillVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: t.fillDuration,
        delay: t.fillDelay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-live="polite"
      aria-label="Loading Fan Hub Plus"
      className="fixed inset-0 z-[999] overflow-hidden"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      role="status"
      style={{
        background: '#180012',
        width: '100vw',
        height: '100vh',
        height: '100dvh',
      }}
      transition={{ duration: prefersReduced ? 0.15 : 0.35, ease: 'easeOut' }}
    >

      <motion.img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
        initial={{ opacity: 0, scale: prefersReduced ? 1 : 1.04 }}
        src="/images/hero/loader-img.png"
        style={{ filter: 'brightness(0.94)' }}
        transition={{ duration: t.backgroundIn, ease: [0.22, 1, 0.36, 1] }}
        animate={{ opacity: 1, scale: 1 }}
      />


      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%]"
        style={{
          background:
            'linear-gradient(to top, rgba(24,0,18,0.55) 0%, rgba(24,0,18,0.20) 55%, transparent 100%)',
        }}
      />


      <motion.div
        animate={
          prefersReduced
            ? { opacity: 0.2 }
            : { opacity: [0.15, 0.35, 0.15] }
        }
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 55%, rgba(255,0,107,0.18) 0%, rgba(153,0,77,0.08) 45%, transparent 70%)',
        }}
        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
      />


      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex w-full max-w-[420px] flex-col items-center text-center px-6">

          <motion.img
            alt="Fan Hub Plus"
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto block h-auto w-[135px] sm:w-[155px] md:w-[175px]"
            draggable={false}
            initial={{ opacity: 0, y: 8 }}
            src={logoUrl}
            style={{
              filter:
                'drop-shadow(0 4px 18px rgba(0,0,0,0.60)) drop-shadow(0 0 18px rgba(255,0,107,0.40))',
            }}
            transition={{
              duration: t.logoIn,
              delay: t.logoDelay,
              ease: [0.22, 1, 0.36, 1],
            }}
          />


          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-center text-[13px] font-black uppercase text-yellow sm:mt-6 sm:text-[15px] md:text-[17px]"
            initial={{ opacity: 0, y: 6 }}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.3em',
              textIndent: '0.3em',
              textShadow:
                '0 2px 6px rgba(0,0,0,0.85), 0 4px 18px rgba(0,0,0,0.65)',
            }}
            transition={{
              duration: t.headingIn,
              delay: t.headingDelay,
              ease: 'easeOut',
            }}
          >
            Entering the Universe
          </motion.h1>


          <motion.div
            animate="visible"
            className="mt-5 flex w-full justify-center sm:mt-6"
            initial="hidden"
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: t.barIn,
                  delay: t.barDelay,
                  ease: 'easeOut',

                  when: 'beforeChildren',
                },
              },
            }}
          >
            <div
              className="relative h-[8px] w-[240px] overflow-hidden rounded-full sm:w-[300px] md:w-[340px]"
              style={{
                background: 'rgba(0, 0, 0, 0.82)',
                boxShadow:
                  '0 0 0 1px rgba(255, 0, 107, 0.55) inset, 0 0 20px rgba(255, 0, 107, 0.35), 0 4px 20px rgba(0,0,0,0.65)',
              }}
            >
              {prefersReduced ? (

                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: '100%',
                    background:
                      'linear-gradient(90deg, #FF006B 0%, #FF2C85 50%, #FFE347 100%)',
                    boxShadow:
                      '0 0 24px rgba(255, 0, 107, 0.9), 0 0 10px rgba(255, 227, 71, 0.7)',
                  }}
                />
              ) : (

                <motion.div
                  className="absolute inset-y-0 left-0 w-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #FF006B 0%, #FF2C85 50%, #FFE347 100%)',
                    boxShadow:
                      '0 0 24px rgba(255, 0, 107, 0.9), 0 0 10px rgba(255, 227, 71, 0.7)',
                    transformOrigin: 'left center',
                  }}
                  variants={barFillVariants}
                />
              )}
            </div>
          </motion.div>


          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-[10px] font-bold uppercase text-cream sm:text-[11px]"
            initial={{ opacity: 0, y: 4 }}
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '0.32em',
              textIndent: '0.32em',
              textShadow:
                '0 2px 6px rgba(0,0,0,0.85), 0 4px 16px rgba(0,0,0,0.6)',
            }}
            transition={{
              duration: t.taglineIn,
              delay: t.taglineDelay,
              ease: 'easeOut',
            }}
          >
            Explore · Discover · Belong
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}