import { ganaOf, nadiOf, type Gana, type Nadi } from './nakshatra.ts'

export type Lord = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn'
export type Varna = 'brahmin' | 'kshatriya' | 'vaishya' | 'shudra'

const SIGN_LORD: Lord[] = [
  'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
]

const FRIENDS: Record<Lord, Lord[]> = {
  sun: ['moon', 'mars', 'jupiter'],
  moon: ['sun', 'mercury'],
  mars: ['sun', 'moon', 'jupiter'],
  mercury: ['sun', 'venus'],
  jupiter: ['sun', 'moon', 'mars'],
  venus: ['mercury', 'saturn'],
  saturn: ['mercury', 'venus'],
}

const ENEMIES: Record<Lord, Lord[]> = {
  sun: ['venus', 'saturn'],
  moon: [],
  mars: ['mercury'],
  mercury: ['moon'],
  jupiter: ['mercury', 'venus'],
  venus: ['sun', 'moon'],
  saturn: ['sun', 'moon', 'mars'],
}

export type KootaScore = { id: string; points: number; max: number; note: string }

export type GunaResult = {
  scored: KootaScore[]
  withheld: { id: 'yoni' | 'vashya'; reason: string }[]
  total: null
  max: 36
}

export function gunaMilan(first: { moonSign: number; nakshatra: number }, second: { moonSign: number; nakshatra: number }): GunaResult {
  return {
    scored: [
      varna(first.moonSign, second.moonSign),
      tara(first.nakshatra, second.nakshatra),
      gana(first.nakshatra, second.nakshatra),
      maitri(first.moonSign, second.moonSign),
      bhakoot(first.moonSign, second.moonSign),
      nadi(first.nakshatra, second.nakshatra),
    ],
    withheld: [
      { id: 'yoni', reason: 'The full friend and enemy animal table is not included, so Yoni points are not scored.' },
      { id: 'vashya', reason: 'Half-sign Vashya classes differ between sources, so Vashya points are not scored.' },
    ],
    total: null,
    max: 36,
  }
}

function varna(groomSign: number, brideSign: number): KootaScore {
  const rank = { brahmin: 4, kshatriya: 3, vaishya: 2, shudra: 1 }
  const points = rank[varnaOf(groomSign)] >= rank[varnaOf(brideSign)] ? 1 : 0
  return { id: 'varna', points, max: 1, note: 'Traditional order: the first profile is treated as the groom.' }
}

export function varnaOf(sign: number): Varna {
  const element = sign % 4
  if (element === 3) return 'brahmin'
  if (element === 0) return 'kshatriya'
  if (element === 1) return 'vaishya'
  return 'shudra'
}

function tara(first: number, second: number): KootaScore {
  const one = auspiciousTara(first, second)
  const two = auspiciousTara(second, first)
  const points = one && two ? 3 : one || two ? 1.5 : 0
  return { id: 'tara', points, max: 3, note: 'Counted both ways. Janma, Vipat, Pratyak, and Naidhana score nothing in that direction.' }
}

function auspiciousTara(from: number, to: number): boolean {
  const taraIndex = ((to - from + 27) % 27) % 9
  return taraIndex === 1 || taraIndex === 3 || taraIndex === 5 || taraIndex === 7 || taraIndex === 8
}

function gana(first: number, second: number): KootaScore {
  const matrix: Record<Gana, Record<Gana, number>> = {
    deva: { deva: 6, manushya: 5, rakshasa: 0 },
    manushya: { deva: 5, manushya: 6, rakshasa: 0 },
    rakshasa: { deva: 0, manushya: 0, rakshasa: 6 },
  }
  return {
    id: 'gana',
    points: matrix[ganaOf(first)][ganaOf(second)],
    max: 6,
    note: 'Deva with Rakshasa scores 0 in either order.',
  }
}

function maitri(firstSign: number, secondSign: number): KootaScore {
  const left = SIGN_LORD[firstSign]!
  const right = SIGN_LORD[secondSign]!
  return { id: 'grahaMaitri', points: relationScore(left, right), max: 5, note: 'Natural friendship of the two Moon-sign lords.' }
}

function relationScore(left: Lord, right: Lord): number {
  const forward = relation(left, right)
  const back = relation(right, left)
  if (forward === 'friend' && back === 'friend') return 5
  if (
    (forward === 'friend' && back === 'neutral') ||
    (forward === 'neutral' && back === 'friend')
  ) {
    return 4
  }
  if (forward === 'neutral' && back === 'neutral') return 3
  if ((forward === 'friend' && back === 'enemy') || (forward === 'enemy' && back === 'friend')) return 1
  if ((forward === 'neutral' && back === 'enemy') || (forward === 'enemy' && back === 'neutral')) return 0.5
  return 0
}

function relation(from: Lord, to: Lord): 'friend' | 'neutral' | 'enemy' {
  if (from === to || FRIENDS[from].includes(to)) return 'friend'
  if (ENEMIES[from].includes(to)) return 'enemy'
  return 'neutral'
}

function bhakoot(first: number, second: number): KootaScore {
  const distance = ((second - first + 12) % 12) + 1
  const dosha = distance === 2 || distance === 5 || distance === 6 || distance === 8 || distance === 9 || distance === 12
  return { id: 'bhakoot', points: dosha ? 0 : 7, max: 7, note: 'Sign distances 2/12, 5/9, and 6/8 score 0. No exception table is applied.' }
}

function nadi(first: number, second: number): KootaScore {
  const same = nadiOf(first) === nadiOf(second)
  return { id: 'nadi', points: same ? 0 : 8, max: 8, note: same ? 'Same nadi.' : 'Different nadi.' }
}

export type { Nadi }
