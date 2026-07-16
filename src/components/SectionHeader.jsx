export default function SectionHeader({ title, action, className = '' }) {
  return (
    <div className={`flex items-end justify-between mb-3 ${className}`}>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </h2>
      {action}
    </div>
  )
}
