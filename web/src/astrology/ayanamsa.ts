const J2000_JD = 2451545
const LAHIRI_MEAN_AT_J2000 = 23.857056

export function julianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5
}

/** Mean Lahiri ayanamsa in degrees. Nutation, about 17 arcseconds, is not included. */
export function lahiriMeanDegrees(date: Date): number {
  const century = (julianDay(date) - J2000_JD) / 36_525
  const arcseconds = 5028.796195 * century + 1.1054348 * century * century
  return normalizeDegrees(LAHIRI_MEAN_AT_J2000 + arcseconds / 3600)
}

export function normalizeDegrees(value: number): number {
  const turns = value % 360
  return turns < 0 ? turns + 360 : turns
}

export function shortestDelta(from: number, to: number): number {
  let delta = normalizeDegrees(to) - normalizeDegrees(from)
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta
}
