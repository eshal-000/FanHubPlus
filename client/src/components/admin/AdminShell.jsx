import { motion } from "framer-motion";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] font-['Plus_Jakarta_Sans'] text-[var(--cream)]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-96 w-96 rounded-full bg-[var(--primary)] opacity-[0.07] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-[var(--raspberry)] opacity-[0.06] blur-[120px]"
      />
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="relative z-10 min-h-screen px-4 py-6 pt-16 sm:px-6 lg:px-8 lg:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {title && (
              <header className="mb-6 lg:pl-2">
                <h1 className="font-['Orbitron'] text-2xl font-bold tracking-wide sm:text-3xl">
                  {title.includes(" ") ? (
                    <>
                      {title.split(" ").slice(0, -1).join(" ")}{" "}
                      <span className="text-[var(--primary)]">
                        {title.split(" ").slice(-1)}
                      </span>
                    </>
                  ) : (
                    <>
                      MANAGE <span className="text-[var(--primary)]">{title}</span>
                    </>
                  )}
                </h1>
                {subtitle && <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>}
              </header>
            )}
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
