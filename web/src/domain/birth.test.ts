import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { birthInputSchema, chartReady } from './birth.ts'
import { findCity } from './places.ts'

const delhi = findCity('delhi')!

const valid = {
  fullName: 'Meera Iyer',
  birthDate: '1994-03-12',
  timePrecision: 'exact' as const,
  birthTime: '06:40',
  timeZone: delhi.timeZone,
  cityId: delhi.id,
  cityLabel: delhi.label,
  country: delhi.country,
  latitude: delhi.latitude,
  longitude: delhi.longitude,
  gender: 'female' as const,
}

describe('birth details', () => {
  it('accepts a listed city and marks the profile ready', () => {
    const parsed = birthInputSchema.parse(valid)
    assert.equal(chartReady(parsed), 'ready')
  })

  it('rejects a future date', () => {
    assert.equal(birthInputSchema.safeParse({ ...valid, birthDate: '2999-01-01' }).success, false)
  })

  it('does not treat an unknown birth time as chart-ready', () => {
    const parsed = birthInputSchema.parse({ ...valid, timePrecision: 'unknown', birthTime: null })
    assert.equal(chartReady(parsed), 'time')
  })

  it('rejects an unknown time that still carries a clock value', () => {
    assert.equal(
      birthInputSchema.safeParse({ ...valid, timePrecision: 'unknown', birthTime: '06:40' }).success,
      false,
    )
  })

  it('rejects coordinates that do not belong to the selected city', () => {
    assert.equal(birthInputSchema.safeParse({ ...valid, latitude: 0 }).success, false)
  })

  it('rejects coordinates when no city was selected', () => {
    assert.equal(
      birthInputSchema.safeParse({ ...valid, cityId: null, latitude: 1, longitude: 1 }).success,
      false,
    )
  })
})
