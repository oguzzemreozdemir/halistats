import { motion } from 'framer-motion'
import Avatar from './Avatar'
import { relativeDateLabel, matchTypeLabel, isConclave } from '../utils/calculations'

// Recent-activity card. Goals & assists are visually emphasized.
export default function EntryCard({ entry, playerName, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), type: 'spring', stiffness: 300, damping: 28 }}
      className="flex items-center gap-3 rounded-2xl border border-field-border bg-field-card/70 px-3.5 py-3 backdrop-blur-sm shadow-soft"
    >
      <Avatar name={playerName} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-[15px] font-bold capitalize text-white">
            {playerName}
          </span>
          <span className="truncate text-[12px] text-slate-400">
            {entry.city} / {entry.district}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="rounded-md bg-field-cardhi px-1.5 py-0.5 text-slate-300">
            {entry.position}
          </span>
          <span className="rounded-md bg-field-cardhi px-1.5 py-0.5 text-slate-300">
            {entry.matchMode}
          </span>
          <span
            className={`rounded-md px-1.5 py-0.5 ${
              isConclave(entry) ? 'bg-grass/15 text-grass' : 'bg-field-cardhi text-slate-300'
            }`}
          >
            {matchTypeLabel(entry.matchType)}
          </span>
          <span>· {relativeDateLabel(entry.matchDate)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-1">
        <div className="text-right">
          <div className="font-display text-[22px] font-extrabold leading-none tabular text-grass">
            {entry.goals}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Gol
          </div>
        </div>
        <div className="h-8 w-px bg-field-line" />
        <div className="text-right">
          <div className="font-display text-[22px] font-extrabold leading-none tabular text-emerald2">
            {entry.assists}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Asist
          </div>
        </div>
      </div>
    </motion.div>
  )
}
