export type AuthFailure = 'invalid' | 'duplicate' | 'unconfirmed' | 'session' | 'other'

export function classifyAuthError(error: { message: string; code?: string | null }): AuthFailure {
  const text = `${error.code ?? ''} ${error.message}`.toLowerCase()
  if (text.includes('invalid_credentials') || text.includes('invalid login')) return 'invalid'
  if (text.includes('email_not_confirmed') || text.includes('not confirmed')) return 'unconfirmed'
  if (text.includes('user_already') || text.includes('already registered') || text.includes('already been registered')) return 'duplicate'
  if (text.includes('auth session missing') || text.includes('session missing') || text.includes('session_not_found')) return 'session'
  return 'other'
}

export function signupOutcome(user: { identities?: unknown[] | null } | null, hasSession: boolean): 'signed-in' | 'duplicate' | 'confirm' {
  if (hasSession) return 'signed-in'
  if (user && Array.isArray(user.identities) && user.identities.length === 0) return 'duplicate'
  return 'confirm'
}
