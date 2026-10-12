import { motion } from 'framer-motion'
import Avatar from './Avatar'
import { relativeDateLabel, matchTypeLabel, isConclave } from '../utils/calculations'

// Recent-activity card. Goals & assists are visually emphasized.
// - İsme/avatara dokununca o oyuncunun profili açılır (onOpenProfile).
// - Sadece kendi maçında (ya da yöneticiyse) "⋯" menüsü görünür (onMenu).
export default function EntryCard({ entry, playerName, index = 0, onOpenProfile, onMenu }) {
  const openProfile = onOpenProfile ? () => onOpenProfile(entry.playerId) : undefined
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), type: 'spring', stiffness: 300, damping: 28 }}
      className="flex items-center gap-3 rounded-2xl border border-field-border bg-field-card/70 px-3.5 py-3 shadow-soft"
    >
      <button type="button" onClick={openProfile} disabled={!openProfile} className="shrink-0">
        <Avatar name={playerName} size="md" />
      </button>

      <div className="min-w-0 flex-1">
        {/* 1. satır: isim (tek başına → tam görünür) */}
        <button
          type="button"
          onClick={openProfile}
          disabled={!openProfile}
          className="block max-w-full truncate text-left font-display text-[15px] font-bold capitalize leading-tight text-white"
        >
          {playerName}
        </button>
        {/* 2. satır: konum */}
        <div className="mt-0.5 truncate text-[12px] text-slate-400">
          {entry.city} / {entry.district}
        </div>
        {/* 3. satır: etiketler */}
        <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px]">
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
          <span className="whitespace-nowrap pl-0.5 text-slate-500">
            · {relativeDateLabel(entry.matchDate)}
          </span>
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
        {onMenu && (
          <button
            type="button"
            aria-label="Maç seçenekleri"
            onClick={() => onMenu(entry)}
            className="-mr-1.5 flex h-9 w-7 items-center justify-center rounded-lg text-[20px] leading-none text-slate-400 active:bg-field-cardhi"
          >
            ⋯
          </button>
        )}
      </div>
    </motion.div>
  )
}
