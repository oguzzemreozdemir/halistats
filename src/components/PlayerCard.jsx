import { motion } from 'framer-motion'
import Avatar from './Avatar'

// Highlight card e.g. "Gol lideri" / "Son formda".
export default function PlayerCard({ title, playerName, value, valueLabel, hint }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-2xl border border-field-border bg-field-card/70 p-4 backdrop-blur-sm shadow-soft"
    >
      <div className="field-stripes pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <Avatar name={playerName} size="md" />
          <div className="min-w-0">
            <div className="font-display text-[17px] font-bold capitalize text-white">
              {playerName || '—'}
            </div>
            {hint && <div className="truncate text-[12px] text-slate-400">{hint}</div>}
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-[28px] font-extrabold leading-none tabular text-grass">
            {value}
          </span>
          <span className="text-[12px] text-slate-400">{valueLabel}</span>
        </div>
      </div>
    </motion.div>
  )
}
