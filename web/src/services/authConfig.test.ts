import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { authConfigured, inspectAuthConfig } from './authConfig.ts'
import { classifyAuthError, signupOutcome } from './authMessages.ts'

function token(role: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ role })).toString('base64url')
  return `${header}.${body}.signature`
}

describe('auth configuration', () => {
  it('stays unconfigured when the public Supabase values are absent', () => {
    assert.equal(authConfigured(), false)
    assert.deepEqual(inspectAuthConfig({}), { ok: false, issue: 'missing' })
    assert.deepEqual(inspectAuthConfig({ VITE_SUPABASE_URL: 'https://example.supabase.co' }), { ok: false, issue: 'missing' })
  })

  it('rejects an invalid URL, a placeholder key, and a service-role key', () => {
    assert.equal(inspectAuthConfig({ VITE_SUPABASE_URL: 'not a url', VITE_SUPABASE_ANON_KEY: token('anon') }).ok, false)
    assert.equal(
      inspectAuthConfig({ VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY' }).ok,
      false,
    )
    const service = inspectAuthConfig({ VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: token('service_role') })
    assert.deepEqual(service, { ok: false, issue: 'invalid' })
  })

  it('accepts an anon JWT and a publishable key', () => {
    const anon = inspectAuthConfig({ VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_ANON_KEY: token('anon') })
    assert.equal(anon.ok, true)
    const publishable = inspectAuthConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'sb_publishable_example_key_value',
    })
    assert.equal(publishable.ok, true)
  })

  it('maps duplicate accounts, bad passwords, and unconfirmed email without inventing a session', () => {
    assert.equal(classifyAuthError({ message: 'Invalid login credentials', code: 'invalid_credentials' }), 'invalid')
    assert.equal(classifyAuthError({ message: 'User already registered', code: 'user_already_exists' }), 'duplicate')
    assert.equal(classifyAuthError({ message: 'Email not confirmed', code: 'email_not_confirmed' }), 'unconfirmed')
    assert.equal(signupOutcome({ identities: [] }, false), 'duplicate')
    assert.equal(signupOutcome({ identities: [{}] }, false), 'confirm')
    assert.equal(signupOutcome({ identities: [{}] }, true), 'signed-in')
  })
})
