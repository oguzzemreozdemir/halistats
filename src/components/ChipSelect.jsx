import { motion } from 'framer-motion'

// Tactile chip selector. options: string[] | {value,label}[]
// containerClass lets the parent choose grid/flow layout with static classes.
export default function ChipSelect({ options, value, onChange, containerClass = 'flex flex-wrap gap-2' }) {
  const opts = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  )

  return (
    <div className={containerClass}>
      {opts.map((o) => {
        const active = value === o.value
        return (
          <motion.button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`relative shrink-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-center text-[13.5px] font-semibold transition-colors duration-200 border ${
              active
                ? 'border-grass/60 bg-grass/15 text-grass shadow-glow'
                : 'border-field-border bg-field-card/60 text-slate-300 hover:border-field-line'
            }`}
          >
            {o.label}
          </motion.button>
        )
      })}
    </div>
  )
}
