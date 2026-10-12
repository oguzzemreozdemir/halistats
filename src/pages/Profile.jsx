import { useState } from 'react'
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

// Profil: kendi profilin (isSelf) ya da başka bir oyuncunun profili.
// Düzenle/sil, çıkış ve yönetici bölümü sadece kendi profilinde görünür.
export default function Profile({
  player,
  entries,
  players = [],
  isSelf = true,
  isAdmin = false,
  onBack,
  onLogout,
  canManage,
  onMenu,
  onResetPin,
  onExport,
}) {
  const mine = entriesForPlayer(entries, player.id)
  const agg = aggregate(mine)
  const last = lastEntry(mine)
  const recent = sortByRecent(mine).slice(0, isSelf ? 10 : 5)
  const byLoc = statsByLocation(mine)
  const byPos = statsByPosition(mine)
  const byMode = statsByMode(mine)

  return (
    <div className="space-y-6">
      {!isSelf && (
        <button
          type="button"
          onClick={onBack}
          className="-mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-slate-300"
        >
          <span className="text-[18px] leading-none">‹</span> Geri
        </button>
      )}

      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl border border-field-border bg-field-card/70 p-5 shadow-card">
        <div className="field-stripes pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex items-center gap-4">
          <Avatar name={player.name} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate font-display text-[24px] font-extrabold capitalize text-white">
                {player.name}
              </div>
              {player.isConclave && (
                <span className="rounded-md bg-grass/15 px-1.5 py-0.5 text-[10.5px] font-semibold text-grass">
                  Conclave
                </span>
              )}
            </div>
            <div className="text-[12.5px] text-slate-400">
              {last
                ? `Son maç: ${relativeDateLabel(last.matchDate)} · ${last.city} / ${last.district}`
                : 'Henüz maç yok'}
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

      {/* Recent */}
      <section>
        <SectionHeader title={isSelf ? 'Son Maçların' : 'Son Maçları'} />
        <div className="space-y-2.5">
          {recent.length === 0 && <p className="text-[13px] text-slate-500">Henüz kayıt yok.</p>}
          {recent.map((e, i) => (
            <EntryCard
              key={e.id}
              entry={e}
              index={i}
              playerName={player.name}
              onMenu={canManage && canManage(e) ? onMenu : undefined}
            />
          ))}
        </div>
      </section>

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

      {isSelf && isAdmin && (
        <AdminPanel
          players={players}
          selfId={player.id}
          matchCount={entries.length}
          onResetPin={onResetPin}
          onExport={onExport}
        />
      )}

      {isSelf && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 text-[15px] font-semibold text-red-300 active:bg-red-500/20"
        >
          Çıkış Yap
        </motion.button>
      )}
    </div>
  )
}

// ── Sadece yöneticinin gördüğü bölüm ─────────────────────────────────────
function AdminPanel({ players, selfId, matchCount, onResetPin, onExport }) {
  const resettable = players.filter((p) => p.claimed && p.id !== selfId)
  const [target, setTarget] = useState('')
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!target) return setStatus({ type: 'err', msg: 'Önce bir oyuncu seç.' })
    if (!/^\d{6}$/.test(pin)) return setStatus({ type: 'err', msg: 'PIN 6 haneli rakam olmalı.' })
    setBusy(true)
    setStatus({ type: '', msg: '' })
    try {
      await onResetPin(target, pin)
      const name = players.find((p) => p.id === target)?.name
      setStatus({ type: 'ok', msg: `${name} için yeni PIN: ${pin}. Ona ilet.` })
      setPin('')
    } catch (e) {
      setStatus({ type: 'err', msg: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-3xl border border-grass/25 bg-grass/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-grass/15 px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-grass">
          Yönetici
        </span>
        <span className="text-[12px] text-slate-400">Sadece sen görüyorsun</span>
      </div>

      <div className="text-[13px] font-semibold text-white">PIN sıfırla</div>
      <p className="mb-2.5 mt-0.5 text-[12px] text-slate-500">
        PIN'ini unutan oyuncuya geçici bir PIN ver.
      </p>
      {resettable.length === 0 ? (
        <p className="text-[12.5px] text-slate-500">Henüz sıfırlanabilecek hesap yok.</p>
      ) : (
        <>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-xl border border-field-border bg-field-card px-3.5 py-2.5 text-[14px] capitalize text-white"
          >
            <option value="">Oyuncu seç…</option>
            {resettable.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="mt-2 flex gap-2">
            <input
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Yeni 6 haneli PIN"
              className="min-w-0 flex-1 rounded-xl border border-field-border bg-field-card px-3.5 py-2.5 text-[14px] tracking-widest text-white placeholder:tracking-normal placeholder:text-slate-600"
            />
            <button
              disabled={busy}
              onClick={submit}
              className="rounded-xl bg-grass px-4 text-[14px] font-bold text-field-bg disabled:opacity-60"
            >
              {busy ? '…' : 'Sıfırla'}
            </button>
          </div>
        </>
      )}
      {status.msg && (
        <p className={`mt-2 text-[12.5px] ${status.type === 'ok' ? 'text-grass' : 'text-red-300'}`}>
          {status.msg}
        </p>
      )}

      <div className="my-4 h-px bg-field-line" />

      <div className="text-[13px] font-semibold text-white">Yedek al</div>
      <p className="mb-2.5 mt-0.5 text-[12px] text-slate-500">
        Tüm maçları ({matchCount}) Excel'de açılabilen bir dosya olarak indir. Ayda bir almak yeterli.
      </p>
      <button
        onClick={onExport}
        className="w-full rounded-xl border border-grass/40 bg-grass/10 py-3 text-[14px] font-semibold text-grass"
      >
        Tüm maçları indir (CSV)
      </button>
    </section>
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
