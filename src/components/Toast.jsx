import { AnimatePresence, motion } from 'framer-motion'

// Premium success toast. Controlled by parent via `show`.
export default function Toast({ show, message }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="pointer-events-none fixed inset-x-0 bottom-[max(22px,env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
        >
          <div className="flex items-center gap-2.5 rounded-2xl border border-grass/40 bg-field-cardhi/95 px-4 py-3 shadow-glow">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-grass/20">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-grass" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[14px] font-semibold text-white">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
