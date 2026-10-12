import { useCallback, useEffect, useMemo, useState } from 'react'
import { playerById } from './utils/calculations'
import {
  fetchMatches,
  addMatch,
  updateMatch,
  deleteMatch,
  downloadMatchesCsv,
} from './services/matchService'
import {
  fetchPlayers,
  getSessionUserId,
  signOut,
  adminResetPin,
  friendlyError,
} from './services/playerService'
import { supabase, supabaseConfigured } from './lib/supabaseClient'
import AppShell from './components/AppShell'
import Toast from './components/Toast'
import MatchMenu from './components/MatchMenu'
import Login from './pages/Login'
import AddEntry from './pages/AddEntry'
import SonAktivite from './pages/SonAktivite'
import Conclave from './pages/Conclave'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

const TABS = [
  { id: 'ekle', label: 'Ekle' },
  { id: 'sonaktivite', label: 'Son Aktivite' },
  { id: 'conclave', label: 'Conclave' },
  { id: 'liderlik', label: 'Liderlik' },
  { id: 'profil', label: 'Profil' },
]

// localStorage: sadece son konum (UI kolaylığı). Oturumu Supabase kendisi saklar.
const LS_LASTLOC = 'halistats.lastLocation'
const LEGACY_KEYS = ['halistats.playerId', 'halistats.entries'] // eski sürümden kalanlar

// ── Basit durum ekranları ───────────────────────────────────────────────────
function CenterState({ children }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center anim-fadeUp">
      {children}
    </div>
  )
}
function Spinner() {
  return <div className="h-7 w-7 animate-spin rounded-full border-2 border-field-line border-t-grass" />
}
function ErrorState({ message, onRetry }) {
  return (
    <CenterState>
      <div className="font-display text-[18px] font-extrabold text-white">Veri alınamadı</div>
      <div className="max-w-[260px] text-[13px] text-slate-400">{message}</div>
      <button
        onClick={onRetry}
        className="mt-1 rounded-2xl bg-grass px-5 py-2.5 text-[14px] font-semibold text-field-bg"
      >
        Tekrar dene
      </button>
    </CenterState>
  )
}

export default function App() {
  // ── Oyuncular + oturum ──────────────────────────────────────
  const [players, setPlayers] = useState([])
  const [bootState, setBootState] = useState('loading') // loading | ready | error
  const [bootError, setBootError] = useState('')
  const [sessionUid, setSessionUid] = useState(null)

  // ── Maç verisi ──────────────────────────────────────────────
  const [entries, setEntries] = useState([])
  const [dataState, setDataState] = useState('loading') // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)

  // ── UI durumu ───────────────────────────────────────────────
  const [tab, setTab] = useState('ekle')
  const [viewPlayerId, setViewPlayerId] = useState(null) // başkasının profili
  const [editing, setEditing] = useState(null) // düzenlenen maç
  const [menuEntry, setMenuEntry] = useState(null) // ⋯ menüsü açık olan maç
  const [menuBusy, setMenuBusy] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '' })
  const [lastLocation, setLastLocation] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_LASTLOC) || 'null')
    } catch {
      return null
    }
  })

  const me = useMemo(
    () => (sessionUid ? players.find((p) => p.userId === sessionUid) || null : null),
    [players, sessionUid],
  )

  const showToast = (message, ms = 2200) => {
    setToast({ show: true, message })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), ms)
  }

  // ── Açılış: oyuncu listesi + kayıtlı oturum ─────────────────
  const boot = useCallback(async () => {
    setBootState('loading')
    setBootError('')
    try {
      const [ps, uid] = await Promise.all([fetchPlayers(), getSessionUserId()])
      setPlayers(ps)
      setSessionUid(uid)
      setBootState('ready')
    } catch (err) {
      console.error('[App.boot]', err)
      setBootError(
        supabaseConfigured ? friendlyError(err) : 'Supabase yapılandırılmadı (.env eksik).',
      )
      setBootState('error')
    }
  }, [])

  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k))
    } catch {
      /* ignore */
    }
    boot()
    if (!supabaseConfigured) return undefined
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUid(session?.user?.id || null)
    })
    return () => data.subscription.unsubscribe()
  }, [boot])

  // ── Maçları (ve güncel oyuncu listesini) çek ────────────────
  const loadMatches = useCallback(async () => {
    setDataState('loading')
    setErrorMsg('')
    try {
      const [rows, ps] = await Promise.all([fetchMatches(), fetchPlayers()])
      setEntries(rows)
      setPlayers(ps)
      setDataState('ready')
    } catch (err) {
      console.error('[App.loadMatches]', err)
      setErrorMsg(friendlyError(err))
      setDataState('error')
    }
  }, [])

  const meId = me?.id
  useEffect(() => {
    if (meId) loadMatches()
  }, [meId, loadMatches])

  // ── Giriş / çıkış ───────────────────────────────────────────
  const handleLoggedIn = async () => {
    const [ps, uid] = await Promise.all([fetchPlayers(), getSessionUserId()])
    setPlayers(ps)
    setSessionUid(uid)
    setTab('ekle')
    setViewPlayerId(null)
    setEditing(null)
  }

  const handleLogout = async () => {
    await signOut()
    setSessionUid(null)
    setEntries([])
    setTab('ekle')
    setViewPlayerId(null)
    setEditing(null)
  }

  // ── Gezinme ─────────────────────────────────────────────────
  const changeTab = (t) => {
    setTab(t)
    setViewPlayerId(null)
    setEditing(null)
  }

  const openProfile = (pid) => {
    if (!pid) return
    if (pid === meId) {
      setViewPlayerId(null)
      setTab('profil')
    } else {
      setViewPlayerId(pid)
    }
    setEditing(null)
    window.scrollTo({ top: 0 })
  }

  // ── Yetki ───────────────────────────────────────────────────
  const isOwn = (e) => !!me && e.playerId === me.id
  const canManage = (e) => isOwn(e) || !!me?.isAdmin // ⋯ menüsü görünür mü

  // ── Yeni maç ekle ───────────────────────────────────────────
  const handleSave = async (draft) => {
    setSaving(true)
    try {
      const saved = await addMatch({
        ...draft,
        playerId: me.id,
        playerName: me.name,
        matchType: me.isConclave ? draft.matchType : 'personal',
      })
      setEntries((prev) => [saved, ...prev])
      const loc = { city: draft.city, district: draft.district }
      setLastLocation(loc)
      try {
        localStorage.setItem(LS_LASTLOC, JSON.stringify(loc))
      } catch {
        /* ignore */
      }
      showToast(`Kaydedildi · ${draft.goals} gol · ${draft.assists} asist`)
    } catch (err) {
      console.error('[App.handleSave]', err)
      showToast(`Kaydedilemedi: ${friendlyError(err)}`, 3200)
    } finally {
      setSaving(false)
    }
  }

  // ── Düzenle ─────────────────────────────────────────────────
  const handleEditSave = async (draft) => {
    if (!editing) return
    setSaving(true)
    try {
      const updated = await updateMatch(editing.id, {
        ...draft,
        matchType: me.isConclave ? draft.matchType : 'personal',
      })
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      setEditing(null)
      showToast('Maç güncellendi')
    } catch (err) {
      console.error('[App.handleEditSave]', err)
      showToast(`Güncellenemedi: ${friendlyError(err)}`, 3200)
    } finally {
      setSaving(false)
    }
  }

  // ── Sil ─────────────────────────────────────────────────────
  const handleDelete = async (entry) => {
    setMenuBusy(true)
    try {
      await deleteMatch(entry.id)
      setEntries((prev) => prev.filter((e) => e.id !== entry.id))
      setMenuEntry(null)
      showToast('Maç silindi')
    } catch (err) {
      console.error('[App.handleDelete]', err)
      showToast(`Silinemedi: ${friendlyError(err)}`, 3200)
    } finally {
      setMenuBusy(false)
    }
  }

  // ── Giriş yapılmadı ─────────────────────────────────────────
  if (!me) {
    return (
      <Login
        players={players}
        loading={bootState === 'loading'}
        loadError={bootState === 'error' ? bootError : ''}
        onRetry={boot}
        onLoggedIn={handleLoggedIn}
      />
    )
  }

  // ── Sayfa içeriği ───────────────────────────────────────────
  const renderPage = () => {
    if (editing) {
      return (
        <AddEntry
          key={`edit-${editing.id}`}
          player={me}
          lastLocation={lastLocation}
          initialEntry={editing}
          onSave={handleEditSave}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      )
    }
    // Conclave üyesi olmayan biri bir şekilde Conclave'e düşerse Ekle'ye yönlendir.
    if (!viewPlayerId && (tab === 'ekle' || (tab === 'conclave' && !me.isConclave))) {
      return <AddEntry player={me} lastLocation={lastLocation} onSave={handleSave} saving={saving} />
    }
    if (dataState === 'loading') {
      return (
        <CenterState>
          <Spinner />
          <div className="text-[13px] text-slate-400">Yükleniyor…</div>
        </CenterState>
      )
    }
    if (dataState === 'error') {
      return <ErrorState message={errorMsg} onRetry={loadMatches} />
    }

    if (viewPlayerId) {
      const other = playerById(players, viewPlayerId)
      if (other) {
        return (
          <Profile
            player={other}
            entries={entries}
            isSelf={false}
            onBack={() => setViewPlayerId(null)}
            canManage={canManage}
            onMenu={setMenuEntry}
          />
        )
      }
    }

    switch (tab) {
      case 'sonaktivite':
        return (
          <SonAktivite
            entries={entries}
            players={players}
            onOpenProfile={openProfile}
            canManage={canManage}
            onMenu={setMenuEntry}
          />
        )
      case 'conclave':
        return <Conclave entries={entries} players={players} onOpenProfile={openProfile} />
      case 'liderlik':
        return (
          <Leaderboard
            entries={entries}
            players={players}
            currentPlayerId={me.id}
            onOpenProfile={openProfile}
          />
        )
      case 'profil':
        return (
          <Profile
            player={me}
            entries={entries}
            players={players}
            isSelf
            isAdmin={me.isAdmin}
            onLogout={handleLogout}
            canManage={canManage}
            onMenu={setMenuEntry}
            onResetPin={adminResetPin}
            onExport={() => downloadMatchesCsv(entries, players)}
          />
        )
      default:
        return null
    }
  }

  const pageKey = editing ? `edit-${editing.id}` : viewPlayerId ? `p-${viewPlayerId}` : tab
  // Conclave sekmesi sadece Conclave üyelerine (dörtlü) görünür.
  const visibleTabs = me.isConclave ? TABS : TABS.filter((t) => t.id !== 'conclave')

  return (
    <>
      <AppShell tabs={visibleTabs} active={tab} onChange={changeTab} playerName={me.name} pageKey={pageKey}>
        {renderPage()}
      </AppShell>
      <MatchMenu
        entry={menuEntry}
        canEdit={!!menuEntry && isOwn(menuEntry)}
        canDelete={!!menuEntry && canManage(menuEntry)}
        busy={menuBusy}
        onEdit={(e) => {
          setMenuEntry(null)
          setViewPlayerId(null)
          setEditing(e)
          window.scrollTo({ top: 0 })
        }}
        onDelete={handleDelete}
        onClose={() => setMenuEntry(null)}
      />
      <Toast show={toast.show} message={toast.message} />
    </>
  )
}
