import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { findCity } from './places.ts'
import { profileFromRow, toBirthRow } from './birthRecord.ts'
import { clearProfiles, loadProfiles, upsertProfile, type SavedProfile, type Store } from './profiles.ts'
import {
  claimGuestProfiles,
  clearOwned,
  loadOwned,
  mergeProfiles,
  protectUnsentEdits,
  saveOwnedProfile,
  writeOwned,
} from './profileSync.ts'
import type { BirthInput } from './birth.ts'

const delhi = findCity('delhi')!
const userA = '11111111-1111-4111-8111-111111111111'
const userB = '22222222-2222-4222-8222-222222222222'
const profileId = '33333333-3333-4333-8333-333333333333'
const cloudId = '44444444-4444-4444-8444-444444444444'

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

function memory(): Store {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
  }
}

function profile(overrides: Partial<SavedProfile> = {}): SavedProfile {
  return {
    ...input,
    id: profileId,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('birth profile sync', () => {
  it('keeps a newer local profile and does not push when cloud is newer', () => {
    const local = profile({ fullName: 'Local Name', updatedAt: '2024-01-01T00:00:00.000Z' })
    const olderCloud = profile({ fullName: 'Cloud Name', updatedAt: '2023-01-01T00:00:00.000Z' })
    const newerCloud = profile({ fullName: 'Cloud Name', updatedAt: '2025-01-01T00:00:00.000Z' })
    const pushed = mergeProfiles([local], [olderCloud])
    assert.equal(pushed.merged[0]?.fullName, 'Local Name')
    assert.equal(pushed.toPush.length, 1)
    const kept = mergeProfiles([local], [newerCloud])
    assert.equal(kept.merged[0]?.fullName, 'Cloud Name')
    assert.equal(kept.toPush.length, 0)
  })

  it('does not push when the timestamps are equal', () => {
    const row = profile()
    const result = mergeProfiles([row], [profile({ fullName: 'Cloud Name' })])
    assert.equal(result.toPush.length, 0)
    assert.equal(result.merged[0]?.fullName, 'Cloud Name')
  })

  it('uses the cloud id when the same birth was saved twice', () => {
    const local = profile({ id: profileId, updatedAt: '2024-06-01T00:00:00.000Z' })
    const remote = profile({ id: cloudId, updatedAt: '2024-01-01T00:00:00.000Z' })
    const result = mergeProfiles([local], [remote])
    assert.equal(result.toPush[0]?.id, cloudId)
    assert.equal(result.merged.some((item) => item.id === profileId), false)
  })

  it('keeps an unsent local edit when the cloud timestamp is newer', () => {
    const sent = profile({ fullName: 'Sent', updatedAt: '2024-01-01T00:00:00.000Z' })
    const edited = profile({ fullName: 'Edited offline', updatedAt: '2024-02-01T00:00:00.000Z' })
    const remote = profile({ fullName: 'Sent', updatedAt: '2024-03-01T00:00:00.000Z' })
    const result = protectUnsentEdits([edited], [remote], [sent])
    assert.equal(result.merged[0]?.fullName, 'Edited offline')
    assert.equal(result.retry.length, 1)
  })

  it('hides a deleted id instead of restoring it from cloud', () => {
    const result = mergeProfiles([], [profile()], [profileId])
    assert.equal(result.merged.length, 0)
  })

  it('moves guest profiles into one account and leaves the other account untouched', () => {
    const storage = memory()
    storage.setItem('trikal.language', 'hi')
    const saved = upsertProfile(storage, input)
    writeOwned(storage, userB, [profile({ id: cloudId, fullName: 'Other Person' })])
    const claimed = claimGuestProfiles(storage, userA)
    assert.equal(claimed.length, 1)
    assert.equal(claimed[0]?.id, saved.id)
    assert.equal(loadProfiles(storage).length, 0)
    assert.equal(loadOwned(storage, userA)[0]?.fullName, 'Meera Iyer')
    assert.equal(loadOwned(storage, userB)[0]?.fullName, 'Other Person')
    assert.equal(storage.getItem('trikal.language'), 'hi')
    clearOwned(storage, userA)
    assert.equal(loadOwned(storage, userA).length, 0)
    assert.equal(loadOwned(storage, userB).length, 1)
    assert.equal(storage.getItem('trikal.language'), 'hi')
  })

  it('does not remove guest profiles when the account copy cannot be stored', () => {
    const storage = memory()
    upsertProfile(storage, input)
    const broken: Store = {
      getItem: storage.getItem,
      removeItem: storage.removeItem,
      setItem: (key, value) => {
        if (key.endsWith(userA)) throw new Error('full')
        storage.setItem(key, value)
      },
    }
    assert.throws(() => claimGuestProfiles(broken, userA))
    assert.equal(loadProfiles(storage).length, 1)
  })

  it('round-trips a listed city and drops another account’s row', () => {
    const row = toBirthRow(profile(), userA)
    assert.ok(row)
    assert.equal(row.user_id, userA)
    assert.equal(row.country_code, 'IN')
    assert.equal(row.location_source, 'gazetteer')
    assert.equal('password' in row, false)
    const restored = profileFromRow(
      { ...row, birth_time: '06:40:00', latitude: '28.61390', longitude: '77.20900' },
      userA,
    )
    assert.equal(restored?.cityId, 'delhi')
    assert.equal(restored?.country, 'India')
    assert.equal(profileFromRow(row, userB), null)
    assert.equal(toBirthRow(profile(), 'not-a-user'), null)
  })

  it('keeps the saved guest list when no account is active', () => {
    const storage = memory()
    upsertProfile(storage, input)
    saveOwnedProfile(storage, userA, profile())
    assert.equal(loadProfiles(storage).length, 1)
    clearProfiles(storage)
    assert.equal(loadOwned(storage, userA).length, 1)
  })
})
