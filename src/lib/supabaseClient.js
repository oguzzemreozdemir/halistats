import { createClient } from '@supabase/supabase-js'

// URL ve anon key derleme sırasında .env'den enjekte edilir (koda hard-code YOK).
// .env içinde tanımla:
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

if (!supabaseConfigured) {
  // Geliştiriciye net uyarı; UI tarafında da error state gösterilir.
  console.error(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tanımlı değil. ' +
      '.env dosyası eksik veya build env okunmuyor.',
  )
}

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: false } })
  : null
