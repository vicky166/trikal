import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BirthInput } from '../domain/birth.ts'
import { isUuid } from '../domain/birthRecord.ts'
import { clearProfiles, deleteProfile, loadProfiles, upsertProfile, type SavedProfile } from '../domain/profiles.ts'
import { claimGuestProfiles, clearOwned, deleteOwnedProfile, loadOwned, readValidatedUser, saveOwnedProfile } from '../domain/profileSync.ts'
import type { BirthSyncResult, SyncStatus } from '../services/birthSync.ts'
import { authConfigured } from '../services/authConfig.ts'

type ProfilesValue = {
  profiles: SavedProfile[]
  syncStatus: SyncStatus
  syncDetail: string
  save: (input: BirthInput, id?: string) => SavedProfile
  remove: (id: string) => void
  clear: () => void
  retrySync: () => void
}

const ProfilesContext = createContext<ProfilesValue | null>(null)

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => loadProfiles(localStorage))
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local')
  const [syncDetail, setSyncDetail] = useState('')
  const ownerRef = useRef<string | null>(null)
  const sessionRef = useRef<string | null>(null)
  const run = useRef(0)
  const [trackedSession, setTrackedSession] = useState<string | null>(null)
  if (sessionUserId !== trackedSession) {
    setTrackedSession(sessionUserId)
    if (sessionUserId && readValidatedUser(localStorage) === sessionUserId) {
      const claimed = claimGuestProfiles(localStorage, sessionUserId)
      setOwnerId(sessionUserId)
      setProfiles(claimed)
      setSyncStatus('syncing')
    } else if (sessionUserId) {
      setOwnerId(null)
      setProfiles([])
      setSyncStatus('syncing')
    } else {
      setOwnerId(null)
      setProfiles(loadProfiles(localStorage))
      setSyncStatus('local')
    }
    setSyncDetail('')
  }

  useEffect(() => {
    ownerRef.current = ownerId
  }, [ownerId])

  useEffect(() => {
    sessionRef.current = sessionUserId
  }, [sessionUserId])

  const applyResult = useCallback((result: BirthSyncResult, activeUserId: string | null) => {
    if (!activeUserId) return
    if (result.status === 'offline' && readValidatedUser(localStorage) === activeUserId) {
      setOwnerId(activeUserId)
      setProfiles(loadOwned(localStorage, activeUserId))
      setSyncStatus('offline')
      setSyncDetail('')
      return
    }
    if (!result.userId || result.userId !== activeUserId || result.status === 'unauthorized') {
      setOwnerId(null)
      setProfiles(loadProfiles(localStorage))
      setSyncStatus('local')
      setSyncDetail('')
      return
    }
    setOwnerId(result.userId)
    if (result.profiles) setProfiles(result.profiles)
    setSyncStatus(result.status)
    setSyncDetail(result.detail)
  }, [])

  const syncNow = useCallback(
    (activeUserId: string | null) => {
      if (!activeUserId || !authConfigured()) return
      const token = ++run.current
      setSyncStatus('syncing')
      void import('../services/birthSync.ts')
        .then(({ syncBirthProfiles }) => syncBirthProfiles())
        .then((result) => {
          if (token !== run.current) return
          applyResult(result, activeUserId)
        })
        .catch(() => {
          if (token !== run.current) return
          setSyncStatus('error')
          setSyncDetail('')
        })
    },
    [applyResult],
  )

  useEffect(() => {
    if (!authConfigured()) return
    let cancelled = false
    let unsubscribe = () => {}
    void import('../services/supabase.ts').then(async ({ getSupabase }) => {
      const supabase = getSupabase()
      if (!supabase || cancelled) return
      const applySession = (userId: string | undefined) => {
        const next = userId && isUuid(userId) ? userId.toLowerCase() : null
        if (!cancelled) setSessionUserId(next)
      }
      const existing = await supabase.auth.getSession()
      if (cancelled) return
      applySession(existing.data.session?.user.id)
      const { data } = supabase.auth.onAuthStateChange((_event, next) => {
        applySession(next?.user.id)
      })
      unsubscribe = () => data.subscription.unsubscribe()
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const token = ++run.current
    if (!sessionUserId) return
    const userId = sessionUserId
    const timer = window.setTimeout(() => {
      if (token !== run.current) return
      syncNow(userId)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [sessionUserId, syncNow])

  useEffect(() => {
    const onOnline = () => syncNow(sessionRef.current)
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [syncNow])

  const value = useMemo<ProfilesValue>(
    () => ({
      profiles,
      syncStatus,
      syncDetail,
      save: (input, id) => {
        const owner = ownerRef.current
        if (!owner) {
          const saved = upsertProfile(localStorage, input, id)
          setProfiles(loadProfiles(localStorage))
          return saved
        }
        const saved = storedProfile(loadOwned(localStorage, owner), input, id)
        saveOwnedProfile(localStorage, owner, saved)
        setProfiles(loadOwned(localStorage, owner))
        syncNow(owner)
        return saved
      },
      remove: (id) => {
        const owner = ownerRef.current
        if (!owner) {
          deleteProfile(localStorage, id)
          setProfiles(loadProfiles(localStorage))
          return
        }
        deleteOwnedProfile(localStorage, owner, id)
        setProfiles(loadOwned(localStorage, owner))
        syncNow(owner)
      },
      clear: () => {
        const owner = ownerRef.current
        if (!owner) {
          clearProfiles(localStorage)
          setProfiles([])
          return
        }
        clearOwned(localStorage, owner)
        setProfiles([])
        syncNow(owner)
      },
      retrySync: () => syncNow(sessionRef.current ?? ownerRef.current),
    }),
    [profiles, syncDetail, syncNow, syncStatus],
  )

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
}

export function useProfiles(): ProfilesValue {
  const value = useContext(ProfilesContext)
  if (!value) throw new Error('useProfiles must be used within ProfilesProvider')
  return value
}

function storedProfile(existing: SavedProfile[], input: BirthInput, id?: string): SavedProfile {
  const now = new Date().toISOString()
  const current = id ? existing.find((profile) => profile.id === id) : undefined
  return {
    ...input,
    id: current?.id ?? (id && isUuid(id) ? id : crypto.randomUUID()),
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }
}
