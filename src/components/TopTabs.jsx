import { motion } from 'framer-motion'

// iOS-style segmented control. Horizontally scrollable when tabs overflow.
// The active highlight uses framer-motion's shared-layout (layoutId), which
// slides smoothly between tabs with no manual measurement — robust on mobile.
export default function TopTabs({ tabs, active, onChange }) {
  return (
    <div className="no-scrollbar overflow-x-auto rounded-2xl border border-field-border bg-field-card/60 p-1 shadow-soft">
      <div className="flex w-max gap-1">
        {tabs.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="relative shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold"
            >
              {isActive && (
                <motion.span
                  layoutId="tab-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className="absolute inset-0 rounded-xl bg-grass/15 ring-1 ring-grass/40 shadow-glow"
                />
              )}
              <span className={`relative z-10 ${isActive ? 'text-grass' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
