import { birthInputSchema, type BirthInput } from './birth.ts'

const KEY = 'trikal.profiles.v1'

export type SavedProfile = BirthInput & {
  id: string
  createdAt: string
  updatedAt: string
}

export type Store = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function loadProfiles(storage: Store): SavedProfile[] {
  return readKey(storage, KEY)
}

export function upsertProfile(storage: Store, input: BirthInput, id?: string): SavedProfile {
  const profiles = loadProfiles(storage)
  const next = nextProfile(profiles, input, id)
  writeKey(storage, KEY, [next, ...profiles.filter((profile) => profile.id !== next.id)])
  return next
}

export function deleteProfile(storage: Store, id: string): void {
  const profiles = loadProfiles(storage).filter((profile) => profile.id !== id)
  writeKey(storage, KEY, profiles)
}

export function clearProfiles(storage: Store): void {
  storage.removeItem(KEY)
}

export function readKey(storage: Store, key: string): SavedProfile[] {
  return parseProfiles(storage.getItem(key))
}

export function writeKey(storage: Store, key: string, profiles: SavedProfile[]): void {
  storage.setItem(key, JSON.stringify(profiles))
}

function parseProfiles(raw: string | null): SavedProfile[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') return []
      const record = item as Partial<SavedProfile>
      const input = birthInputSchema.safeParse(record)
      if (!input.success || typeof record.id !== 'string') return []
      return [
        {
          ...input.data,
          id: record.id,
          createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date(0).toISOString(),
          updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : new Date(0).toISOString(),
        },
      ]
    })
  } catch {
    return []
  }
}

function nextProfile(profiles: SavedProfile[], input: BirthInput, id?: string): SavedProfile {
  const now = new Date().toISOString()
  const existing = id ? profiles.find((profile) => profile.id === id) : undefined
  return {
    ...input,
    id: existing?.id ?? id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}
