import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { BirthInput } from '../domain/birth.ts'
import { clearProfiles, deleteProfile, loadProfiles, upsertProfile, type SavedProfile } from '../domain/profiles.ts'

type ProfilesValue = {
  profiles: SavedProfile[]
  save: (input: BirthInput, id?: string) => SavedProfile
  remove: (id: string) => void
  clear: () => void
}

const ProfilesContext = createContext<ProfilesValue | null>(null)

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => loadProfiles(localStorage))
  const reload = useCallback(() => setProfiles(loadProfiles(localStorage)), [])
  const value = useMemo<ProfilesValue>(
    () => ({
      profiles,
      save: (input, id) => {
        const saved = upsertProfile(localStorage, input, id)
        reload()
        return saved
      },
      remove: (id) => {
        deleteProfile(localStorage, id)
        reload()
      },
      clear: () => {
        clearProfiles(localStorage)
        reload()
      },
    }),
    [profiles, reload],
  )
  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
}

export function useProfiles(): ProfilesValue {
  const value = useContext(ProfilesContext)
  if (!value) throw new Error('useProfiles must be used within ProfilesProvider')
  return value
}
