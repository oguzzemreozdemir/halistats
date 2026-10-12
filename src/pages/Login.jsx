import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Avatar from '../components/Avatar'
import {
  PIN_LENGTH,
  signIn,
  checkLegacyPin,
  claimLegacyPlayer,
  registerPlayer,
  slugify,
} from '../services/playerService'

const LEGACY_PIN_LENGTH = 4

// Giriş ekranı: isim kartları + "+" ile yeni hesap.
//  - Sahiplenilmiş hesap: kartına dokun → 6 haneli PIN
//  - Mevcut dörtlü ilk kez: eski 4 haneli PIN → yeni 6 haneli PIN (iki kez)
//  - "+": kullanıcı adı → 6 haneli PIN (iki kez)
export default function Login({ players = [], loading = false, loadError = '', onRetry, onLoggedIn }) {
  const [view, setView] = useState('list') // list | pin | claim | signup | forgot
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0) // çok adımlı akışlar için
  const [pin, setPin] = useState('')
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(0)
  const [busy, setBusy] = useState(false)

  const admin = players.find((p) => p.isAdmin)

  const reset = () => {
    setView('list')
    setSelected(null)
    setStep(0)
    setPin('')
    setOldPin('')
    setNewPin('')
    setName('')
    setError('')
    setBusy(false)
  }

  const fail = (msg) => {
    setError(msg)
    setShake((s) => s + 1)
    setPin('')
  }

  const pick = (p) => {
    setSelected(p)
    setError('')
    setPin('')
    setStep(0)
    setView(p.claimed ? 'pin' : 'claim')
  }

  // ── PIN tamamlandığında ne olacağı ──────────────────────────
  const onComplete = async (value) => {
    setError('')
    if (view === 'pin') {
      setBusy(true)
      try {
        await signIn(selected, value)
        await onLoggedIn()
      } catch (e) {
        fail(e.message)
      } finally {
        setBusy(false)
      }
      return
    }

    if (view === 'claim') {
      if (step === 0) {
        setBusy(true)
        try {
          const ok = await checkLegacyPin(selected, value)
          if (!ok) return fail('Eski PIN yanlış.')
          setOldPin(value)
          setPin('')
          setStep(1)
        } catch (e) {
          fail(e.message)
        } finally {
          setBusy(false)
        }
      } else if (step === 1) {
        setNewPin(value)
        setPin('')
        setStep(2)
      } else {
        if (value !== newPin) {
          setStep(1)
          setNewPin('')
          return fail('PIN\'ler eşleşmedi, yeni PIN\'i tekrar gir.')
        }
        setBusy(true)
        try {
          await claimLegacyPlayer(selected, oldPin, value)
          await onLoggedIn()
        } catch (e) {
          setStep(e.message === 'Eski PIN yanlış.' ? 0 : 1)
          setOldPin('')
          setNewPin('')
          fail(e.message)
        } finally {
          setBusy(false)
        }
      }
      return
    }

    if (view === 'signup') {
      if (step === 1) {
        setNewPin(value)
        setPin('')
        setStep(2)
      } else if (step === 2) {
        if (value !== newPin) {
          setStep(1)
          setNewPin('')
          return fail('PIN\'ler eşleşmedi, tekrar belirle.')
        }
        setBusy(true)
        try {
          await registerPlayer(name, value, players)
          await onLoggedIn()
        } catch (e) {
          setStep(0)
          setNewPin('')
          fail(e.message)
        } finally {
          setBusy(false)
        }
      }
    }
  }

  const currentLength =
    view === 'claim' && step === 0 ? LEGACY_PIN_LENGTH : PIN_LENGTH

  const press = (d) => {
    if (busy || pin.length >= currentLength) return
    setError('')
    const next = pin + d
    setPin(next)
    if (next.length === currentLength) setTimeout(() => onComplete(next), 120)
  }
  const back = () => {
    if (busy) return
    setError('')
    setPin((p) => p.slice(0, -1))
  }

  const submitName = () => {
    const trimmed = name.trim()
    const slug = slugify(trimmed)
    if (trimmed.length < 2 || slug.length < 2) {
      return fail('Kullanıcı adı en az 2 harf/rakam içermeli.')
    }
    if (players.some((p) => p.slug === slug)) {
      return fail('Bu kullanıcı adı alınmış.')
    }
    setError('')
    setStep(1)
  }

  // ── Başlık / açıklama metinleri ─────────────────────────────
  let title = ''
  let hint = ''
  if (view === 'pin') {
    title = selected?.name
    hint = `${PIN_LENGTH} haneli PIN'ini gir`
  } else if (view === 'claim') {
    title = selected?.name
    hint =
      step === 0
        ? 'İlk giriş: eski 4 haneli PIN\'ini gir'
        : step === 1
        ? `Yeni ${PIN_LENGTH} haneli PIN belirle`
        : 'Yeni PIN\'i tekrar gir'
  } else if (view === 'signup') {
    title = step === 0 ? 'Yeni hesap' : name.trim()
    hint =
      step === 0
        ? 'Kullanıcı adını yaz'
        : step === 1
        ? `${PIN_LENGTH} haneli PIN belirle`
        : 'PIN\'i tekrar gir'
  }

  const showKeypad = view === 'pin' || view === 'claim' || (view === 'signup' && step > 0)

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-9 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-grass/30 bg-grass/10 shadow-glow">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-grass" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
            <path d="M12 9.2l2.6 1.9-1 3.1h-3.2l-1-3.1z" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h1 className="font-display text-[34px] font-extrabold leading-none text-white">
          Halı<span className="text-grass">Stats</span>
        </h1>
        <p className="mt-2 text-[13px] text-slate-400">Halısaha istatistik takibi</p>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className="mb-3 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Oyuncu seç
            </p>

            {loading && (
              <div className="flex justify-center py-10">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-field-line border-t-grass" />
              </div>
            )}

            {!loading && loadError && (
              <div className="py-6 text-center">
                <p className="text-[13px] text-slate-400">{loadError}</p>
                <button
                  onClick={onRetry}
                  className="mt-3 rounded-2xl bg-grass px-5 py-2.5 text-[14px] font-semibold text-field-bg"
                >
                  Tekrar dene
                </button>
              </div>
            )}

            {!loading && !loadError && (
              <div className="grid grid-cols-2 gap-3">
                {players.map((p) => (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => pick(p)}
                    className="flex flex-col items-center gap-2.5 rounded-2xl border border-field-border bg-field-card/70 py-5 transition-colors hover:border-grass/40"
                  >
                    <Avatar name={p.name} size="lg" />
                    <span className="max-w-[90%] truncate font-display text-[16px] font-bold capitalize text-white">
                      {p.name}
                    </span>
                  </motion.button>
                ))}

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    reset()
                    setView('signup')
                  }}
                  className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-grass/40 bg-grass/5 py-5 transition-colors hover:border-grass/70"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-grass/40 bg-grass/10 text-[32px] font-light leading-none text-grass">
                    +
                  </div>
                  <span className="font-display text-[14px] font-bold text-grass">Yeni hesap</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : view === 'forgot' ? (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <div className="font-display text-[20px] font-extrabold text-white">PIN'ini mi unuttun?</div>
            <p className="mx-auto mt-3 max-w-[280px] text-[14px] leading-relaxed text-slate-400">
              Yöneticiye{admin ? <> (<span className="capitalize text-white">{admin.name}</span>)</> : null} yaz,
              PIN'ini sıfırlasın. Sana geçici bir PIN verecek; onunla girip devam edebilirsin.
            </p>
            <button
              onClick={() => setView('pin')}
              className="mt-6 rounded-2xl border border-field-border bg-field-card/70 px-5 py-2.5 text-[14px] font-semibold text-white"
            >
              Geri dön
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`${view}-${selected?.id || 'new'}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 flex flex-col items-center gap-2.5">
              {view === 'signup' && step === 0 ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-grass/40 bg-grass/10 text-[30px] font-light text-grass">
                  +
                </div>
              ) : (
                <Avatar name={view === 'signup' ? name.trim() : selected?.name} size="lg" />
              )}
              <span className="font-display text-[18px] font-bold capitalize text-white">{title}</span>
              <span className="text-[13px] text-slate-400">{hint}</span>
              <button onClick={reset} className="text-[12px] text-slate-500 underline-offset-2 hover:underline">
                {view === 'signup' ? 'Vazgeç' : 'Oyuncu değiştir'}
              </button>
            </div>

            {view === 'signup' && step === 0 && (
              <div className="mx-auto max-w-[300px]">
                <input
                  autoFocus
                  value={name}
                  maxLength={20}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && submitName()}
                  placeholder="ör. Kaan"
                  className="w-full rounded-2xl border border-field-border bg-field-card/70 px-4 py-3.5 text-center text-[17px] font-semibold text-white placeholder:text-slate-600 focus:border-grass/50"
                />
                <button
                  onClick={submitName}
                  className="mt-3 w-full rounded-2xl bg-grass py-3.5 font-display text-[16px] font-extrabold text-field-bg"
                >
                  Devam
                </button>
              </div>
            )}

            {showKeypad && (
              <>
                <motion.div
                  key={shake}
                  animate={shake ? { x: [0, -9, 9, -7, 7, 0] } : {}}
                  transition={{ duration: 0.42 }}
                  className="mb-7 flex justify-center gap-3"
                >
                  {Array.from({ length: currentLength }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3.5 w-3.5 rounded-full border transition-colors ${
                        error
                          ? 'border-red-500/70 bg-red-500/40'
                          : pin.length > i
                          ? 'border-grass bg-grass'
                          : 'border-field-line bg-transparent'
                      }`}
                    />
                  ))}
                </motion.div>

                <div className={`mx-auto grid max-w-[280px] grid-cols-3 gap-3 ${busy ? 'opacity-50' : ''}`}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                    <Key key={d} onClick={() => press(String(d))}>
                      {d}
                    </Key>
                  ))}
                  <div />
                  <Key onClick={() => press('0')}>0</Key>
                  <Key onClick={back} subtle>
                    ⌫
                  </Key>
                </div>
              </>
            )}

            <div className="mt-5 min-h-[20px] text-center text-[13px]">
              {busy ? (
                <span className="text-slate-400">Kontrol ediliyor…</span>
              ) : error ? (
                <span className="text-red-300">{error}</span>
              ) : null}
            </div>

            {view === 'pin' && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => setView('forgot')}
                  className="text-[12.5px] text-slate-500 underline-offset-2 hover:underline"
                >
                  PIN'imi unuttum
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Key({ children, onClick, subtle }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      onClick={onClick}
      className={`flex h-16 items-center justify-center rounded-2xl border font-display text-[24px] font-bold ${
        subtle
          ? 'border-transparent text-slate-400'
          : 'border-field-border bg-field-card/70 text-white active:bg-grass/15'
      }`}
    >
      {children}
    </motion.button>
  )
}
