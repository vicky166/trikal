export type AuthConfigIssue = 'missing' | 'invalid'

export type AuthConfigResult = { ok: true; url: string; anonKey: string } | { ok: false; issue: AuthConfigIssue }

export function inspectAuthConfig(env: Record<string, string | undefined> | undefined): AuthConfigResult {
  const url = env?.VITE_SUPABASE_URL?.trim() ?? ''
  const anonKey = env?.VITE_SUPABASE_ANON_KEY?.trim() ?? ''
  if (!url || !anonKey) return { ok: false, issue: 'missing' }
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { ok: false, issue: 'invalid' }
  }
  if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') || !parsed.hostname) {
    return { ok: false, issue: 'invalid' }
  }
  if (!acceptableAnonKey(anonKey)) return { ok: false, issue: 'invalid' }
  return { ok: true, url, anonKey }
}

export function publicSupabase(): { url: string; anonKey: string } | null {
  const result = inspectAuthConfig(readEnv())
  return result.ok ? { url: result.url, anonKey: result.anonKey } : null
}

export function authConfigured(): boolean {
  return publicSupabase() !== null
}

export function authIssue(): AuthConfigIssue | null {
  const result = inspectAuthConfig(readEnv())
  return result.ok ? null : result.issue
}

function readEnv(): Record<string, string | undefined> | undefined {
  return (import.meta as { env?: Record<string, string | undefined> }).env
}

function acceptableAnonKey(key: string): boolean {
  if (key.startsWith('sb_publishable_') && key.length > 'sb_publishable_'.length + 8) return true
  const parts = key.split('.')
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) return false
  const payload = decodeJwtPayload(parts[1] ?? '')
  return payload?.role === 'anon'
}

function decodeJwtPayload(segment: string): { role?: string } | null {
  try {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (segment.length % 4)) % 4)
    const parsed = JSON.parse(globalThis.atob(padded)) as { role?: unknown }
    return typeof parsed.role === 'string' ? { role: parsed.role } : null
  } catch {
    return null
  }
}
