import { nakshatraOf, NAKSHATRA_SPAN } from './nakshatra.ts'

export const dashaLords = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'] as const
export type DashaLord = (typeof dashaLords)[number]
export const dashaYears: Record<DashaLord, number> = {
  ketu: 7,
  venus: 20,
  sun: 6,
  moon: 10,
  mars: 7,
  rahu: 18,
  jupiter: 16,
  saturn: 19,
  mercury: 17,
}

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000

export type DashaPeriod = {
  lord: DashaLord
  start: string
  end: string
  antardasha: { lord: DashaLord; start: string; end: string }[]
}

export function vimshottari(moonSidereal: number, birth: Date): { balanceYears: number; periods: DashaPeriod[] } {
  const nakshatra = nakshatraOf(moonSidereal)
  const lord = dashaLords[nakshatra.index % 9]!
  const remaining = (NAKSHATRA_SPAN - nakshatra.degree) / NAKSHATRA_SPAN
  const balanceYears = remaining * dashaYears[lord]
  const periods: DashaPeriod[] = []
  let cursor = birth.getTime()
  for (let index = 0; index < 9; index += 1) {
    const periodLord = dashaLords[(dashaLords.indexOf(lord) + index) % 9]!
    const years = index === 0 ? balanceYears : dashaYears[periodLord]
    const end = cursor + years * YEAR_MS
    periods.push({
      lord: periodLord,
      start: new Date(cursor).toISOString(),
      end: new Date(end).toISOString(),
      antardasha: antardasha(periodLord, cursor, years),
    })
    cursor = end
  }
  return { balanceYears, periods }
}

function antardasha(mahadasha: DashaLord, startMs: number, years: number) {
  const startIndex = dashaLords.indexOf(mahadasha)
  let cursor = startMs
  return dashaLords.map((_, offset) => {
    const lord = dashaLords[(startIndex + offset) % 9]!
    const span = years * (dashaYears[lord] / 120) * YEAR_MS
    const end = cursor + span
    const period = { lord, start: new Date(cursor).toISOString(), end: new Date(end).toISOString() }
    cursor = end
    return period
  })
}

export function currentDasha(periods: DashaPeriod[], at: Date): { maha: DashaLord; antar: DashaLord } | null {
  const time = at.getTime()
  const maha = periods.find((period) => time >= Date.parse(period.start) && time < Date.parse(period.end))
  if (!maha) return null
  const antar = maha.antardasha.find((period) => time >= Date.parse(period.start) && time < Date.parse(period.end))
  return antar ? { maha: maha.lord, antar: antar.lord } : { maha: maha.lord, antar: maha.lord }
}
