import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { authConfigured } from './authConfig.ts'

describe('auth configuration', () => {
  it('stays unconfigured when the public Supabase values are absent', () => {
    assert.equal(authConfigured(), false)
  })
})
