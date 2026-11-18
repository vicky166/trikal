import { isUuid, sameBirth } from './birthRecord.ts'
import { clearProfiles, loadProfiles, readKey, writeKey, type SavedProfile, type Store } from './profiles.ts'

const USER_PREFIX = 'trikal.profiles.v1.'
const TOMBSTONE_PREFIX = 'trikal.profile-tombstones.v1.'
const PENDING_PREFIX = 'trikal.profile-pending.v1.'
const VALIDATED_USER_KEY = 'trikal.validated-user.v1'

export function userStorageKey(userId: string): string | null {
  if (!isUuid(userId)) return null
  return USER_PREFIX + userId.toLowerCase()
}

export function loadOwned(storage: Store, userId: string): SavedProfile[] {
  const key = userStorageKey(userId)
  if (!key) return []
  return readKey(storage, key)
}

export function writeOwned(storage: Store, userId: string, profiles: SavedProfile[]): void {
  const key = userStorageKey(userId)
  if (!key) return
  writeKey(storage, key, profiles)
}

export function readValidatedUser(storage: Store): string | null {
  const value = storage.getItem(VALIDATED_USER_KEY)
  return value && isUuid(value) ? value.toLowerCase() : null
}

export function writeValidatedUser(storage: Store, userId: string): void {
  if (!isUuid(userId)) return
  storage.setItem(VALIDATED_USER_KEY, userId.toLowerCase())
}

export function tombstones(storage: Store, userId: string): string[] {
  return readIdList(storage, tombstoneKey(userId))
}

export function addTombstones(storage: Store, userId: string, ids: readonly string[]): void {
  const key = tombstoneKey(userId)
  if (!key) return
  const next = new Set(tombstones(storage, userId))
  for (const id of ids) {
    if (isUuid(id)) next.add(id.toLowerCase())
  }
  storage.setItem(key, JSON.stringify([...next]))
}

export function pendingIds(storage: Store, userId: string): string[] {
  return readIdList(storage, pendingKey(userId))
}

export function markPending(storage: Store, userId: string, ids: readonly string[]): void {
  const key = pendingKey(userId)
  if (!key) return
  const next = new Set(pendingIds(storage, userId))
  for (const id of ids) {
    if (isUuid(id)) next.add(id.toLowerCase())
  }
  storage.setItem(key, JSON.stringify([...next]))
}

export function clearPending(storage: Store, userId: string, ids: readonly string[]): void {
  const key = pendingKey(userId)
  if (!key) return
  const drop = new Set(ids.filter((id) => isUuid(id)).map((id) => id.toLowerCase()))
  const next = pendingIds(storage, userId).filter((id) => !drop.has(id))
  if (next.length === 0) storage.removeItem(key)
  else storage.setItem(key, JSON.stringify(next))
}

export function removeTombstones(storage: Store, userId: string, ids: readonly string[]): void {
  const key = tombstoneKey(userId)
  if (!key) return
  const drop = new Set(ids.filter((id) => isUuid(id)).map((id) => id.toLowerCase()))
  const next = tombstones(storage, userId).filter((id) => !drop.has(id))
  if (next.length === 0) storage.removeItem(key)
  else storage.setItem(key, JSON.stringify(next))
}

export function saveOwnedProfile(storage: Store, userId: string, profile: SavedProfile): SavedProfile | null {
  if (!userStorageKey(userId) || !isUuid(profile.id)) return null
  const profiles = loadOwned(storage, userId)
  writeOwned(storage, userId, [profile, ...profiles.filter((item) => item.id !== profile.id)])
  removeTombstones(storage, userId, [profile.id])
  return profile
}

export function deleteOwnedProfile(storage: Store, userId: string, id: string): void {
  if (!userStorageKey(userId)) return
  writeOwned(
    storage,
    userId,
    loadOwned(storage, userId).filter((profile) => profile.id !== id),
  )
  if (isUuid(id)) addTombstones(storage, userId, [id])
}

export function clearOwned(storage: Store, userId: string): string[] {
  const existing = loadOwned(storage, userId)
  writeOwned(storage, userId, [])
  addTombstones(
    storage,
    userId,
    existing.map((profile) => profile.id),
  )
  return existing.map((profile) => profile.id)
}

export function claimGuestProfiles(storage: Store, userId: string): SavedProfile[] {
  if (!userStorageKey(userId)) return loadProfiles(storage)
  const guest = loadProfiles(storage)
  const owned = loadOwned(storage, userId)
  const { merged } = mergeProfiles(guest, owned)
  writeOwned(storage, userId, merged)
  const written = loadOwned(storage, userId)
  const writtenIds = new Set(written.map((profile) => profile.id))
  const writtenNatural = new Set(written.map(naturalKey))
  const remaining = guest.filter((profile) => !writtenIds.has(profile.id) && !writtenNatural.has(naturalKey(profile)))
  if (remaining.length === 0) clearProfiles(storage)
  else writeKey(storage, 'trikal.profiles.v1', remaining)
  return written
}

export function mergeProfiles(
  local: SavedProfile[],
  remote: SavedProfile[],
  excludedIds: readonly string[] = [],
): { merged: SavedProfile[]; toPush: SavedProfile[] } {
  const excluded = new Set(excludedIds.map((id) => id.toLowerCase()))
  const sourceLocal = local.filter((profile) => !excluded.has(profile.id.toLowerCase()))
  const sourceRemote = remote.filter((profile) => !excluded.has(profile.id.toLowerCase()))
  const remoteById = new Map(sourceRemote.map((profile) => [profile.id, profile]))
  const remoteByNatural = new Map(sourceRemote.map((profile) => [naturalKey(profile), profile]))
  const usedRemote = new Set<string>()
  const merged: SavedProfile[] = []
  const toPush: SavedProfile[] = []

  for (const row of sourceLocal) {
    const byId = remoteById.get(row.id)
    const byNatural = remoteByNatural.get(naturalKey(row))
    const cloud = byId ?? (byNatural && byNatural.id !== row.id ? byNatural : undefined)
    if (!cloud) {
      merged.push(row)
      toPush.push(row)
      continue
    }
    usedRemote.add(cloud.id)
    if (stamp(row) > stamp(cloud)) {
      const chosen = byId ? row : { ...row, id: cloud.id, createdAt: cloud.createdAt }
      merged.push(chosen)
      toPush.push(chosen)
    } else {
      merged.push(cloud)
    }
  }

  for (const cloud of sourceRemote) {
    if (!usedRemote.has(cloud.id)) merged.push(cloud)
  }

  merged.sort((left, right) => stamp(right) - stamp(left))
  return { merged, toPush }
}

export function protectUnsentEdits(
  local: SavedProfile[],
  remote: SavedProfile[],
  sent: SavedProfile[],
): { merged: SavedProfile[]; retry: SavedProfile[] } {
  const remoteById = new Map(remote.map((profile) => [profile.id, profile]))
  const sentById = new Map(sent.map((profile) => [profile.id, profile]))
  const retry: SavedProfile[] = []
  const seen = new Set<string>()
  const merged = local.map((row) => {
    seen.add(row.id)
    const cloud = remoteById.get(row.id)
    const pushed = sentById.get(row.id)
    if (!cloud) return row
    if (pushed && !sameBirth(row, pushed)) {
      retry.push(row)
      return row
    }
    if (stamp(row) > stamp(cloud)) return row
    return cloud
  })
  for (const cloud of remote) {
    if (!seen.has(cloud.id)) merged.push(cloud)
  }
  merged.sort((left, right) => stamp(right) - stamp(left))
  return { merged, retry }
}

export function naturalKey(profile: SavedProfile): string {
  return [profile.fullName.trim().toLowerCase(), profile.birthDate, profile.birthTime ?? '', profile.cityLabel.trim().toLowerCase(), profile.timePrecision].join('|')
}

function tombstoneKey(userId: string): string | null {
  if (!isUuid(userId)) return null
  return TOMBSTONE_PREFIX + userId.toLowerCase()
}

function pendingKey(userId: string): string | null {
  if (!isUuid(userId)) return null
  return PENDING_PREFIX + userId.toLowerCase()
}

function readIdList(storage: Store, key: string | null): string[] {
  if (!key) return []
  const raw = storage.getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string' && isUuid(item)).map((item) => item.toLowerCase())
  } catch {
    return []
  }
}

function stamp(profile: SavedProfile): number {
  const value = Date.parse(profile.updatedAt)
  return Number.isFinite(value) ? value : 0
}
