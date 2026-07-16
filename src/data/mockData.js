// ──────────────────────────────────────────────────────────────────────────
// HalıStats mock data
// Structured to map cleanly onto Supabase tables later:
//   players     -> public.players
//   matchEntries-> public.match_entries
// Keep field names in camelCase here; map to snake_case at the data layer
// when Supabase is wired up.
// ──────────────────────────────────────────────────────────────────────────

export const PLAYERS = [
  { id: 'p_ogi', name: 'ogi', pin: '1111' },
  { id: 'p_arda', name: 'arda', pin: '2222' },
  { id: 'p_deniz', name: 'deniz', pin: '3333' },
  { id: 'p_onur', name: 'onur', pin: '4444' },
]

// Selection option sets (used by the Add Entry form) ─────────────────────────

export const CITIES = ['İstanbul', 'İzmir', 'Ankara', 'Manisa', 'Diğer']

export const DISTRICTS = {
  İstanbul: ['Çekmeköy', 'Ümraniye', 'Kadıköy', 'Ataşehir', 'Beşiktaş', 'Diğer'],
  İzmir: ['Bornova', 'Karşıyaka', 'Konak', 'Buca', 'Diğer'],
  Ankara: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Diğer'],
  Manisa: ['Yunusemre', 'Şehzadeler', 'Diğer'],
  Diğer: ['Diğer'],
}

export const POSITIONS = ['Kaleci', 'Defans', 'Orta Saha', 'Kanat', 'Forvet', 'Serbest']

export const MATCH_MODES = ['Laubali', 'Normal', 'Tryhard']

// Helpers for building mock entries ──────────────────────────────────────────

// Seed base = module-load time. Every mock entry's createdAt is strictly in the
// PAST relative to this, so a real entry added later (Date.now()) always sorts
// above all seed entries. Larger `n` => older.
const SEED_NOW = Date.now()
const daysAgo = (n) => new Date(SEED_NOW - n * 86400000 - 60000)
const iso = (d) => d.toISOString()
const dateStr = (d) => d.toISOString().slice(0, 10) // YYYY-MM-DD

let _seq = 0
const entry = (playerId, ago, city, district, position, matchMode, matchType, goals, assists) => {
  const d = daysAgo(ago)
  _seq += 1
  return {
    id: `m_${String(_seq).padStart(3, '0')}`,
    playerId,
    matchDate: dateStr(d),
    city,
    district,
    position,
    matchMode,
    matchType, // 'personal' | 'conclave'
    goals,
    assists,
    createdAt: iso(d),
  }
}

// Mock match entries (personal performance records). Totals/rankings are all
// derived from this array — nothing is hardcoded elsewhere.
export const MATCH_ENTRIES = [
  // ── ogi ──────────────────────────────────────────────
  entry('p_ogi', 0, 'İstanbul', 'Çekmeköy', 'Forvet', 'Normal', 'conclave', 2, 1),
  entry('p_ogi', 2, 'İstanbul', 'Çekmeköy', 'Forvet', 'Tryhard', 'conclave', 3, 0),
  entry('p_ogi', 5, 'İstanbul', 'Ümraniye', 'Forvet', 'Normal', 'personal', 1, 2),
  entry('p_ogi', 8, 'İstanbul', 'Çekmeköy', 'Kanat', 'Laubali', 'conclave', 2, 2),
  entry('p_ogi', 12, 'İstanbul', 'Kadıköy', 'Forvet', 'Normal', 'personal', 4, 1),
  entry('p_ogi', 16, 'İzmir', 'Bornova', 'Forvet', 'Tryhard', 'personal', 2, 1),
  entry('p_ogi', 21, 'İstanbul', 'Çekmeköy', 'Orta Saha', 'Normal', 'conclave', 1, 3),
  entry('p_ogi', 27, 'İstanbul', 'Ataşehir', 'Forvet', 'Normal', 'personal', 3, 0),
  entry('p_ogi', 33, 'İstanbul', 'Çekmeköy', 'Forvet', 'Laubali', 'conclave', 2, 1),
  entry('p_ogi', 40, 'Manisa', 'Yunusemre', 'Forvet', 'Normal', 'personal', 1, 1),
  entry('p_ogi', 48, 'İstanbul', 'Çekmeköy', 'Kanat', 'Tryhard', 'conclave', 2, 2),

  // ── arda ─────────────────────────────────────────────
  entry('p_arda', 0, 'İstanbul', 'Çekmeköy', 'Orta Saha', 'Normal', 'conclave', 0, 2),
  entry('p_arda', 1, 'İstanbul', 'Ümraniye', 'Orta Saha', 'Tryhard', 'personal', 1, 3),
  entry('p_arda', 4, 'İstanbul', 'Çekmeköy', 'Kanat', 'Normal', 'conclave', 2, 1),
  entry('p_arda', 9, 'İstanbul', 'Kadıköy', 'Orta Saha', 'Laubali', 'personal', 1, 2),
  entry('p_arda', 14, 'İzmir', 'Karşıyaka', 'Orta Saha', 'Normal', 'personal', 0, 4),
  entry('p_arda', 19, 'İstanbul', 'Çekmeköy', 'Kanat', 'Tryhard', 'conclave', 2, 1),
  entry('p_arda', 25, 'Ankara', 'Çankaya', 'Orta Saha', 'Normal', 'personal', 1, 1),
  entry('p_arda', 31, 'İstanbul', 'Beşiktaş', 'Kanat', 'Normal', 'personal', 1, 2),
  entry('p_arda', 38, 'İstanbul', 'Çekmeköy', 'Orta Saha', 'Laubali', 'conclave', 0, 3),

  // ── deniz ────────────────────────────────────────────
  entry('p_deniz', 1, 'İstanbul', 'Çekmeköy', 'Forvet', 'Tryhard', 'conclave', 3, 1),
  entry('p_deniz', 3, 'İstanbul', 'Ataşehir', 'Forvet', 'Normal', 'personal', 2, 0),
  entry('p_deniz', 6, 'İstanbul', 'Çekmeköy', 'Forvet', 'Normal', 'conclave', 2, 1),
  entry('p_deniz', 10, 'İzmir', 'Konak', 'Forvet', 'Laubali', 'personal', 4, 0),
  entry('p_deniz', 15, 'İstanbul', 'Ümraniye', 'Kanat', 'Tryhard', 'personal', 1, 2),
  entry('p_deniz', 20, 'İstanbul', 'Çekmeköy', 'Forvet', 'Normal', 'conclave', 3, 1),
  entry('p_deniz', 26, 'İstanbul', 'Kadıköy', 'Forvet', 'Tryhard', 'personal', 2, 1),
  entry('p_deniz', 35, 'Manisa', 'Şehzadeler', 'Forvet', 'Normal', 'personal', 1, 0),
  entry('p_deniz', 44, 'İstanbul', 'Çekmeköy', 'Forvet', 'Laubali', 'conclave', 2, 2),

  // ── onur ─────────────────────────────────────────────
  entry('p_onur', 2, 'İstanbul', 'Çekmeköy', 'Defans', 'Normal', 'conclave', 0, 1),
  entry('p_onur', 7, 'İstanbul', 'Ümraniye', 'Defans', 'Tryhard', 'personal', 1, 0),
  entry('p_onur', 11, 'İstanbul', 'Çekmeköy', 'Defans', 'Normal', 'conclave', 0, 2),
  entry('p_onur', 17, 'Ankara', 'Keçiören', 'Kaleci', 'Normal', 'personal', 0, 0),
  entry('p_onur', 23, 'İstanbul', 'Çekmeköy', 'Defans', 'Laubali', 'conclave', 1, 1),
  entry('p_onur', 29, 'İstanbul', 'Beşiktaş', 'Orta Saha', 'Normal', 'personal', 1, 1),
  entry('p_onur', 37, 'İzmir', 'Buca', 'Defans', 'Tryhard', 'personal', 0, 1),
  entry('p_onur', 46, 'İstanbul', 'Çekmeköy', 'Kaleci', 'Normal', 'conclave', 0, 0),
]

// Match-type UI labels
export const MATCH_TYPES = [
  { value: 'conclave', label: 'Conclave' },
  { value: 'personal', label: 'Kişisel' },
]
