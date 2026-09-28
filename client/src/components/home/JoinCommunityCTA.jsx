import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function JoinCommunityCTA() {
  const { isAuthenticated } = useAuth()
  const destination = isAuthenticated ? '/dashboard' : '/register'
  const label = isAuthenticated ? 'Go to Dashboard' : 'Join the Community'

  return (
    <section className="relative overflow-hidden bg-bg px-4 py-20">
      
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(153,0,77,0.55) 0%, rgba(90,11,51,0.35) 40%, transparent 75%)',
        }}
      />

      
      <div className="pointer-events-none absolute right-[-6rem] top-0 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-6rem] h-72 w-72 rounded-full bg-yellow/10 blur-3xl" />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, scale: 1 }}
      >
        <p className="special text-lg text-yellow">Different Fandoms. Same Home.</p>
        <h2 className="mt-4 text-[clamp(1.75rem,3.5vw,3rem)] font-black leading-tight text-cream">
          Your Fandom.<br />Your Community.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-cream/80">
          Join a growing universe of fans. Save your favourites, track upcoming releases, and connect with your community.
        </p>
        <Link
          className="btn-primary special mt-8 inline-flex items-center gap-2 text-base"
          to={destination}
        >
          {label} <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
  )
}