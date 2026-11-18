import { chartReady, type BirthInput } from '../domain/birth.ts'
import { calculateChart, type Chart } from './chart.ts'
import { zonedLocalToUtc } from './time.ts'

export function chartFromProfile(profile: BirthInput): Chart | null {
  if (chartReady(profile) !== 'ready') return null
  if (!profile.birthTime || !profile.timeZone || profile.latitude === null || profile.longitude === null) return null
  return calculateChart({
    instant: zonedLocalToUtc(profile.birthDate, profile.birthTime, profile.timeZone),
    latitude: profile.latitude,
    longitude: profile.longitude,
    timeZone: profile.timeZone,
  })
}
