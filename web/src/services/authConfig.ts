export function publicSupabase(): { url: string; anonKey: string } | null {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env
  const url = env?.VITE_SUPABASE_URL?.trim() ?? ''
  const anonKey = env?.VITE_SUPABASE_ANON_KEY?.trim() ?? ''
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export function authConfigured(): boolean {
  return publicSupabase() !== null
}
