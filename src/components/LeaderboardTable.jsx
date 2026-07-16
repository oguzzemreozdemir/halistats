import { motion } from 'framer-motion'
import Avatar from './Avatar'

const RANK_TONE = ['text-grass', 'text-emerald2', 'text-teal-300']

// rows: [{ player, value, agg }] sorted desc. secondaryFn(row)->string
// formatValue(value)->displayable (e.g. 2-decimal for goals/match)
//
// No animated progress fill — it overlapped the row text. Just a clean premium
// card with a subtle staggered fade-in so text is always readable.
export default function LeaderboardTable({ rows, valueLabel, secondaryFn, highlightId, formatValue }) {
  return (
    <div className="space-y-2">
      {rows.map((row, i) => {
        const isMe = highlightId && row.player.id === highlightId
        return (
          <motion.div
            key={row.player.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.045, 0.27), type: 'spring', stiffness: 300, damping: 28 }}
            className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 backdrop-blur-sm shadow-soft ${
              isMe ? 'border-grass/50 bg-grass/10' : 'border-field-border bg-field-card/70'
            }`}
          >
            <div
              className={`w-6 shrink-0 text-center font-display text-[18px] font-extrabold tabular ${
                RANK_TONE[i] || 'text-slate-500'
              }`}
            >
              {i + 1}
            </div>
            <Avatar name={row.player.name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="font-display text-[15px] font-bold capitalize text-white">
                {row.player.name}
              </div>
              {secondaryFn && (
                <div className="mt-0.5 text-[11px] leading-snug text-slate-400">{secondaryFn(row)}</div>
              )}
            </div>
            <div className="shrink-0 pl-2 text-right">
              <div className="font-display text-[24px] font-extrabold leading-none tabular text-white">
                {formatValue ? formatValue(row.value) : row.value}
              </div>
              {valueLabel && (
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  {valueLabel}
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
