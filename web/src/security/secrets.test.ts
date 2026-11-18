import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function files(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    if (statSync(path).isDirectory()) return files(path)
    if (path.endsWith('.test.ts')) return []
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : []
  })
}

describe('frontend secrets', () => {
  it('does not read the service role or an AI key in browser source', () => {
    const source = files(root).map((path) => readFileSync(path, 'utf8')).join('\n')
    assert.equal(source.includes('SUPABASE_SERVICE_ROLE_KEY'), false)
    assert.equal(source.includes('OPENAI_API_KEY'), false)
    assert.equal(source.includes('VITE_OPENAI'), false)
  })
})
