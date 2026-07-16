import { motion } from 'framer-motion'
import Avatar from '../components/Avatar'
import StatCard from '../components/StatCard'
import EntryCard from '../components/EntryCard'
import SectionHeader from '../components/SectionHeader'
import {
  aggregate,
  entriesForPlayer,
  sortByRecent,
  lastEntry,
  statsByLocation,
  statsByPosition,
  statsByMode,
  relativeDateLabel,
} from '../utils/calculations'

function MiniRow({ label, agg }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-field-border bg-field-card/60 px-3.5 py-2.5">
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold text-white">{label}</div>
        <div className="text-[11.5px] text-slate-400">
          {agg.entries} maç · {agg.goals} gol · {agg.assists} asist
        </div>
      </div>
      <div className="pl-3 font-display text-[17px] font-extrabold tabular text-grass">
        {agg.ga}
      </div>
    </div>
  )
}

export default function Profile({ player, entries, onLogout }) {
  const mine = entriesForPlayer(entries, player.id)
  const agg = aggregate(mine)
  const last = lastEntry(mine)
  const last5 = sortByRecent(mine).slice(0, 5)
  const byLoc = statsByLocation(mine)
  const byPos = statsByPosition(mine)
  const byMode = statsByMode(mine)

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl border border-field-border bg-field-card/70 p-5 backdrop-blur-sm shadow-card">
        <div className="field-stripes pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex items-center gap-4">
          <Avatar name={player.name} size="lg" />
          <div>
            <div className="font-display text-[24px] font-extrabold capitalize text-white">
              {player.name}
            </div>
            <div className="text-[12.5px] text-slate-400">
              {last ? `Son maç: ${relativeDateLabel(last.matchDate)} · ${last.city} / ${last.district}` : 'Henüz maç yok'}
            </div>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-3">
          <Mini label="Gol" value={agg.goals} accent />
          <Mini label="Asist" value={agg.assists} />
          <Mini label="G+A" value={agg.ga} />
        </div>
      </div>

      {/* Averages */}
      <section>
        <SectionHeader title="Maç Başı" />
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Gol" value={agg.avgGoals} />
          <StatCard label="Asist" value={agg.avgAssists} />
          <StatCard label="G+A" value={agg.avgGa} />
        </div>
        <div className="mt-3">
          <StatCard label="Toplam Maç" value={agg.entries} />
        </div>
      </section>

      {/* Last 5 */}
      <section>
        <SectionHeader title="Son 5 Kayıt" />
        <div className="space-y-2.5">
          {last5.length === 0 && (
            <p className="text-[13px] text-slate-500">Henüz kayıt yok.</p>
          )}
          {last5.map((e, i) => (
            <EntryCard key={e.id} entry={e} index={i} playerName={player.name} />
          ))}
        </div>
      </section>

      {/* By location */}
      {byLoc.length > 0 && (
        <section>
          <SectionHeader title="Konuma Göre" />
          <div className="space-y-2">
            {byLoc.map((r) => (
              <MiniRow key={r.key} label={r.label} agg={r.agg} />
            ))}
          </div>
        </section>
      )}

      {/* By position */}
      {byPos.length > 0 && (
        <section>
          <SectionHeader title="Mevkiye Göre" />
          <div className="space-y-2">
            {byPos.map((r) => (
              <MiniRow key={r.key} label={r.label} agg={r.agg} />
            ))}
          </div>
        </section>
      )}

      {/* By mode */}
      {byMode.length > 0 && (
        <section>
          <SectionHeader title="Maç Moduna Göre" />
          <div className="space-y-2">
            {byMode.map((r) => (
              <MiniRow key={r.key} label={r.label} agg={r.agg} />
            ))}
          </div>
        </section>
      )}

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onLogout}
        className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 text-[15px] font-semibold text-red-300 active:bg-red-500/20"
      >
        Çıkış Yap
      </motion.button>
    </div>
  )
}

function Mini({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-field-border bg-field-cardhi/60 px-3 py-2.5 text-center">
      <div
        className={`font-display text-[26px] font-extrabold leading-none tabular ${
          accent ? 'text-grass' : 'text-white'
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  )
}
