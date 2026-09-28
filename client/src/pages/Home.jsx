import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import HeroCarousel from '../components/home/HeroCarousel.jsx'
import CategoryGrid from '../components/home/CategoryGrid.jsx'
import FeaturedContent from '../components/home/FeaturedContent.jsx'
import MediaHighlights from '../components/home/MediaHighlights.jsx'
import UpcomingEvents from '../components/home/UpcomingEvents.jsx'
import UpcomingReleases from '../components/home/UpcomingReleases.jsx'
import JoinCommunityCTA from '../components/home/JoinCommunityCTA.jsx'
import HomeSitemap from '../components/home/HomeSitemap.jsx'

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { delayChildren: 0.1, staggerChildren: 0.12 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

function Home() {
  const { isAuthenticated } = useAuth()


  const outletContext = useOutletContext()
  const appReady = outletContext?.appReady ?? true

  const communityTarget = isAuthenticated ? '/dashboard' : '/register'
  const communityLabel = isAuthenticated ? 'Go to Dashboard' : 'Join the Community'

  return (
    <>

      <section className="relative overflow-hidden bg-bg">
        <div className="absolute inset-0">
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            src="/images/hero/fandom-hero-bg.png"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(35,0,24,0.98) 0%, rgba(35,0,24,0.88) 40%, rgba(35,0,24,0.55) 70%, rgba(35,0,24,0.30) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 75% 50%, rgba(153,0,77,0.35) 0%, transparent 55%)',
            }}
          />
        </div>

        <div className="fp-container-wide relative grid gap-8 py-12 md:py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-10 lg:py-20">

          <motion.div
            animate={appReady ? 'show' : 'hidden'}
            initial="hidden"
            variants={heroContainer}
          >
            <motion.p
              className="inline-flex items-center gap-2 rounded-full border border-yellow/50 bg-yellow/10 px-4 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-yellow"
              variants={heroItem}
            >
              <Sparkles size={13} /> Fandom Pulse
            </motion.p>

            <motion.h1
              className="mt-5 font-orbitron text-[clamp(1.9rem,4.5vw,3.4rem)] font-black leading-[1.12] text-[#FFF3DE] drop-shadow-[0_4px_22px_rgba(0,0,0,0.85)]"
              variants={heroItem}
            >
              Every Fandom.<br />
              <span className="gradient-primary gradient-text">One Universe.</span>
            </motion.h1>

            <motion.p className="special mt-4 text-lg text-yellow" variants={heroItem}>
              Different Fandoms. Same Home.
            </motion.p>

            <motion.p
              className="mt-3 max-w-lg text-sm font-medium leading-7 text-[#F7D5E5]/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
              variants={heroItem}
            >
              Explore anime, gaming, movies, TV shows, K-Pop, comics, manga and cosplay — all in one immersive fan platform built for the community.
            </motion.p>

            <motion.div className="mt-7 flex flex-col gap-3 sm:flex-row" variants={heroItem}>
              <Link
                className="btn-primary special inline-flex items-center justify-center gap-2 text-sm"
                to="/explore"
              >
                Explore Fandoms <ArrowRight size={16} />
              </Link>
              <Link
                className="btn-secondary special inline-flex items-center justify-center gap-2 text-sm"
                to={communityTarget}
              >
                {communityLabel}
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative h-[340px] sm:h-[420px] md:h-[520px] lg:h-[560px]">
            <HeroCarousel />
          </div>
        </div>
      </section>


      <CategoryGrid />
      <FeaturedContent />
      <MediaHighlights />
      <UpcomingEvents />
      <UpcomingReleases />
      <JoinCommunityCTA />
      <HomeSitemap />
    </>
  )
}

export default Home
