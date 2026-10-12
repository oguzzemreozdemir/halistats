// Small derived-initial avatar used across cards.
// Mevcut dörtlünün renkleri sabit; yeni kullanıcılara isimden türetilen bir renk verilir.
const PALETTE = {
  ogi: 'from-grass/30 to-grass/5 text-grass border-grass/40',
  arda: 'from-emerald-400/25 to-emerald-400/5 text-emerald2 border-emerald-400/30',
  deniz: 'from-teal-400/25 to-teal-400/5 text-teal-300 border-teal-400/30',
  onur: 'from-lime-400/25 to-lime-400/5 text-lime-300 border-lime-400/30',
}

const EXTRA = [
  'from-sky-400/25 to-sky-400/5 text-sky-300 border-sky-400/30',
  'from-amber-400/25 to-amber-400/5 text-amber-300 border-amber-400/30',
  'from-rose-400/25 to-rose-400/5 text-rose-300 border-rose-400/30',
  'from-violet-400/25 to-violet-400/5 text-violet-300 border-violet-400/30',
  'from-cyan-400/25 to-cyan-400/5 text-cyan-300 border-cyan-400/30',
  'from-orange-400/25 to-orange-400/5 text-orange-300 border-orange-400/30',
  'from-fuchsia-400/25 to-fuchsia-400/5 text-fuchsia-300 border-fuchsia-400/30',
  'from-yellow-400/25 to-yellow-400/5 text-yellow-300 border-yellow-400/30',
]

function toneFor(name) {
  if (PALETTE[name]) return PALETTE[name]
  let h = 0
  for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return EXTRA[h % EXTRA.length]
}

export default function Avatar({ name = '', size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-[12px]',
    md: 'h-11 w-11 text-[15px]',
    lg: 'h-16 w-16 text-[22px]',
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border bg-gradient-to-b font-display font-bold uppercase ${toneFor(name)} ${sizes[size]}`}
    >
      {String(name).slice(0, 2)}
    </div>
  )
}
