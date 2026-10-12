import { supabase, supabaseConfigured } from '../lib/supabaseClient'

// Hesaplar "kullanıcı adı + 6 haneli PIN". Arkada Supabase Auth çalışır;
// mail kullanılmaz, her kullanıcı adı için sahte bir adres üretilir
// (ör. ogi@halistats.app). Bu adres kimseye gösterilmez/gönderilmez.
const EMAIL_DOMAIN = 'halistats.app'

export const PIN_LENGTH = 6

// "Ömer Çağrı" -> "omercagri"
export function slugify(name) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u' }
  return String(name || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıiöşü]/g, (c) => map[c] || c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20)
}

const emailFor = (slug) => `${slug}@${EMAIL_DOMAIN}`

function need() {
  if (!supabaseConfigured) throw new Error('Supabase yapılandırılmadı (.env eksik).')
}

// Supabase hatalarını anlaşılır Türkçe mesaja çevir.
export function friendlyError(err) {
  const m = String((err && (err.message || err.error_description)) || err || '')
  if (/invalid login credentials/i.test(m)) return 'PIN yanlış.'
  if (/already registered|already exists/i.test(m)) return 'Bu kullanıcı adı alınmış.'
  if (/signups? (are )?(not allowed|disabled)/i.test(m))
    return "Yeni kayıt kapalı (Supabase'de sign up açık olmalı)."
  if (/rate limit|too many/i.test(m)) return 'Çok fazla deneme yapıldı, biraz bekleyip tekrar dene.'
  if (/password should be at least/i.test(m)) return 'PIN 6 haneli olmalı.'
  if (/row-level security|permission denied/i.test(m)) return 'Bu işlem için yetkin yok.'
  if (/failed to fetch|network/i.test(m)) return 'Bağlantı hatası. İnterneti kontrol et.'
  return m || 'Bilinmeyen hata.'
}

// DB satırı -> uygulama içi oyuncu. `id` ve `name` alanları calculations.js
// ve bileşenlerin beklediği isimler; player_id maçlardaki kimlikle aynı.
function rowToPlayer(r) {
  return {
    id: r.player_id,
    name: r.display_name,
    slug: r.slug,
    userId: r.user_id,
    isConclave: !!r.is_conclave,
    isAdmin: !!r.is_admin,
    claimed: !!r.user_id,
    createdAt: r.created_at,
  }
}

export async function fetchPlayers() {
  need()
  const { data, error } = await supabase
    .from('hs_players')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    console.error('[playerService.fetchPlayers]', error)
    throw error
  }
  return (data || []).map(rowToPlayer)
}

export async function getSessionUserId() {
  need()
  const { data } = await supabase.auth.getSession()
  return data?.session?.user?.id || null
}

// Var olan (sahiplenilmiş) hesapla giriş
export async function signIn(player, pin) {
  need()
  const { error } = await supabase.auth.signInWithPassword({
    email: emailFor(player.slug),
    password: pin,
  })
  if (error) throw new Error(friendlyError(error))
}

export async function signOut() {
  if (!supabaseConfigured) return
  await supabase.auth.signOut()
}

// signUp; "zaten kayıtlı" ise aynı PIN ile girişi dene (yarım kalmış kayıtları kurtarır).
async function signUpOrSignIn(slug, pin) {
  const email = emailFor(slug)
  const { data, error } = await supabase.auth.signUp({ email, password: pin })
  if (error) {
    if (/already registered|already exists/i.test(error.message || '')) {
      const r = await supabase.auth.signInWithPassword({ email, password: pin })
      if (r.error) throw new Error('Bu kullanıcı adı alınmış.')
      return r.data.session
    }
    throw new Error(friendlyError(error))
  }
  if (!data.session) {
    throw new Error(
      "Supabase'de 'Confirm email' ayarı kapalı olmalı (Authentication → Sign In / Providers → Email).",
    )
  }
  return data.session
}

// Eski 4 haneli PIN doğru mu? (girildiği anda kontrol için)
export async function checkLegacyPin(player, oldPin) {
  need()
  const { data, error } = await supabase.rpc('check_legacy_pin', {
    p_player_id: player.id,
    p_pin: oldPin,
  })
  if (error) throw new Error(friendlyError(error))
  return !!data
}

// Mevcut dörtlü: eski 4 haneli PIN ile hesabı sahiplen, yeni 6 haneli PIN belirle.
export async function claimLegacyPlayer(player, oldPin, newPin) {
  need()
  if (!(await checkLegacyPin(player, oldPin))) throw new Error('Eski PIN yanlış.')

  await signUpOrSignIn(player.slug, newPin)

  const { error } = await supabase.rpc('claim_legacy_player', {
    p_player_id: player.id,
    p_pin: oldPin,
  })
  if (error) {
    await supabase.auth.signOut()
    throw new Error(friendlyError(error))
  }
}

// Yeni kullanıcı: kullanıcı adı + PIN ile kayıt
export async function registerPlayer(displayName, pin, existingPlayers = []) {
  need()
  const name = String(displayName || '').trim().slice(0, 20)
  const slug = slugify(name)
  if (name.length < 2 || slug.length < 2) {
    throw new Error('Kullanıcı adı en az 2 harf/rakam içermeli.')
  }
  if (existingPlayers.some((p) => p.slug === slug)) {
    throw new Error('Bu kullanıcı adı alınmış.')
  }
  const session = await signUpOrSignIn(slug, pin)
  const uid = session.user.id
  const { error } = await supabase.from('hs_players').insert({
    player_id: uid,
    user_id: uid,
    display_name: name,
    slug,
    is_conclave: false,
    is_admin: false,
  })
  if (error) {
    console.error('[playerService.registerPlayer]', error)
    // Daha önce oluşturulmuşsa (yarım kalmış kayıt) sorun yok.
    if (!/duplicate key/i.test(error.message || '')) {
      await supabase.auth.signOut()
      throw new Error(friendlyError(error))
    }
  }
}

// Yönetici: PIN sıfırla
export async function adminResetPin(targetPlayerId, newPin) {
  need()
  const { error } = await supabase.rpc('admin_reset_pin', {
    target_player_id: targetPlayerId,
    new_pin: newPin,
  })
  if (error) {
    console.error('[playerService.adminResetPin]', error)
    throw new Error(friendlyError(error))
  }
}
