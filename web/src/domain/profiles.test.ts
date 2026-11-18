import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { findCity } from './places.ts'
import { clearProfiles, deleteProfile, loadProfiles, upsertProfile, type SavedProfile } from './profiles.ts'
import type { BirthInput } from './birth.ts'

const delhi = findCity('delhi')!

const input: BirthInput = {
  fullName: 'Meera Iyer',
  birthDate: '1994-03-12',
  timePrecision: 'exact',
  birthTime: '06:40',
  timeZone: delhi.timeZone,
  cityId: delhi.id,
  cityLabel: delhi.label,
  country: delhi.country,
  latitude: delhi.latitude,
  longitude: delhi.longitude,
  gender: 'female',
}

function memory() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
  }
}

describe('profile storage', () => {
  it('saves, edits, and deletes only in the provided storage', () => {
    const storage = memory()
    const saved = upsertProfile(storage, input)
    const edited = upsertProfile(storage, { ...input, fullName: 'Meera Nair' }, saved.id)
    assert.equal(edited.id, saved.id)
    assert.equal(loadProfiles(storage)[0]?.fullName, 'Meera Nair')
    deleteProfile(storage, saved.id)
    assert.equal(loadProfiles(storage).length, 0)
    upsertProfile(storage, input)
    clearProfiles(storage)
    assert.deepEqual(loadProfiles(storage), [])
  })

  it('drops a stored row whose coordinates were altered', () => {
    const storage = memory()
    const saved: SavedProfile = { ...input, id: 'x', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z', latitude: 0 }
    storage.setItem('trikal.profiles.v1', JSON.stringify([saved]))
    assert.equal(loadProfiles(storage).length, 0)
  })
})
