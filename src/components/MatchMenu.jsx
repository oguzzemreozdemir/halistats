import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Alttan açılan menü: Düzenle / Sil (+ silme onayı).
export default function MatchMenu({ entry, canEdit, canDelete, busy, onEdit, onDelete, onClose }) {
  const [confirm, setConfirm] = useState(false)
  useEffect(() => setConfirm(false), [entry])

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !busy && onClose()}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl border border-field-border bg-field-card px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-field-line" />
            <div className="mb-4 text-center text-[13px] text-slate-400">
              {entry.matchDate} · {entry.city} / {entry.district} · {entry.goals}G {entry.assists}A
            </div>

            {!confirm ? (
              <div className="space-y-2">
                {canEdit && (
                  <button
                    onClick={() => onEdit(entry)}
                    className="w-full rounded-2xl border border-field-border bg-field-cardhi py-3.5 text-[15px] font-semibold text-white"
                  >
                    Düzenle
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setConfirm(true)}
                    className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 text-[15px] font-semibold text-red-300"
                  >
                    Sil
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-3 text-[14px] font-semibold text-slate-400"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mb-2 text-center font-display text-[17px] font-bold text-white">
                  Bu maçı silmek istediğine emin misin?
                </div>
                <div className="mb-3 text-center text-[12.5px] text-slate-500">Bu işlem geri alınamaz.</div>
                <button
                  disabled={busy}
                  onClick={() => onDelete(entry)}
                  className="w-full rounded-2xl bg-red-500/90 py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
                >
                  {busy ? 'Siliniyor…' : 'Evet, sil'}
                </button>
                <button
                  disabled={busy}
                  onClick={() => setConfirm(false)}
                  className="w-full py-3 text-[14px] font-semibold text-slate-400"
                >
                  Vazgeç
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
