import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabase } from './supabase.ts'
import { authConfigured } from './authConfig.ts'

export function useSession() {
  const configured = authConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!configured)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setReady(true)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  return { configured, ready, session }
}
