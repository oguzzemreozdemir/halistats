import { useCallback, useEffect, useMemo, useState } from 'react'
import { PLAYERS } from './data/mockData'
import { playerById } from './utils/calculations'
import { fetchMatches, addMatch } from './services/matchService'
import { supabaseConfigured } from './lib/supabaseClient'
import AppShell from './components/AppShell'
import Toast from './components/Toast'
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

// localStorage yalnızca UI tercihleri için (oyuncu seçimi + son konum).
// Maç verisi artık burada DEĞİL — tek kaynak Supabase.
const LS_PLAYER = 'halistats.playerId'
const LS_LASTLOC = 'halistats.lastLocation'
const LS_ENTRIES_LEGACY = 'halistats.entries' // eski test verisi; artık kullanılmıyor

// ── Basit durum ekranları ───────────────────────────────────────────────────
function CenterState({ children }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center anim-fadeUp">
      {children}
    </div>
  )
}
function Spinner() {
  return (
    <div className="h-7 w-7 animate-spin rounded-full border-2 border-field-line border-t-grass" />
  )
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
  // ── Oturum (mock kimlik seçimi — Supabase Auth değil) ───────
  const [playerId, setPlayerId] = useState(() => {
    try {
      return localStorage.getItem(LS_PLAYER) || null
    } catch {
      return null
    }
  })

  // ── Maç verisi: tek kaynak Supabase ─────────────────────────
  const [entries, setEntries] = useState([])
  const [dataState, setDataState] = useState('loading') // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)

  // ── UI durumu ───────────────────────────────────────────────
  const [tab, setTab] = useState('ekle')
  const [toast, setToast] = useState({ show: false, message: '' })
  const [lastLocation, setLastLocation] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_LASTLOC) || 'null')
    } catch {
      return null
    }
  })

  const player = useMemo(() => playerById(PLAYERS, playerId), [playerId])

  // Eski localStorage test verisini temizle (otomatik migrate ETME) + dev helper.
  useEffect(() => {
    try {
      localStorage.removeItem(LS_ENTRIES_LEGACY)
    } catch {
      /* ignore */
    }
    // Sadece geliştirme için; production UI'da görünmez.
    window.__halistatsClearLocal = () => {
      try {
        localStorage.removeItem(LS_PLAYER)
        localStorage.removeItem(LS_LASTLOC)
        localStorage.removeItem(LS_ENTRIES_LEGACY)
      } catch {
        /* ignore */
      }
      location.reload()
    }
  }, [])

  // Oturum kalıcılığı (sadece seçili oyuncu)
  useEffect(() => {
    try {
      if (playerId) localStorage.setItem(LS_PLAYER, playerId)
      else localStorage.removeItem(LS_PLAYER)
    } catch {
      /* ignore */
    }
  }, [playerId])

  // ── Supabase'den maçları çek ────────────────────────────────
  const loadMatches = useCallback(async () => {
    setDataState('loading')
    setErrorMsg('')
    try {
      const rows = await fetchMatches()
      setEntries(rows)
      setDataState('ready')
    } catch (err) {
      console.error('[App.loadMatches]', err)
      setErrorMsg(
        supabaseConfigured
          ? (err && err.message) || 'Bilinmeyen hata.'
          : 'Supabase yapılandırılmadı (.env eksik).',
      )
      setDataState('error')
    }
  }, [])

  // Giriş yapıldığında veriyi çek
  useEffect(() => {
    if (player) loadMatches()
  }, [player, loadMatches])

  const handleLogin = (p) => {
    setPlayerId(p.id)
    setTab('ekle')
  }
  const handleLogout = () => setPlayerId(null)

  const showToast = (message, ms = 2200) => {
    setToast({ show: true, message })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), ms)
  }

  // ── Yeni maç ekle (Supabase'e insert) ───────────────────────
  const handleSave = async (draft) => {
    setSaving(true)
    try {
      const saved = await addMatch({ ...draft, playerName: player?.name })
      // Dönen satırda DB created_at var → Son Aktivite'de en üstte görünür.
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
      showToast(`Kaydedilemedi: ${(err && err.message) || 'hata'}`, 3200)
    } finally {
      setSaving(false)
    }
  }

  // ── Giriş yapılmadı ─────────────────────────────────────────
  if (!player) {
    return <Login onLogin={handleLogin} />
  }

  // ── Sayfa içeriği ───────────────────────────────────────────
  const renderPage = () => {
    // Ekle her zaman kullanılabilir (veri yüklenmesini beklemez)
    if (tab === 'ekle') {
      return (
        <AddEntry
          player={player}
          lastLocation={lastLocation}
          onSave={handleSave}
          saving={saving}
        />
      )
    }
    // Veriye bağlı sayfalar için loading / error
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
    switch (tab) {
      case 'sonaktivite':
        return <SonAktivite entries={entries} players={PLAYERS} />
      case 'conclave':
        return <Conclave entries={entries} players={PLAYERS} />
      case 'liderlik':
        return <Leaderboard entries={entries} players={PLAYERS} currentPlayerId={player.id} />
      case 'profil':
        return <Profile player={player} entries={entries} onLogout={handleLogout} />
      default:
        return null
    }
  }

  return (
    <>
      <AppShell tabs={TABS} active={tab} onChange={setTab} playerName={player.name} pageKey={tab}>
        {renderPage()}
      </AppShell>
      <Toast show={toast.show} message={toast.message} />
    </>
  )
}
