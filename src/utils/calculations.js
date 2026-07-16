// ──────────────────────────────────────────────────────────────────────────
// All totals, averages, rankings and grouped stats are derived here.
// Nothing about stats is hardcoded — feed these functions matchEntries.
// IMPORTANT: matchMode never weights goals/assists. A goal is 1 goal.
// matchMode is only used as a grouping/filter dimension.
// ──────────────────────────────────────────────────────────────────────────

const safeDiv = (a, b) => (b > 0 ? a / b : 0)

/** Round to 1 decimal, return a number. */
export const round1 = (n) => Math.round(n * 10) / 10

/** Sum goals/assists/entries over a list of entries. */
export function aggregate(entries) {
  const goals = entries.reduce((s, e) => s + (e.goals || 0), 0)
  const assists = entries.reduce((s, e) => s + (e.assists || 0), 0)
  const count = entries.length
  return {
    entries: count,
    goals,
    assists,
    ga: goals + assists,
    avgGoals: round1(safeDiv(goals, count)),
    avgAssists: round1(safeDiv(assists, count)),
    avgGa: round1(safeDiv(goals + assists, count)),
  }
}

/** Entries for one player. */
export const entriesForPlayer = (entries, playerId) =>
  entries.filter((e) => e.playerId === playerId)

// Numeric creation time. Entries without a valid createdAt sort to the bottom.
const createdMs = (e) => {
  const t = Date.parse(e && e.createdAt)
  return Number.isNaN(t) ? -Infinity : t
}

/**
 * Sort strictly newest-first by createdAt timestamp only (not by name / goals /
 * assists / match type). Stable: equal/missing timestamps keep original order,
 * and missing-createdAt entries fall to the bottom.
 */
export const sortByRecent = (entries) =>
  entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => createdMs(b.e) - createdMs(a.e) || a.i - b.i)
    .map((x) => x.e)

/** Recent activity feed across all players. */
export const recentEntries = (entries, limit = 12) =>
  sortByRecent(entries).slice(0, limit)

/** Goals per match for an aggregate. 0 entries -> 0. */
export const goalsPerMatch = (agg) => (agg.entries > 0 ? agg.goals / agg.entries : 0)

// Match-mode coefficients — ONLY used for the Katsayılı Gol leaderboard.
// Real goals/assists/G+A/Gol-Maç are never weighted anywhere else.
export const MODE_COEFF = { Laubali: 0.75, Normal: 1.0, Tryhard: 1.25 }

/** Coefficient for a single match mode. Normal / unknown -> 1.00. */
export const getMatchModeCoefficient = (matchMode) =>
  matchMode === 'Laubali' ? 0.75 : matchMode === 'Tryhard' ? 1.25 : 1

/**
 * Weighted goals over a list of entries:
 *   Σ (entry.goals × coefficient(entry.matchMode))
 * Each entry is weighted by its OWN mode — never one coefficient on the total.
 */
export const weightedGoals = (entries) =>
  entries.reduce((sum, e) => sum + (e.goals || 0) * getMatchModeCoefficient(e.matchMode), 0)

/** Same, filtered by player id (explicit/auditable form). */
export const calculateWeightedGoalsForPlayer = (playerId, matchEntries) =>
  weightedGoals(matchEntries.filter((e) => e.playerId === playerId))

/** Goals split per match mode for a list of entries (for the breakdown line). */
export const goalsByMode = (entries) => {
  const acc = { Laubali: 0, Normal: 0, Tryhard: 0 }
  entries.forEach((e) => {
    if (acc[e.matchMode] != null) acc[e.matchMode] += e.goals || 0
  })
  return acc
}

/** Match-type helpers. */
export const matchTypeLabel = (t) => (t === 'conclave' ? 'Conclave' : 'Kişisel')
export const isConclave = (e) => e.matchType === 'conclave'
export const conclaveEntries = (entries) => entries.filter(isConclave)

/**
 * Leaderboard.
 * metric: 'goals' | 'katGol' | 'assists' | 'ga' | 'golMac' | 'matches'
 * Returns [{ player, value, agg }] sorted desc by metric.
 * For 'golMac', value is goals/match (0-entry players sort to the bottom).
 * For 'katGol', value is mode-weighted goals (does not change real goals).
 */
export function leaderboard(entries, players, metric = 'goals') {
  const rows = players.map((player) => {
    const playerEntries = entriesForPlayer(entries, player.id)
    const agg = aggregate(playerEntries)
    let value
    switch (metric) {
      case 'assists':
        value = agg.assists
        break
      case 'ga':
        value = agg.ga
        break
      case 'katGol':
        value = weightedGoals(playerEntries)
        break
      case 'golMac':
        value = goalsPerMatch(agg)
        break
      case 'matches':
        value = agg.entries
        break
      case 'goals':
      default:
        value = agg.goals
    }
    return { player, value, agg }
  })
  return rows.sort((a, b) => b.value - a.value || b.agg.ga - a.agg.ga)
}

/** "Son formda" — best G+A over the most recent N entries (group-wide leader). */
export function inFormPlayer(entries, players, lastN = 4) {
  let best = null
  for (const player of players) {
    const recent = sortByRecent(entriesForPlayer(entries, player.id)).slice(0, lastN)
    if (recent.length === 0) continue
    const agg = aggregate(recent)
    const score = agg.ga
    if (!best || score > best.score) {
      best = { player, score, agg, sample: recent.length }
    }
  }
  return best
}

/** Top player by a metric (returns { player, agg } or null). */
export function topBy(entries, players, metric = 'goals') {
  const lb = leaderboard(entries, players, metric)
  return lb.length ? lb[0] : null
}

/**
 * Group entries by a key function, return sorted array of
 * { key, label, agg } descending by entries then goals.
 */
function groupBy(entries, keyFn, labelFn) {
  const map = new Map()
  for (const e of entries) {
    const key = keyFn(e)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(e)
  }
  const rows = [...map.entries()].map(([key, list]) => ({
    key,
    label: labelFn ? labelFn(key, list) : key,
    agg: aggregate(list),
  }))
  return rows.sort((a, b) => b.agg.entries - a.agg.entries || b.agg.goals - a.agg.goals)
}

export const statsByLocation = (entries) =>
  groupBy(
    entries,
    (e) => `${e.city} / ${e.district}`,
    (key) => key,
  )

export const statsByPosition = (entries) => groupBy(entries, (e) => e.position)

export const statsByMode = (entries) => groupBy(entries, (e) => e.matchMode)

/** Most recent single entry, or null. */
export const lastEntry = (entries) => {
  const s = sortByRecent(entries)
  return s.length ? s[0] : null
}

/** Human friendly relative date label in Turkish. */
export function relativeDateLabel(dateInput) {
  const d = new Date(dateInput)
  const today = new Date()
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((b - a) / 86400000)
  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Dün'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} gün önce`
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
}

/** Resolve a player object by id from a list. */
export const playerById = (players, id) => players.find((p) => p.id === id) || null
