import { profileFromRow, toBirthRow, type BirthRow } from '../domain/birthRecord.ts'
import {
  addTombstones,
  claimGuestProfiles,
  clearPending,
  loadOwned,
  markPending,
  mergeProfiles,
  pendingIds,
  protectUnsentEdits,
  removeTombstones,
  tombstones,
  writeOwned,
  writeValidatedUser,
} from '../domain/profileSync.ts'
import type { SavedProfile, Store } from '../domain/profiles.ts'
import { getSupabase } from './supabase.ts'

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline' | 'error' | 'schema'

export type BirthSyncResult = {
  status: Exclude<SyncStatus, 'local' | 'syncing'> | 'unauthorized'
  userId: string | null
  profiles: SavedProfile[] | null
  detail: string
}

const columns = 'id, user_id, full_name, birth_date, birth_time, time_precision, city_label, country_code, time_zone, latitude, longitude, location_source, gender, is_primary, created_at, updated_at'

export async function syncBirthProfiles(storage: Store = localStorage): Promise<BirthSyncResult> {
  const supabase = getSupabase()
  if (!supabase) return { status: 'unauthorized', userId: null, profiles: null, detail: '' }
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return { status: isOffline(error) ? 'offline' : 'unauthorized', userId: null, profiles: null, detail: '' }
  }
  const userId = data.user.id.toLowerCase()
  writeValidatedUser(storage, userId)
  const local = claimGuestProfiles(storage, userId)
  const excluded = tombstones(storage, userId)
  const remaining = await deleteRows(supabase, excluded)
  if (remaining.length !== excluded.length) writeTombstoneList(storage, userId, remaining)

  const read = await supabase.from('birth_profiles').select(columns)
  if (read.error) {
    if (isOffline(read.error)) return { status: 'offline', userId, profiles: local, detail: '' }
    if (isSchema(read.error)) return { status: 'schema', userId, profiles: local, detail: '' }
    return { status: 'error', userId, profiles: local, detail: safeDetail(read.error.message) }
  }

  const remote = (read.data ?? []).flatMap((row) => {
    const profile = profileFromRow(row, userId)
    return profile ? [profile] : []
  })
  const excludedNow = tombstones(storage, userId)
  const owned = loadOwned(storage, userId)
  const pending = new Set(pendingIds(storage, userId))
  const { toPush } = mergeProfiles(owned, remote, excludedNow)
  const queue = [...toPush]
  for (const profile of owned) {
    if (pending.has(profile.id) && !queue.some((item) => item.id === profile.id) && !excludedNow.includes(profile.id)) queue.push(profile)
  }
  const sent: SavedProfile[] = []
  let failed = false
  let schema = false
  let detail = ''
  for (const profile of queue) {
    const result = await writeBirthRow(supabase, profile, userId, remote.some((row) => row.id === profile.id))
    if (result.ok) sent.push(profile)
    else {
      failed = true
      schema = schema || result.schema
      if (result.detail) detail = result.detail
    }
  }
  const failedIds = queue.filter((profile) => !sent.some((item) => item.id === profile.id)).map((profile) => profile.id)
  clearPending(storage, userId, sent.map((profile) => profile.id))
  markPending(storage, userId, failedIds)
  const remoteAfter = await reloadRemote(supabase, userId, remote, sent)
  const localNow = loadOwned(storage, userId)
  const kept = new Set(pendingIds(storage, userId))
  const hidden = new Set(tombstones(storage, userId))
  const reconciled = new Map(
    protectUnsentEdits(localNow, remoteAfter, sent).merged.filter((profile) => !hidden.has(profile.id)).map((profile) => [profile.id, profile]),
  )
  for (const profile of localNow) {
    if (kept.has(profile.id)) reconciled.set(profile.id, profile)
  }
  writeOwned(
    storage,
    userId,
    [...reconciled.values()].filter((profile) => !hidden.has(profile.id)),
  )
  const profiles = loadOwned(storage, userId)
  if (schema) return { status: 'schema', userId, profiles, detail: '' }
  if (failed) return { status: 'error', userId, profiles, detail }
  return { status: 'synced', userId, profiles, detail: '' }
}

export async function deleteBirthProfiles(ids: string[], expectedUserId: string, storage: Store = localStorage): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user || data.user.id.toLowerCase() !== expectedUserId.toLowerCase()) return
  const remaining = await deleteRows(supabase, ids)
  if (remaining.length === 0) removeTombstones(storage, expectedUserId, ids)
  else addTombstones(storage, expectedUserId, remaining)
}

async function reloadRemote(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  userId: string,
  fallback: SavedProfile[],
  sent: SavedProfile[],
): Promise<SavedProfile[]> {
  if (sent.length === 0) return fallback
  const read = await supabase.from('birth_profiles').select(columns)
  if (read.error || !read.data) return fallback
  const remote = read.data.flatMap((row) => {
    const profile = profileFromRow(row, userId)
    return profile ? [profile] : []
  })
  return remote
}

async function writeBirthRow(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  profile: SavedProfile,
  userId: string,
  exists: boolean,
): Promise<{ ok: true } | { ok: false; detail: string; schema: boolean }> {
  const row = toBirthRow(profile, userId)
  if (!row || row.user_id !== userId) return { ok: false, detail: '', schema: false }
  const result = exists ? await supabase.from('birth_profiles').update(updatePayload(row)).eq('id', row.id) : await supabase.from('birth_profiles').insert(insertPayload(row))
  if (!result.error) return { ok: true }
  return { ok: false, detail: isSchema(result.error) ? '' : safeDetail(result.error.message), schema: isSchema(result.error) }
}

function insertPayload(row: BirthRow): Record<string, unknown> {
  return { ...row }
}

function updatePayload(row: BirthRow): Record<string, unknown> {
  return {
    full_name: row.full_name,
    birth_date: row.birth_date,
    birth_time: row.birth_time,
    time_precision: row.time_precision,
    city_label: row.city_label,
    country_code: row.country_code,
    time_zone: row.time_zone,
    latitude: row.latitude,
    longitude: row.longitude,
    location_source: row.location_source,
    gender: row.gender,
    updated_at: row.updated_at,
  }
}

async function deleteRows(supabase: NonNullable<ReturnType<typeof getSupabase>>, ids: readonly string[]): Promise<string[]> {
  const remaining: string[] = []
  for (const id of ids) {
    const result = await supabase.from('birth_profiles').delete().eq('id', id)
    if (result.error) remaining.push(id)
  }
  return remaining
}

function writeTombstoneList(storage: Store, userId: string, ids: string[]): void {
  removeTombstones(storage, userId, tombstones(storage, userId))
  addTombstones(storage, userId, ids)
}

function isOffline(error: { message?: string; code?: string; name?: string } | null): boolean {
  if (!error) return false
  const text = `${error.code ?? ''} ${error.name ?? ''} ${error.message ?? ''}`.toLowerCase()
  return text.includes('fetch') || text.includes('network') || text.includes('offline') || text.includes('timeout') || text.includes('econn') || text.includes('load failed')
}

function isSchema(error: { message?: string; code?: string }): boolean {
  const text = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase()
  return text.includes('42p01') || text.includes('23503') || text.includes('pgrst205') || text.includes('pgrst204') || text.includes('schema cache') || text.includes('does not exist')
}

function safeDetail(message: string): string {
  if (/apikey|bearer|service_role|password/i.test(message)) return ''
  return message.slice(0, 180)
}
