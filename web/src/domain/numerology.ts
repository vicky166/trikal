const CHALDEAN: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
}

export type NumberPlanet = 'sun' | 'moon' | 'jupiter' | 'rahu' | 'mercury' | 'venus' | 'ketu' | 'saturn' | 'mars'

export const planetOfNumber: Record<number, NumberPlanet> = {
  1: 'sun',
  2: 'moon',
  3: 'jupiter',
  4: 'rahu',
  5: 'mercury',
  6: 'venus',
  7: 'ketu',
  8: 'saturn',
  9: 'mars',
}

export function digitalRoot(value: number): number {
  if (!Number.isInteger(value) || value < 1) return 0
  let current = value
  while (current > 9) {
    current = String(current).split('').reduce((sum, digit) => sum + Number(digit), 0)
  }
  return current
}

export function moolankFromDate(isoDate: string): { day: number; number: number } | null {
  const day = Number(isoDate.slice(8, 10))
  if (!Number.isInteger(day) || day < 1 || day > 31) return null
  return { day, number: digitalRoot(day) }
}

export function bhagyankFromDate(isoDate: string): number | null {
  const digits = isoDate.replaceAll('-', '')
  if (!/^\d{8}$/.test(digits)) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  const total = digits.split('').reduce((sum, digit) => sum + Number(digit), 0)
  return digitalRoot(total)
}

export function namankFromName(name: string): { total: number; number: number } | null {
  const letters = name.toLowerCase().replaceAll(/[^a-z]/g, '')
  if (letters.length < 2) return null
  const total = letters.split('').reduce((sum, letter) => sum + (CHALDEAN[letter] ?? 0), 0)
  if (total < 1) return null
  return { total, number: digitalRoot(total) }
}
