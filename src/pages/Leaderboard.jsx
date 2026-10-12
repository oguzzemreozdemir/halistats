import { useState } from 'react'
import ChipSelect from '../components/ChipSelect'
import LeaderboardTable from '../components/LeaderboardTable'
import { leaderboard, goalsPerMatch, goalsByMode, entriesForPlayer } from '../utils/calculations'

const METRICS = [
  { value: 'goals', label: 'Gol' },
  { value: 'katGol', label: 'Katsayılı Gol' },
  { value: 'assists', label: 'Asist' },
  { value: 'ga', label: 'G+A' },
  { value: 'golMac', label: 'Gol/Maç' },
]

const VALUE_LABEL = {
  goals: 'Gol',
  katGol: 'Katsayılı Gol',
  assists: 'Asist',
  ga: 'G+A',
  golMac: 'Gol/Maç',
}

// Compact secondary line per tab. Needs `entries` for the Katsayılı breakdown.
function secondaryFor(metric, entries) {
  return (row) => {
    const a = row.agg
    const base = `${a.entries} maç · ${a.goals}G · ${a.assists}A · ${a.ga} G+A`
    if (metric === 'golMac') return base
    if (metric === 'katGol') {
      const g = goalsByMode(entriesForPlayer(entries, row.player.id))
      return `${a.goals}G toplam · Laubali ${g.Laubali} · Normal ${g.Normal} · Tryhard ${g.Tryhard}`
    }
    return `${base} · ${goalsPerMatch(a).toFixed(2)} Gol/Maç`
  }
}

export default function Leaderboard({ entries, players, currentPlayerId, onOpenProfile }) {
  const [metric, setMetric] = useState('goals')
  // Hiç maçı olmayan (yeni açılmış) hesaplar listeyi kalabalıklaştırmasın.
  const rows = leaderboard(entries, players, metric).filter((r) => r.agg.entries > 0)
  const formatValue =
    metric === 'golMac' || metric === 'katGol' ? (v) => (v || 0).toFixed(2) : (v) => v

  return (
    <div className="space-y-4">
      <ChipSelect
        options={METRICS}
        value={metric}
        onChange={setMetric}
        containerClass="flex flex-wrap gap-2"
      />
      {metric === 'katGol' && (
        <div className="rounded-xl border border-grass/25 bg-grass/8 px-3.5 py-2.5 text-[12px] text-slate-300">
          <span className="font-semibold text-grass">Katsayılar:</span> Laubali ×0.75 · Normal
          ×1.00 · Tryhard ×1.25
        </div>
      )}
      <LeaderboardTable
        rows={rows}
        valueLabel={VALUE_LABEL[metric]}
        formatValue={formatValue}
        secondaryFn={secondaryFor(metric, entries)}
        highlightId={currentPlayerId}
        onRowClick={onOpenProfile}
      />
    </div>
  )
}
