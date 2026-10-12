import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CITIES, DISTRICTS, POSITIONS, MATCH_MODES, MATCH_TYPES } from '../data/mockData'
import ChipSelect from '../components/ChipSelect'
import CounterInput from '../components/CounterInput'
import SectionHeader from '../components/SectionHeader'

const todayStr = () => new Date().toISOString().slice(0, 10)
const yesterdayStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// Kayıtlı bir değeri chip listesine oturt: listede yoksa "Diğer" + serbest metin.
function splitKnown(value, options) {
  if (!value) return ['', '']
  return options.includes(value) ? [value, ''] : ['Diğer', value === 'Diğer' ? '' : value]
}

function initialFrom(entry, lastLocation) {
  if (!entry) {
    return {
      dateMode: 'today',
      customDate: todayStr(),
      city: lastLocation?.city || '',
      cityOther: '',
      district: lastLocation?.district || '',
      districtOther: '',
    }
  }
  const md = entry.matchDate || todayStr()
  const [city, cityOther] = splitKnown(entry.city, CITIES)
  const districtList = DISTRICTS[city] || ['Diğer']
  const [district, districtOther] = splitKnown(entry.district, districtList)
  return {
    dateMode: md === todayStr() ? 'today' : md === yesterdayStr() ? 'yesterday' : 'custom',
    customDate: md,
    city,
    cityOther,
    district,
    districtOther,
  }
}

// Main page. Fast match-entry form — minimal typing, chip driven.
// initialEntry verilirse "düzenleme" modunda açılır (alanlar dolu gelir).
export default function AddEntry({
  player,
  lastLocation,
  onSave,
  saving = false,
  initialEntry = null,
  onCancel,
}) {
  const editing = !!initialEntry
  const init = useMemo(() => initialFrom(initialEntry, lastLocation), [initialEntry]) // eslint-disable-line react-hooks/exhaustive-deps
  const canChooseType = !!player?.isConclave // Maç Tipi sadece Conclave üyelerine

  const [dateMode, setDateMode] = useState(init.dateMode) // today | yesterday | custom
  const [customDate, setCustomDate] = useState(init.customDate)

  const [city, setCity] = useState(init.city)
  const [district, setDistrict] = useState(init.district)
  const [cityOther, setCityOther] = useState(init.cityOther)
  const [districtOther, setDistrictOther] = useState(init.districtOther)

  const [position, setPosition] = useState(initialEntry?.position || '')
  const [matchMode, setMatchMode] = useState(initialEntry?.matchMode || 'Normal')
  const [matchType, setMatchType] = useState(
    canChooseType ? initialEntry?.matchType || 'conclave' : 'personal',
  )
  const [goals, setGoals] = useState(initialEntry?.goals ?? 0)
  const [assists, setAssists] = useState(initialEntry?.assists ?? 0)

  const districtOptions = useMemo(() => {
    if (!city) return []
    return DISTRICTS[city] || ['Diğer']
  }, [city])

  const matchDate =
    dateMode === 'today' ? todayStr() : dateMode === 'yesterday' ? yesterdayStr() : customDate

  const resolvedCity = city === 'Diğer' ? cityOther.trim() || 'Diğer' : city
  const resolvedDistrict =
    district === 'Diğer' ? districtOther.trim() || 'Diğer' : district

  const canSave = resolvedCity && resolvedDistrict && position && matchMode

  const handleCity = (c) => {
    setCity(c)
    setDistrict('')
    setDistrictOther('')
  }

  const submit = () => {
    if (!canSave || saving) return
    onSave({
      playerId: player.id,
      matchDate,
      city: resolvedCity,
      district: resolvedDistrict,
      position,
      matchMode,
      matchType: canChooseType ? matchType : 'personal',
      goals,
      assists,
    })
    if (editing) return // düzenlemede ekranı üst bileşen kapatır
    // reset performance fields but keep city/district selection
    setPosition('')
    setMatchMode('Normal')
    setGoals(0)
    setAssists(0)
    setDateMode('today')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {editing && (
        <div className="flex items-center justify-between">
          <div className="font-display text-[20px] font-extrabold text-white">Maçı düzenle</div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-field-border bg-field-card/70 px-3.5 py-2 text-[13px] font-semibold text-slate-300"
          >
            İptal
          </button>
        </div>
      )}

      {/* Date */}
      <section>
        <SectionHeader title="Tarih" />
        <ChipSelect
          options={[
            { value: 'today', label: 'Bugün' },
            { value: 'yesterday', label: 'Dün' },
            { value: 'custom', label: 'Tarih seç' },
          ]}
          value={dateMode}
          onChange={setDateMode}
          containerClass="grid grid-cols-3 gap-2"
        />
        {dateMode === 'custom' && (
          <input
            type="date"
            value={customDate}
            max={todayStr()}
            onChange={(e) => setCustomDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-field-border bg-field-card/70 px-3.5 py-2.5 text-[14px] text-white"
          />
        )}
      </section>

      {/* Match type — sadece Conclave üyeleri görür */}
      {canChooseType && (
        <section>
          <SectionHeader title="Maç Tipi" />
          <ChipSelect
            options={MATCH_TYPES}
            value={matchType}
            onChange={setMatchType}
            containerClass="grid grid-cols-2 gap-2"
          />
        </section>
      )}

      {/* Location */}
      <section>
        <SectionHeader title="Konum" />
        <p className="-mt-1 mb-2 text-[12px] text-slate-500">İl</p>
        <ChipSelect
          options={CITIES}
          value={city}
          onChange={handleCity}
          containerClass="flex flex-wrap gap-2"
        />
        {city === 'Diğer' && (
          <input
            value={cityOther}
            onChange={(e) => setCityOther(e.target.value)}
            placeholder="İl yaz"
            className="mt-2 w-full rounded-xl border border-field-border bg-field-card/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-slate-600"
          />
        )}

        {city && (
          <div className="mt-3">
            <p className="mb-2 text-[12px] text-slate-500">İlçe</p>
            <ChipSelect
              options={districtOptions}
              value={district}
              onChange={setDistrict}
              containerClass="flex flex-wrap gap-2"
            />
            {district === 'Diğer' && (
              <input
                value={districtOther}
                onChange={(e) => setDistrictOther(e.target.value)}
                placeholder="İlçe yaz"
                className="mt-2 w-full rounded-xl border border-field-border bg-field-card/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-slate-600"
              />
            )}
          </div>
        )}
      </section>

      {/* Position */}
      <section>
        <SectionHeader title="Mevki" />
        <ChipSelect options={POSITIONS} value={position} onChange={setPosition} />
      </section>

      {/* Match mode */}
      <section>
        <SectionHeader title="Maç Modu" />
        <ChipSelect
          options={MATCH_MODES}
          value={matchMode}
          onChange={setMatchMode}
          containerClass="grid grid-cols-3 gap-2"
        />
      </section>

      {/* Counters */}
      <section className="grid grid-cols-2 gap-3">
        <CounterInput label="Gol" value={goals} onChange={setGoals} accent="grass" />
        <CounterInput label="Asist" value={assists} onChange={setAssists} accent="emerald" />
      </section>

      {/* G+A preview */}
      <div className="flex items-center justify-center gap-2 text-[13px] text-slate-400">
        <span>Toplam katkı</span>
        <span className="font-display text-[18px] font-extrabold tabular text-white">
          {goals + assists}
        </span>
        <span>G+A</span>
      </div>

      {/* Save */}
      <motion.button
        type="button"
        onClick={submit}
        disabled={!canSave || saving}
        whileTap={canSave && !saving ? { scale: 0.97 } : {}}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-full rounded-2xl py-4 font-display text-[18px] font-extrabold tracking-wide transition-all ${
          canSave && !saving
            ? 'bg-grass text-field-bg shadow-glow'
            : 'cursor-not-allowed bg-field-cardhi text-slate-600'
        }`}
      >
        {saving ? 'Kaydediliyor…' : editing ? 'Değişiklikleri kaydet' : 'Kaydet'}
      </motion.button>
    </div>
  )
}
