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

// Kendi maçını düzenle. player_id ve created_at değişmez → sıralama bozulmaz.
export async function updateMatch(id, draft) {
  if (!supabaseConfigured) {
    throw new Error('Supabase yapılandırılmadı (.env eksik).')
  }
  // eslint-disable-next-line no-unused-vars
  const { player_id, player_name, ...fields } = draftToRow(draft)
  const { data, error } = await supabase
    .from(TABLE)
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('[matchService.updateMatch] hata:', error)
    throw error
  }
  return rowToEntry(data)
}

// Maç sil (kendi maçı ya da yönetici). Silinmediyse (yetki yok) hata ver.
export async function deleteMatch(id) {
  if (!supabaseConfigured) {
    throw new Error('Supabase yapılandırılmadı (.env eksik).')
  }
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('id')
  if (error) {
    console.error('[matchService.deleteMatch] hata:', error)
    throw error
  }
  if (!data || data.length === 0) throw new Error('Bu maçı silme yetkin yok.')
}

// ── Yedek: tüm maçları CSV olarak indir (Excel Türkçe karakterleri doğru açsın diye BOM'lu)
export function downloadMatchesCsv(entries, players) {
  const nameOf = (pid) => players.find((p) => p.id === pid)?.name || pid
  const header = [
    'oyuncu', 'player_id', 'mac_tarihi', 'il', 'ilce', 'mevki', 'mod',
    'mac_tipi', 'gol', 'asist', 'eklenme_zamani', 'id',
  ]
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = [...entries]
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
    .map((e) =>
      [
        nameOf(e.playerId), e.playerId, e.matchDate, e.city, e.district, e.position,
        e.matchMode, e.matchType === 'conclave' ? 'Conclave' : 'Kişisel',
        e.goals, e.assists, e.createdAt, e.id,
      ].map(esc).join(','),
    )
  const csv = '﻿' + [header.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `halistats-yedek-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
