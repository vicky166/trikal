import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { bhagyankFromDate, digitalRoot, moolankFromDate, namankFromName } from './numerology.ts'

describe('numerology', () => {
  it('reduces a birth day to one digit', () => {
    assert.equal(digitalRoot(29), 2)
    assert.deepEqual(moolankFromDate('1996-11-29'), { day: 29, number: 2 })
    assert.equal(moolankFromDate('1996-11-09')?.number, 9)
  })

  it('reduces the full date for bhagyank', () => {
    assert.equal(bhagyankFromDate('1996-11-29'), digitalRoot(1 + 9 + 9 + 6 + 1 + 1 + 2 + 9))
    assert.equal(bhagyankFromDate('1996-02-31'), null)
  })

  it('uses Chaldean values for a name', () => {
    assert.equal(namankFromName('A')?.number ?? null, null)
    const named = namankFromName('Aditya')
    assert.ok(named)
    assert.equal(named.number, digitalRoot(named.total))
  })
})
