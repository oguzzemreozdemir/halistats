import { supabase, supabaseConfigured } from '../lib/supabaseClient'

const TABLE = 'matches'

// ── Mapping ────────────────────────────────────────────────────────────────
// DB satırı (snake_case) -> uygulama içi entry (camelCase, calculations.js bunu bekler)
export function rowToEntry(r) {
  return {
    id: r.id,
    playerId: r.player_id,
    playerName: r.player_name,
    // match_date yoksa created_at'in tarih kısmına düş
    matchDate: r.match_date || (r.created_at ? String(r.created_at).slice(0, 10) : null),
    city: r.city,
    district: r.district,
    position: r.position,
    matchMode: r.intensity, // Laubali / Normal / Tryhard
    matchType: r.is_conclave ? 'conclave' : 'personal',
    goals: r.goals ?? 0,
    assists: r.assists ?? 0,
    createdAt: r.created_at,
  }
}

// Uygulama draft'ı -> DB insert satırı. created_at'i DB default now() üretir (güvenilir).
function draftToRow(d) {
  return {
    player_id: d.playerId ?? null,
    player_name: d.playerName ?? null,
    goals: d.goals ?? 0,
    assists: d.assists ?? 0,
    position: d.position ?? null,
    city: d.city ?? null,
    district: d.district ?? null,
    match_date: d.matchDate ?? null,
    intensity: d.matchMode ?? null,
    match_scope: d.matchType === 'conclave' ? 'Conclave' : 'Kişisel',
    is_conclave: d.matchType === 'conclave',
  }
}

// ── API ────────────────────────────────────────────────────────────────────
// Tüm maçları çek (created_at azalan; en yeni en üstte).
export async function fetchMatches() {
  if (!supabaseConfigured) {
    throw new Error('Supabase yapılandırılmadı (.env eksik).')
  }
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[matchService.fetchMatches] hata:', error)
    throw error
  }
  return (data || []).map(rowToEntry)
}

// Yeni maç ekle ve eklenen satırı geri al (created_at dahil).
export async function addMatch(draft) {
  if (!supabaseConfigured) {
    throw new Error('Supabase yapılandırılmadı (.env eksik).')
  }
  const { data, error } = await supabase
    .from(TABLE)
    .insert(draftToRow(draft))
    .select()
    .single()
  if (error) {
    console.error('[matchService.addMatch] hata:', error)
    throw error
  }
  return rowToEntry(data)
}
