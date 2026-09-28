import { Link } from 'react-router-dom'

export default function Logo({ className = '' }) {
  return (
    <Link
      aria-label="Fan Hub Plus home"
      className={`brand-logo inline-flex flex-col items-start ${className}`}
      to="/"
    >
      <div className="flex items-center gap-0.5 text-3xl font-extrabold tracking-tighter leading-none">
        <span className="text-cream">Fan</span>
        <span className="text-primary">H</span>
        <span
          className="relative inline-block h-[32px] w-[27px] bg-primary mx-0.5"
          style={{ clipPath: 'polygon(0 0, 50% 30%, 100% 0, 100% 78%, 50% 100%, 0 78%)' }}
        >
          <span className="absolute left-[9px] top-[12px] h-[9px] w-[9px] rotate-45 bg-yellow"></span>
        </span>
        <span className="text-primary">b</span>
        <span className="self-start text-[22px] text-yellow">+</span>
      </div>
      <span className="mt-1 text-[9px] font-medium tracking-wide text-muted">
        DIFFERENT FANDOMS. SAME HOME.
      </span>
    </Link>
  )
}