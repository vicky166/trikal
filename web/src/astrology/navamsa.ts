import { normalizeDegrees } from './ayanamsa.ts'

/** Parashara navamsa: movable signs start at themselves, fixed at the 9th, dual at the 5th. */
export function navamsaSign(siderealLongitude: number): number {
  const longitude = normalizeDegrees(siderealLongitude)
  const sign = Math.floor(longitude / 30)
  const part = Math.min(8, Math.floor((longitude % 30) / (10 / 3)))
  const modality = sign % 3
  const start = modality === 0 ? sign : modality === 1 ? (sign + 8) % 12 : (sign + 4) % 12
  return (start + part) % 12
}
