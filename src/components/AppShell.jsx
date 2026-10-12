import { AnimatePresence, motion } from 'framer-motion'
import TopTabs from './TopTabs'

// App chrome: header + segmented top nav + animated page area.
export default function AppShell({ tabs, active, onChange, playerName, children, pageKey }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-field-bg px-4 pt-[max(14px,env(safe-area-inset-top))] pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <div>
              <div className="font-display text-[19px] font-extrabold leading-none text-white">
                Halı<span className="text-grass">Stats</span>
              </div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {playerName ? `Merhaba, ${playerName}` : 'Halısaha Tracker'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <TopTabs tabs={tabs} active={active} onChange={onChange} />
        </div>
      </header>

      {/* Page area */}
      <main className="flex-1 px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-grass/30 bg-grass/10 shadow-glow">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-grass" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        <path d="M12 9.2l2.6 1.9-1 3.1h-3.2l-1-3.1z" fill="currentColor" stroke="none" />
      </svg>
    </div>
  )
}
