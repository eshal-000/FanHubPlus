import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Compass, Orbit, Sparkles, UserRound } from 'lucide-react'
import { FaLinkedin } from 'react-icons/fa6'
import { SiExpress, SiMongodb, SiNodedotjs, SiReact, SiTailwindcss } from 'react-icons/si'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'


const TEAM = [
  {
    name: 'Eshal Noor',
    title: 'MERN Stack Developer',
    introduction: 'Turning creative ideas into immersive digital experiences. Passionate about building modern, interactive web applications where clean code meets bold design.',
    photo: null,
    linkedin: 'https://www.linkedin.com/in/eshal-noor-dev',
  },
  {
    name: 'Maria',
    title: 'Full Stack Web Developer',
    introduction: 'Bringing ideas to life through thoughtful development and seamless digital experiences. Driven by creativity, functionality and a passion for building meaningful solutions.',
    photo: null,
  },
  {
    name: 'Wirsha',
    title: 'Web Application Developer',
    introduction: 'Transforming complex ideas into engaging web experiences. Focused on creating intuitive, functional and impactful digital solutions.',
    photo: null,
  },
]

const TECHNOLOGIES = [
  { name: 'React', Icon: SiReact, color: '#61DAFB' },
  { name: 'Tailwind CSS', Icon: SiTailwindcss, color: '#38BDF8' },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#8CC84B' },
  { name: 'Express.js', Icon: SiExpress, color: '#FFF3DE' },
  { name: 'MongoDB', Icon: SiMongodb, color: '#47A248' },
]

function About() {
  const reduceMotion = useReducedMotion()
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 28 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  })

  return (
    <div className="relative isolate overflow-hidden bg-[var(--bg)] text-[var(--cream)]">
      <section className="relative isolate flex min-h-[min(740px,88svh)] items-center overflow-hidden border-b border-[var(--border)] px-4 py-24 sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_38%,rgba(153,0,77,0.36),transparent_42%),radial-gradient(ellipse_at_12%_80%,rgba(115,52,158,0.22),transparent_48%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255,243,222,0.22) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <motion.div className="relative z-10 max-w-3xl" {...reveal()}>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/35 bg-[var(--primary)]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--yellow)] sm:text-xs">
              <Sparkles aria-hidden="true" size={14} /> Welcome to Fan Hub Plus
            </p>
            <h1 className="font-orbitron text-[clamp(2.8rem,7vw,6rem)] font-black leading-[1.07] tracking-[-0.045em]">
              Different Fandoms.{' '}<br />
              <span className="gradient-signature gradient-text">Same Home.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              One universe. Endless stories. A home for every fandom.
            </p>
            <Link className="btn-primary mt-9 inline-flex items-center gap-3 font-bold" to="/explore">
              Explore Our Universe <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </motion.div>

          <div aria-hidden="true" className="relative mx-auto h-[260px] w-full max-w-[390px] sm:h-[390px] lg:h-[470px] lg:max-w-[480px]">
            <div className="absolute inset-[7%] rounded-full bg-[var(--primary)]/15 blur-[75px]" />
            <motion.div
              animate={reduceMotion ? undefined : { rotate: 360 }}
              className="absolute inset-[3%] rounded-full border border-dashed border-[var(--primary)]/30"
              transition={{ duration: 52, ease: 'linear', repeat: Infinity }}
            />
            <motion.div
              animate={reduceMotion ? undefined : { rotate: -360 }}
              className="absolute inset-[17%] rounded-full border border-[var(--yellow)]/20"
              transition={{ duration: 42, ease: 'linear', repeat: Infinity }}
            />
            <div className="absolute inset-[30%] grid place-items-center rounded-full border border-[var(--primary)]/60 bg-[var(--card)] shadow-[0_0_70px_rgba(255,0,107,0.32),inset_0_0_36px_rgba(255,0,107,0.16)]">
              <Orbit className="h-14 w-14 text-[var(--yellow)] sm:h-20 sm:w-20" strokeWidth={1.2} />
            </div>
            {[
              { Icon: Compass, position: 'left-[3%] top-[11%]', tint: 'text-[#F472B6]' },
              { Icon: Sparkles, position: 'right-[2%] top-[23%]', tint: 'text-[var(--yellow)]' },
              { Icon: Orbit, position: 'bottom-[7%] right-[17%]', tint: 'text-[#A78BFA]' },
            ].map(({ Icon, position, tint }, index) => (
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                className={`absolute grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:h-20 sm:w-20 ${position} ${tint}`}
                key={position}
                transition={{ duration: 4.5 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.6 }}
              >
                <Icon size={28} strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl scroll-mt-28 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-32" aria-labelledby="about-story">
        <motion.div className="relative order-2 mx-auto flex h-[300px] w-full max-w-[520px] items-center justify-center sm:h-[420px] lg:order-1" {...reveal()}>
          <div aria-hidden="true" className="absolute inset-8 rounded-full bg-[var(--raspberry)]/20 blur-3xl" />
          <div className="relative h-[235px] w-[235px] sm:h-[320px] sm:w-[320px]">
            <div className="absolute inset-0 rotate-[-12deg] rounded-[36px] border border-[#A78BFA]/40 bg-[#A78BFA]/10" />
            <div className="absolute inset-0 rotate-[11deg] rounded-[36px] border border-[var(--primary)]/45 bg-[var(--primary)]/10" />
            <div className="absolute inset-5 grid place-content-center rounded-[30px] border border-[var(--border)] bg-[var(--card)]/95 p-7 text-center shadow-[0_25px_80px_rgba(0,0,0,0.42)]">
              <Sparkles aria-hidden="true" className="mx-auto mb-5 text-[var(--yellow)]" size={37} strokeWidth={1.3} />
              <span className="font-orbitron text-xl font-black tracking-tight text-[var(--cream)] sm:text-2xl">Discover.<br />Create.<br /><span className="text-[var(--primary)]">Belong.</span></span>
            </div>
          </div>
        </motion.div>
        <motion.div className="order-1 min-w-0 lg:order-2" {...reveal(0.1)}>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[var(--yellow)]">Our Story</p>
          <h2 className="font-orbitron text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl" id="about-story">
            Built by Fans.{' '}<br /><span className="gradient-signature gradient-text">Made for Every Fandom.</span>
          </h2>
          <div className="mt-8 space-y-5 border-l-2 border-[var(--primary)]/55 pl-5 text-sm leading-8 text-[var(--muted)] sm:pl-7 sm:text-base">
            <p>Fan Hub Plus is more than a platform {'\u2014'} it's a universe where different fandoms come together. From anime and gaming to movies, K-Pop, comics and beyond, we believe every passion deserves a place to belong.</p>
            <p>Created by three developers with a shared vision, Fan Hub Plus brings discovery, creativity and community together in one immersive digital experience.</p>
          </div>
        </motion.div>
      </section>

      <section className="relative scroll-mt-28 border-y border-[var(--border)] bg-[var(--nav)]/45 px-4 py-24 sm:px-6 lg:py-32" aria-labelledby="about-team">
        <div className="mx-auto max-w-7xl">
          <motion.div className="mb-12 max-w-2xl" {...reveal()}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[var(--yellow)]">Meet the Minds</p>
            <h2 className="font-orbitron text-3xl font-black sm:text-5xl" id="about-team">Three Minds. <span className="gradient-signature gradient-text">One Universe.</span></h2>
            <p className="mt-5 text-base text-[var(--muted)]">Meet the developers bringing Fan Hub Plus to life.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {TEAM.map((person, index) => (
              <motion.article
                className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface)]/75 p-3 shadow-[0_22px_60px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-[var(--primary)]/60 hover:shadow-[0_18px_65px_rgba(255,0,107,0.17)] ${reduceMotion ? '' : 'hover:-translate-y-1'}`}
                key={person.name}
                {...reveal(index * 0.08)}
              >
                <div className="relative aspect-[5/4] overflow-hidden rounded-[18px] border border-[var(--border)] bg-[radial-gradient(circle_at_50%_28%,rgba(255,0,107,0.2),transparent_48%),linear-gradient(145deg,#390B2B,#230018)] md:aspect-[4/4] lg:aspect-[5/4]">
                  {person.photo ? <img alt={`${person.name} portrait`} className="h-full w-full object-cover" src={person.photo} /> : <div className="flex h-full flex-col items-center justify-center gap-4 text-[var(--muted)]"><div className="grid h-24 w-24 place-items-center rounded-full border border-[var(--primary)]/35 bg-[var(--primary)]/10 shadow-[0_0_40px_rgba(255,0,107,0.16)]"><UserRound aria-hidden="true" className="text-[var(--cream)]/75" size={42} strokeWidth={1.2} /></div><span className="text-[10px] font-bold uppercase tracking-[0.22em]">Portrait coming soon</span></div>}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[18px] border border-transparent transition-colors duration-300 group-hover:border-[var(--primary)]/40" />
                </div>
                <div className="flex flex-1 flex-col px-4 pb-5 pt-7 sm:px-5">
                  <h3 className="font-orbitron text-xl font-black text-[var(--cream)]">{person.name}</h3>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--yellow)]">{person.title}</p>
                  <p className="mt-5 flex-1 text-sm leading-7 text-[var(--muted)]">{person.introduction}</p>
                  {person.linkedin && <a aria-label={`${person.name} on LinkedIn`} className="mt-7 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--cream)] transition-colors hover:border-[var(--yellow)] hover:text-[var(--yellow)]" href={person.linkedin} rel="noopener noreferrer" target="_blank"><FaLinkedin aria-hidden="true" size={18} /></a>}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl scroll-mt-28 px-4 py-24 sm:px-6 lg:py-32" aria-labelledby="about-universe">
        <motion.div className="mb-11 flex flex-wrap items-end justify-between gap-6" {...reveal()}>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[var(--yellow)]">Find Your Place</p>
            <h2 className="font-orbitron text-3xl font-black sm:text-5xl" id="about-universe">Explore Our <span className="gradient-signature gradient-text">Universe.</span></h2>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-[var(--yellow)] transition-colors hover:text-[var(--primary)]" to="/explore">View all fandoms <ArrowRight aria-hidden="true" size={17} /></Link>
        </motion.div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {CATEGORIES.map((category, index) => (
            <motion.div className="min-w-0" key={category.slug} {...reveal((index % 4) * 0.055)}>
              <Link className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--primary)]/70 hover:shadow-[0_0_35px_rgba(255,0,107,0.2)]" to={`/explore/${category.slug}`}>
                <img alt="" className={`h-full w-full object-cover transition-transform duration-500 ${reduceMotion ? '' : 'group-hover:scale-105'}`} loading="lazy" src={category.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#180012] via-[#180012]/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-5"><div className="min-w-0"><p className="font-orbitron text-sm font-black text-[#FFF3DE] sm:text-xl">{category.name}</p><p className="mt-1 hidden text-xs text-[#FFF3DE]/75 sm:line-clamp-2">{category.description}</p></div><ArrowUpRight aria-hidden="true" className="shrink-0 text-[#FFE347]" size={18} /></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="scroll-mt-28 border-y border-[var(--border)] bg-[var(--nav)]/45 px-4 py-20 sm:px-6 lg:py-24" aria-labelledby="about-tech">
        <div className="mx-auto max-w-7xl">
          <motion.div className="mb-9 text-center" {...reveal()}><p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[var(--yellow)]">Behind the Build</p><h2 className="font-orbitron text-3xl font-black sm:text-4xl" id="about-tech">Built with <span className="gradient-signature gradient-text">Purpose.</span></h2></motion.div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {TECHNOLOGIES.map(({ name, Icon, color }, index) => <motion.div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/55 px-4 py-5 transition-colors hover:border-[var(--primary)]/50" key={name} {...reveal(index * 0.06)}><Icon aria-hidden="true" className="shrink-0" color={color} size={27} /><span className="text-sm font-bold text-[var(--cream)]">{name}</span></motion.div>)}
          </div>
        </div>
      </section>

      <section className="scroll-mt-28 px-4 py-24 sm:px-6 lg:py-32" aria-labelledby="about-join">
        <motion.div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-[var(--primary)]/35 bg-[radial-gradient(ellipse_at_50%_0%,rgba(153,0,77,0.5),transparent_65%),linear-gradient(140deg,#390B2B,#230018)] px-5 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:px-10 sm:py-20" {...reveal()}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[25px] border border-[var(--cream)]/10" />
          <Sparkles aria-hidden="true" className="relative mx-auto mb-5 text-[#FFE347]" size={31} strokeWidth={1.4} />
          <h2 className="relative font-orbitron text-3xl font-black text-[#FFF3DE] sm:text-5xl" id="about-join">Your Fandom. <span className="gradient-signature gradient-text">Your Universe.</span></h2>
          <p className="relative mx-auto mt-6 max-w-xl text-sm leading-7 text-[#FFF3DE]/75 sm:text-base">Discover what you love, explore new worlds and become part of a community where every fandom belongs.</p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3"><Link className="btn-primary inline-flex items-center gap-2 font-bold" to="/explore">Explore Fandoms <ArrowUpRight aria-hidden="true" size={17} /></Link><Link className="inline-flex items-center gap-2 rounded-xl border border-[#FFE347]/75 px-6 py-3 font-bold text-[#FFE347] transition-colors hover:bg-[#FFE347]/10" to="/register">Join the Community <ArrowRight aria-hidden="true" size={17} /></Link></div>
        </motion.div>
      </section>
    </div>
  )
}

export default About
