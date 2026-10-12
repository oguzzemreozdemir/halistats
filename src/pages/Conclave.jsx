import { motion } from 'framer-motion'
import Avatar from '../components/Avatar'
import StatCard from '../components/StatCard'
import PlayerCard from '../components/PlayerCard'
import SectionHeader from '../components/SectionHeader'
import {
  aggregate,
  conclaveEntries,
  entriesForPlayer,
  topBy,
  statsByLocation,
  statsByPosition,
  statsByMode,
} from '../utils/calculations'

// Grouped-stat row with a subtle goal bar (location / position / mode).
function StatRow({ label, agg, max }) {
  const pct = Math.max(5, Math.round((agg.goals / Math.max(1, max)) * 100))
  return (
    <div className="relative overflow-hidden rounded-2xl border border-field-border bg-field-card/70 px-3.5 py-3">
      <div className="absolute inset-y-0 left-0 bg-grass/8" style={{ width: `${pct}%` }} />
      <div className="relative flex items-center justify-between">
        <div className="min-w-0">
          <div className="truncate font-display text-[15px] font-bold text-white">{label}</div>
          <div className="mt-0.5 text-[12px] text-slate-400">
            {agg.entries} kayıt · {agg.goals} gol · {agg.assists} asist
          </div>
        </div>
        <div className="pl-3 text-right">
          <div className="font-display text-[20px] font-extrabold tabular text-grass">{agg.ga}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">G+A</div>
        </div>
      </div>
    </div>
  )
}

function ConclavePlayerRow({ name, agg, index = 0, onClick }) {
  const gpm = (agg.entries > 0 ? agg.goals / agg.entries : 0).toFixed(2)
  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, type: 'spring', stiffness: 300, damping: 28 }}
      className="flex items-center gap-3 rounded-2xl border border-field-border bg-field-card/70 px-3.5 py-3"
    >
      <Avatar name={name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="font-display text-[15px] font-bold capitalize text-white">{name}</div>
        <div className="text-[11.5px] text-slate-400">
          {agg.entries} maç · {agg.goals}G · {agg.assists}A · {agg.ga} G+A · {gpm} Gol/Maç
        </div>
      </div>
      <div className="pl-2 text-right">
        <div className="font-display text-[20px] font-extrabold tabular text-grass">{agg.ga}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500">G+A</div>
      </div>
    </motion.div>
  )
}

// Conclave page — ONLY entries where matchType === 'conclave'.
export default function Conclave({ entries, players, onOpenProfile }) {
  const ce = conclaveEntries(entries)
  const total = aggregate(ce)
  const golL = topBy(ce, players, 'goals')
  const asistL = topBy(ce, players, 'assists')
  const gaL = topBy(ce, players, 'ga')
  const gmL = topBy(ce, players, 'golMac')
  const byLoc = statsByLocation(ce)
  const byPos = statsByPosition(ce)
  const byMode = statsByMode(ce)
  const maxLoc = Math.max(1, ...byLoc.map((r) => r.agg.goals))
  const maxPos = Math.max(1, ...byPos.map((r) => r.agg.goals))
  const maxMode = Math.max(1, ...byMode.map((r) => r.agg.goals))
  const playerRows = players
    .map((p) => ({ p, agg: aggregate(entriesForPlayer(ce, p.id)) }))
    .filter((r) => r.agg.entries > 0)
    .sort((a, b) => b.agg.ga - a.agg.ga || b.agg.goals - a.agg.goals)

  if (ce.length === 0) {
    return (
      <div className="py-12 text-center text-[14px] text-slate-500">Henüz Conclave maçı yok.</div>
    )
  }

  return (
    <div className="space-y-6">
      <section>
        <SectionHeader
          title="Conclave Özeti"
          action={<span className="text-[11px] font-medium text-slate-500">sadece grup maçları</span>}
        />
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Conclave Maç" value={total.entries} />
          <StatCard label="Conclave Gol" value={total.goals} accent />
          <StatCard label="Conclave Asist" value={total.assists} />
          <StatCard label="Conclave G+A" value={total.ga} />
        </div>
      </section>

      <section>
        <SectionHeader title="Conclave Liderleri" />
        <div className="grid grid-cols-2 gap-3">
          <PlayerCard title="Gol Lideri" playerName={golL?.player.name} value={golL?.value ?? 0} valueLabel="gol" />
          <PlayerCard title="Asist Lideri" playerName={asistL?.player.name} value={asistL?.value ?? 0} valueLabel="asist" />
          <PlayerCard title="G+A Lideri" playerName={gaL?.player.name} value={gaL?.value ?? 0} valueLabel="G+A" />
          <PlayerCard title="Gol/Maç Lideri" playerName={gmL?.player.name} value={(gmL?.value ?? 0).toFixed(2)} valueLabel="Gol/Maç" />
        </div>
      </section>

      <section>
        <SectionHeader title="Oyuncu Tablosu" />
        <div className="space-y-2">
          {playerRows.map((r, i) => (
            <ConclavePlayerRow
              key={r.p.id}
              name={r.p.name}
              agg={r.agg}
              index={i}
              onClick={onOpenProfile ? () => onOpenProfile(r.p.id) : undefined}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Konuma Göre" />
        <div className="space-y-2">
          {byLoc.map((r) => (
            <StatRow key={r.key} label={r.label} agg={r.agg} max={maxLoc} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Mevkiye Göre" />
        <div className="space-y-2">
          {byPos.map((r) => (
            <StatRow key={r.key} label={r.label} agg={r.agg} max={maxPos} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Maç Moduna Göre" />
        <div className="space-y-2">
          {byMode.map((r) => (
            <StatRow key={r.key} label={r.label} agg={r.agg} max={maxMode} />
          ))}
        </div>
      </section>
    </div>
  )
}
