// Small derived-initial avatar used across cards.
const PALETTE = {
  ogi: 'from-grass/30 to-grass/5 text-grass border-grass/40',
  arda: 'from-emerald-400/25 to-emerald-400/5 text-emerald2 border-emerald-400/30',
  deniz: 'from-teal-400/25 to-teal-400/5 text-teal-300 border-teal-400/30',
  onur: 'from-lime-400/25 to-lime-400/5 text-lime-300 border-lime-400/30',
}

export default function Avatar({ name = '', size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-[12px]',
    md: 'h-11 w-11 text-[15px]',
    lg: 'h-16 w-16 text-[22px]',
  }
  const tone = PALETTE[name] || 'from-slate-500/25 to-slate-500/5 text-slate-200 border-slate-500/30'
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border bg-gradient-to-b font-display font-bold uppercase ${tone} ${sizes[size]}`}
    >
      {name.slice(0, 2)}
    </div>
  )
}
