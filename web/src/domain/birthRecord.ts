import type { SavedProfile } from './profiles.ts'
import { findCity, cities, type City } from './places.ts'
import { birthInputSchema } from './birth.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: string): boolean {
  return UUID.test(value)
}

export type BirthRow = {
  id: string
  user_id: string
  full_name: string
  birth_date: string
  birth_time: string | null
  time_precision: 'exact' | 'unknown'
  city_label: string
  country_code: string | null
  time_zone: string | null
  latitude: number | null
  longitude: number | null
  location_source: 'gazetteer' | 'unresolved'
  gender: 'female' | 'male' | 'other' | 'unspecified'
  is_primary: false
  created_at: string
  updated_at: string
}

export function toBirthRow(profile: SavedProfile, userId: string): BirthRow | null {
  if (!isUuid(profile.id) || !isUuid(userId)) return null
  const city = profile.cityId ? findCity(profile.cityId) : undefined
  const birthTime = profile.timePrecision === 'exact' ? profile.birthTime : null
  if (profile.timePrecision === 'exact' && !birthTime) return null
  return {
    id: profile.id.toLowerCase(),
    user_id: userId.toLowerCase(),
    full_name: profile.fullName,
    birth_date: profile.birthDate,
    birth_time: birthTime,
    time_precision: profile.timePrecision,
    city_label: profile.cityLabel,
    country_code: city?.countryCode ?? null,
    time_zone: profile.timeZone,
    latitude: city ? city.latitude : null,
    longitude: city ? city.longitude : null,
    location_source: city ? 'gazetteer' : 'unresolved',
    gender: profile.gender,
    is_primary: false,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  }
}

export function profileFromRow(row: unknown, expectedUserId: string): SavedProfile | null {
  if (!row || typeof row !== 'object' || !isUuid(expectedUserId)) return null
  const record = row as Record<string, unknown>
  if (typeof record.user_id !== 'string' || record.user_id.toLowerCase() !== expectedUserId.toLowerCase()) return null
  if (typeof record.id !== 'string' || !isUuid(record.id)) return null
  const timePrecision = record.time_precision === 'unknown' ? 'unknown' : record.time_precision === 'exact' ? 'exact' : null
  if (!timePrecision) return null
  const latitude = numberOrNull(record.latitude)
  const longitude = numberOrNull(record.longitude)
  const timeZone = typeof record.time_zone === 'string' ? record.time_zone : null
  const city = timePrecision && latitude !== null && longitude !== null ? cityForCoordinates(latitude, longitude, timeZone) : undefined
  const birthTime = timePrecision === 'exact' && typeof record.birth_time === 'string' ? record.birth_time.slice(0, 5) : null
  const countryCode = typeof record.country_code === 'string' ? record.country_code : ''
  const input = {
    fullName: record.full_name,
    birthDate: typeof record.birth_date === 'string' ? record.birth_date.slice(0, 10) : '',
    timePrecision,
    birthTime: timePrecision === 'unknown' ? null : birthTime,
    timeZone: city?.timeZone ?? timeZone,
    cityId: city?.id ?? null,
    cityLabel: typeof record.city_label === 'string' ? record.city_label : '',
    country: city?.country ?? (countryCode.length >= 2 ? countryCode : 'Not listed'),
    latitude: city ? city.latitude : null,
    longitude: city ? city.longitude : null,
    gender: record.gender,
  }
  const parsed = birthInputSchema.safeParse(input)
  if (!parsed.success) return null
  return {
    ...parsed.data,
    id: record.id.toLowerCase(),
    createdAt: typeof record.created_at === 'string' ? record.created_at : new Date(0).toISOString(),
    updatedAt: typeof record.updated_at === 'string' ? record.updated_at : new Date(0).toISOString(),
  }
}

export function sameBirth(left: SavedProfile, right: SavedProfile): boolean {
  return (
    left.fullName === right.fullName &&
    left.birthDate === right.birthDate &&
    left.timePrecision === right.timePrecision &&
    (left.timePrecision === 'unknown' ? true : left.birthTime === right.birthTime) &&
    left.cityLabel === right.cityLabel &&
    left.timeZone === right.timeZone &&
    left.gender === right.gender &&
    close(left.latitude, right.latitude) &&
    close(right.longitude, left.longitude)
  )
}

function cityForCoordinates(latitude: number, longitude: number, timeZone: string | null): City | undefined {
  return cities.find(
    (city) => city.timeZone === timeZone && Math.abs(city.latitude - latitude) < 0.0002 && Math.abs(city.longitude - longitude) < 0.0002,
  )
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function close(left: number | null, right: number | null): boolean {
  if (left === null || right === null) return left === right
  return Math.abs(left - right) < 0.0002
}
