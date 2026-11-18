import { Body, Ecliptic, GeoVector, MakeTime, SiderealTime, e_tilt } from 'astronomy-engine'
import { lahiriMeanDegrees, normalizeDegrees, shortestDelta } from './ayanamsa.ts'
import { currentDasha, vimshottari, type DashaPeriod } from './dasha.ts'
import { nakshatraOf } from './nakshatra.ts'
import { navamsaSign } from './navamsa.ts'

export const EPHEMERIS = { name: 'astronomy-engine', version: '2.1.19', license: 'MIT' } as const

const CLASSICAL = [
  ['sun', Body.Sun],
  ['moon', Body.Moon],
  ['mars', Body.Mars],
  ['mercury', Body.Mercury],
  ['jupiter', Body.Jupiter],
  ['venus', Body.Venus],
  ['saturn', Body.Saturn],
] as const

export type PlanetName = (typeof CLASSICAL)[number][0] | 'rahu' | 'ketu'

export type Placement = {
  name: PlanetName
  sidereal: number
  sign: number
  degreeInSign: number
  house: number | null
  retrograde: boolean
  nakshatra: number
  pada: number
  navamsa: number
}

export type Chart = {
  instantUtc: string
  latitude: number
  longitude: number
  timeZone: string
  ayanamsa: { name: 'lahiri-mean'; degrees: number }
  ephemeris: typeof EPHEMERIS
  houseSystem: 'whole-sign'
  node: 'mean-meeus'
  lagna: { sidereal: number; sign: number; degreeInSign: number; navamsa: number }
  planets: Placement[]
  moonNakshatra: { index: number; pada: number }
  dasha: { balanceYears: number; periods: DashaPeriod[]; current: { maha: string; antar: string } | null }
  nearBoundary: PlanetName[]
}

export function calculateChart(input: {
  instant: Date
  latitude: number
  longitude: number
  timeZone: string
}): Chart {
  if (input.latitude < -90 || input.latitude > 90 || input.longitude < -180 || input.longitude > 180) {
    throw new Error('Coordinates are out of range.')
  }
  const ayanamsa = lahiriMeanDegrees(input.instant)
  const lagnaSidereal = normalizeDegrees(tropicalAscendant(input.instant, input.latitude, input.longitude) - ayanamsa)
  const lagnaSign = signOf(lagnaSidereal)
  const planets = CLASSICAL.map(([name, body]) =>
    placement(name, tropicalLongitude(body, input.instant), ayanamsa, lagnaSign, isRetrograde(body, input.instant)),
  )
  const rahuTropical = meanNodeLongitude(input.instant)
  const rahu = placement('rahu', rahuTropical, ayanamsa, lagnaSign, true)
  const ketu = placement('ketu', normalizeDegrees(rahuTropical + 180), ayanamsa, lagnaSign, true)
  const moon = planets.find((planet) => planet.name === 'moon')
  if (!moon) throw new Error('Moon position is missing.')
  const dasha = vimshottari(moon.sidereal, input.instant)
  const nearBoundary = [...planets, rahu, ketu].filter((planet) => {
    const into = planet.sidereal % 30
    return into < 0.05 || into > 29.95
  }).map((planet) => planet.name)

  return {
    instantUtc: input.instant.toISOString(),
    latitude: input.latitude,
    longitude: input.longitude,
    timeZone: input.timeZone,
    ayanamsa: { name: 'lahiri-mean', degrees: ayanamsa },
    ephemeris: EPHEMERIS,
    houseSystem: 'whole-sign',
    node: 'mean-meeus',
    lagna: {
      sidereal: lagnaSidereal,
      sign: lagnaSign,
      degreeInSign: lagnaSidereal % 30,
      navamsa: navamsaSign(lagnaSidereal),
    },
    planets: [...planets, rahu, ketu],
    moonNakshatra: { index: moon.nakshatra, pada: moon.pada },
    dasha: {
      balanceYears: dasha.balanceYears,
      periods: dasha.periods,
      current: currentDasha(dasha.periods, new Date()),
    },
    nearBoundary,
  }
}

function tropicalLongitude(body: Body, date: Date): number {
  return normalizeDegrees(Ecliptic(GeoVector(body, date, true)).elon)
}

function placement(
  name: PlanetName,
  tropical: number,
  ayanamsa: number,
  lagnaSign: number,
  retrograde: boolean,
): Placement {
  const sidereal = normalizeDegrees(tropical - ayanamsa)
  const sign = signOf(sidereal)
  const nakshatra = nakshatraOf(sidereal)
  return {
    name,
    sidereal,
    sign,
    degreeInSign: sidereal % 30,
    house: ((sign - lagnaSign + 12) % 12) + 1,
    retrograde,
    nakshatra: nakshatra.index,
    pada: nakshatra.pada,
    navamsa: navamsaSign(sidereal),
  }
}

function isRetrograde(body: Body, date: Date): boolean {
  const now = tropicalLongitude(body, date)
  const later = tropicalLongitude(body, new Date(date.getTime() + 86_400_000))
  return shortestDelta(now, later) < 0
}

export function tropicalAscendant(date: Date, latitude: number, longitude: number): number {
  const ramc = ((SiderealTime(date) + longitude / 15) * 15 * Math.PI) / 180
  const tilt = (e_tilt(MakeTime(date)).tobl * Math.PI) / 180
  const phi = (latitude * Math.PI) / 180
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(tilt) + Math.tan(phi) * Math.sin(tilt)))
  return normalizeDegrees((asc * 180) / Math.PI)
}

function meanNodeLongitude(date: Date): number {
  const century = (date.getTime() / 86_400_000 + 2_440_587.5 - 2_451_545) / 36_525
  const omega =
    125.0445479 -
    1934.1362891 * century +
    0.0020754 * century * century +
    (century ** 3) / 467441 -
    (century ** 4) / 60_616_000
  return normalizeDegrees(omega)
}

function signOf(longitude: number): number {
  return Math.min(11, Math.floor(normalizeDegrees(longitude) / 30))
}
