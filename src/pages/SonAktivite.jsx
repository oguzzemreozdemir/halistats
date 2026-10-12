import EntryCard from '../components/EntryCard'
import SectionHeader from '../components/SectionHeader'
import { recentEntries, playerById } from '../utils/calculations'

// Son Aktivite — recent-activity feed only (no summary / highlight sections).
export default function SonAktivite({ entries, players, onOpenProfile, canManage, onMenu }) {
  const feed = recentEntries(entries, 30) // newest first

  return (
    <div className="space-y-3">
      <SectionHeader
        title="Son Aktiviteler"
        action={<span className="text-[11px] font-medium text-slate-500">{feed.length} kayıt</span>}
      />
      <div className="space-y-2.5">
        {feed.length === 0 && (
          <p className="text-[13px] text-slate-500">Henüz maç eklenmedi.</p>
        )}
        {feed.map((e, i) => (
          <EntryCard
            key={e.id}
            entry={e}
            index={i}
            playerName={playerById(players, e.playerId)?.name || e.playerName || '?'}
            onOpenProfile={onOpenProfile}
            onMenu={canManage && canManage(e) ? onMenu : undefined}
          />
        ))}
      </div>
    </div>
  )
}
