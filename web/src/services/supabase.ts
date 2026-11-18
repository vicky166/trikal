import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { publicSupabase } from './authConfig.ts'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const config = publicSupabase()
  if (!config) return null
  if (!client) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}
