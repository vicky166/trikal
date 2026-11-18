export const NAKSHATRA_COUNT = 27
export const NAKSHATRA_SPAN = 360 / NAKSHATRA_COUNT
export const PADA_SPAN = NAKSHATRA_SPAN / 4

export const nakshatraNames = {
  en: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati',
  ],
  hi: [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा',
    'मघा', 'पूर्व फाल्गुनी', 'उत्तर फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
    'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्व भाद्रपद',
    'उत्तर भाद्रपद', 'रेवती',
  ],
} as const

export function nakshatraOf(siderealLongitude: number): { index: number; pada: number; degree: number } {
  const longitude = ((siderealLongitude % 360) + 360) % 360
  const index = Math.min(NAKSHATRA_COUNT - 1, Math.floor(longitude / NAKSHATRA_SPAN))
  const into = longitude - index * NAKSHATRA_SPAN
  const pada = Math.min(4, Math.floor(into / PADA_SPAN) + 1)
  return { index, pada, degree: into }
}

const ADI = [0, 5, 6, 11, 12, 17, 18, 23, 24]
const MADHYA = [1, 4, 7, 10, 13, 16, 19, 22, 25]
const ANTYA = [2, 3, 8, 9, 14, 15, 20, 21, 26]

export type Nadi = 'adi' | 'madhya' | 'antya'

export function nadiOf(index: number): Nadi {
  if (ADI.includes(index)) return 'adi'
  if (MADHYA.includes(index)) return 'madhya'
  if (ANTYA.includes(index)) return 'antya'
  throw new Error('Nakshatra is outside 0–26.')
}

const DEVA = [0, 4, 6, 7, 12, 14, 16, 21, 26]
const MANUSHYA = [1, 3, 5, 10, 11, 19, 20, 24, 25]
const RAKSHASA = [2, 8, 9, 13, 15, 17, 18, 22, 23]

export type Gana = 'deva' | 'manushya' | 'rakshasa'

export function ganaOf(index: number): Gana {
  if (DEVA.includes(index)) return 'deva'
  if (MANUSHYA.includes(index)) return 'manushya'
  if (RAKSHASA.includes(index)) return 'rakshasa'
  throw new Error('Nakshatra is outside 0–26.')
}
