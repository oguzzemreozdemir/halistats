import { motion } from 'framer-motion'

// Big plus/minus counter. Sized to fit two-per-row on narrow phones without
// the number or buttons overflowing their card.
export default function CounterInput({ label, value, onChange, min = 0, max = 30, accent = 'grass' }) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))

  const numColor = accent === 'grass' ? 'text-grass' : 'text-emerald2'

  const Btn = ({ children, onClick, disabled }) => (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl font-bold leading-none ${
        disabled
          ? 'border-field-border/60 text-slate-600'
          : 'border-field-line bg-field-cardhi text-white active:bg-grass/15'
      }`}
    >
      {children}
    </motion.button>
  )

  return (
    <div className="rounded-2xl border border-field-border bg-field-card/70 px-3 py-3 backdrop-blur-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 flex items-center justify-between gap-1.5">
        <Btn onClick={dec} disabled={value <= min}>
          −
        </Btn>
        <motion.div
          key={value}
          initial={{ scale: 0.85, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 24 }}
          className={`min-w-0 flex-1 text-center font-display text-[34px] font-extrabold leading-none tabular ${numColor}`}
        >
          {value}
        </motion.div>
        <Btn onClick={inc} disabled={value >= max}>
          +
        </Btn>
      </div>
    </div>
  )
}
