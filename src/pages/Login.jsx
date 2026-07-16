import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PLAYERS } from '../data/mockData'
import Avatar from '../components/Avatar'

// Player selection + 4-digit PIN. Mock auth only.
export default function Login({ onLogin }) {
  const [selected, setSelected] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const player = PLAYERS.find((p) => p.id === selected)

  const press = (digit) => {
    if (pin.length >= 4) return
    setError(false)
    const next = pin + digit
    setPin(next)
    if (next.length === 4) tryLogin(next)
  }

  const back = () => {
    setError(false)
    setPin((p) => p.slice(0, -1))
  }

  const tryLogin = (value) => {
    if (player && value === player.pin) {
      onLogin(player)
    } else {
      setError(true)
      setTimeout(() => setPin(''), 450)
    }
  }

  const reset = () => {
    setSelected(null)
    setPin('')
    setError(false)
  }

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
        <p className="mt-2 text-[13px] text-slate-400">Özel halısaha istatistik takibi</p>
      </div>

      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className="mb-3 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Oyuncu seç
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PLAYERS.map((p) => (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelected(p.id)}
                  className="flex flex-col items-center gap-2.5 rounded-2xl border border-field-border bg-field-card/70 py-5 backdrop-blur-sm transition-colors hover:border-grass/40"
                >
                  <Avatar name={p.name} size="lg" />
                  <span className="font-display text-[16px] font-bold capitalize text-white">
                    {p.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 flex flex-col items-center gap-2.5">
              <Avatar name={player.name} size="lg" />
              <span className="font-display text-[18px] font-bold capitalize text-white">
                {player.name}
              </span>
              <button onClick={reset} className="text-[12px] text-slate-400 underline-offset-2 hover:underline">
                Oyuncu değiştir
              </button>
            </div>

            {/* PIN dots */}
            <motion.div
              animate={error ? { x: [0, -9, 9, -7, 7, 0] } : {}}
              transition={{ duration: 0.42 }}
              className="mb-7 flex justify-center gap-3.5"
            >
              {[0, 1, 2, 3].map((i) => (
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

            {/* Keypad */}
            <div className="mx-auto grid max-w-[280px] grid-cols-3 gap-3">
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

            <p className="mt-5 text-center text-[11.5px] text-slate-600">
              Demo PIN’ler: ogi 1111 · arda 2222 · deniz 3333 · onur 4444
            </p>
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
