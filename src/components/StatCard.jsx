// Big-number stat tile. value is visually dominant.
export default function StatCard({ label, value, sub, accent = false, className = '' }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 shadow-soft ${
        accent
          ? 'border-grass/30 bg-grass/10'
          : 'border-field-border bg-field-card/70'
      } ${className}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>
      <div
        className={`mt-1 font-display font-extrabold leading-none tabular text-[30px] ${
          accent ? 'text-grass' : 'text-white'
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[12px] text-slate-400">{sub}</div>}
    </div>
  )
}
