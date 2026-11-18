import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { lahiriMeanDegrees, shortestDelta } from './ayanamsa.ts'
import { calculateChart, tropicalAscendant } from './chart.ts'
import { vimshottari } from './dasha.ts'
import { ganaOf, nadiOf, nakshatraOf } from './nakshatra.ts'
import { navamsaSign } from './navamsa.ts'
import { zonedLocalToUtc } from './time.ts'
import { gunaMilan } from './guna.ts'

describe('lahiri mean ayanamsa', () => {
  it('matches published mean values at 12:00 UTC within 0.01 degree', () => {
    const samples = [
      ['1900-01-01T12:00:00.000Z', 22.4605],
      ['2000-01-01T12:00:00.000Z', 23.8571],
      ['2020-01-01T12:00:00.000Z', 24.1365],
    ] as const
    for (const [iso, expected] of samples) {
      const actual = lahiriMeanDegrees(new Date(iso))
      assert.ok(Math.abs(actual - expected) < 0.01, `${iso} produced ${actual}, expected ${expected}`)
    }
  })
})

describe('time zones', () => {
  it('converts India and Britain, including British Summer Time', () => {
    assert.equal(zonedLocalToUtc('1994-03-12', '06:40', 'Asia/Kolkata').toISOString(), '1994-03-12T01:10:00.000Z')
    assert.equal(zonedLocalToUtc('2020-01-15', '12:00', 'Europe/London').toISOString(), '2020-01-15T12:00:00.000Z')
    assert.equal(zonedLocalToUtc('2020-06-15', '12:00', 'Europe/London').toISOString(), '2020-06-15T11:00:00.000Z')
  })
})

describe('nakshatra, navamsa, and dasha math', () => {
  it('places 0 degrees in Ashwini pada 1 and the next span in Bharani', () => {
    assert.deepEqual(nakshatraOf(0), { index: 0, pada: 1, degree: 0 })
    assert.equal(nakshatraOf(14).index, 1)
    assert.equal(nadiOf(0), 'adi')
    assert.equal(ganaOf(0), 'deva')
  })

  it('assigns every nakshatra to one nadi and one gana', () => {
    for (let index = 0; index < 27; index += 1) {
      assert.ok(nadiOf(index))
      assert.ok(ganaOf(index))
    }
  })

  it('starts movable Aries navamsa at Aries and steps by 3°20′', () => {
    assert.equal(navamsaSign(0), 0)
    assert.equal(navamsaSign(10 / 3), 1)
  })

  it('gives a full Ketu mahadasha at the start of Ashwini', () => {
    const result = vimshottari(0, new Date('2000-01-01T00:00:00.000Z'))
    assert.ok(Math.abs(result.balanceYears - 7) < 0.001)
    assert.equal(result.periods[0]?.lord, 'ketu')
    assert.equal(result.periods[0]?.antardasha[0]?.lord, 'ketu')
  })
})

describe('chart', () => {
  it('puts the Sun near 16 degrees of sidereal Sagittarius at 2000-01-01 00:00 UTC', () => {
    const chart = calculateChart({
      instant: new Date('2000-01-01T00:00:00.000Z'),
      latitude: 28.6139,
      longitude: 77.209,
      timeZone: 'Asia/Kolkata',
    })
    const sun = chart.planets.find((planet) => planet.name === 'sun')
    assert.ok(sun)
    assert.ok(Math.abs(shortestDelta(sun.sidereal, 256)) < 0.5, `Sun sidereal was ${sun.sidereal}`)
    assert.equal(sun.sign, 8)
    assert.equal(chart.planets.length, 9)
    assert.equal(chart.ephemeris.license, 'MIT')
    assert.equal(chart.planets.find((planet) => planet.name === 'rahu')?.retrograde, true)
    assert.equal(chart.planets.find((planet) => planet.name === 'sun')?.retrograde, false)
  })

  it('moves the ascendant forward as time passes', () => {
    const first = tropicalAscendant(new Date('2000-01-01T06:00:00.000Z'), 0, 0)
    const second = tropicalAscendant(new Date('2000-01-01T08:00:00.000Z'), 0, 0)
    const delta = shortestDelta(first, second)
    assert.ok(delta > 25 && delta < 35, `Ascendant moved ${delta} degrees`)
  })

  it('rejects impossible coordinates', () => {
    assert.throws(() =>
      calculateChart({
        instant: new Date('2000-01-01T00:00:00.000Z'),
        latitude: 120,
        longitude: 0,
        timeZone: 'UTC',
      }),
    )
  })
})

describe('guna milan', () => {
  it('scores the six supported kootas and withholds a total', () => {
    const same = gunaMilan({ moonSign: 3, nakshatra: 0 }, { moonSign: 3, nakshatra: 0 })
    assert.equal(same.total, null)
    assert.equal(same.withheld.length, 2)
    assert.equal(same.scored.find((item) => item.id === 'nadi')?.points, 0)
    assert.equal(same.scored.find((item) => item.id === 'bhakoot')?.points, 7)
    assert.equal(same.scored.find((item) => item.id === 'tara')?.points, 0)
    assert.equal(same.scored.find((item) => item.id === 'varna')?.points, 1)

    const adjacent = gunaMilan({ moonSign: 0, nakshatra: 0 }, { moonSign: 1, nakshatra: 3 })
    assert.equal(adjacent.scored.find((item) => item.id === 'bhakoot')?.points, 0)
    assert.equal(adjacent.scored.find((item) => item.id === 'nadi')?.points, 8)
  })
})
