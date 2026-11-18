export type RashiId =
  | 'mesha'
  | 'vrishabha'
  | 'mithuna'
  | 'karka'
  | 'simha'
  | 'kanya'
  | 'tula'
  | 'vrishchika'
  | 'dhanu'
  | 'makara'
  | 'kumbha'
  | 'meena';

export type Rashi = {
  id: RashiId;
  sa: string;
  en: string;
  hi: string;
};

export const rashis: Rashi[] = [
  { id: 'mesha', sa: 'मेष', en: 'Aries', hi: 'मेष' },
  { id: 'vrishabha', sa: 'वृषभ', en: 'Taurus', hi: 'वृषभ' },
  { id: 'mithuna', sa: 'मिथुन', en: 'Gemini', hi: 'मिथुन' },
  { id: 'karka', sa: 'कर्क', en: 'Cancer', hi: 'कर्क' },
  { id: 'simha', sa: 'सिंह', en: 'Leo', hi: 'सिंह' },
  { id: 'kanya', sa: 'कन्या', en: 'Virgo', hi: 'कन्या' },
  { id: 'tula', sa: 'तुला', en: 'Libra', hi: 'तुला' },
  { id: 'vrishchika', sa: 'वृश्चिक', en: 'Scorpio', hi: 'वृश्चिक' },
  { id: 'dhanu', sa: 'धनु', en: 'Sagittarius', hi: 'धनु' },
  { id: 'makara', sa: 'मकर', en: 'Capricorn', hi: 'मकर' },
  { id: 'kumbha', sa: 'कुम्भ', en: 'Aquarius', hi: 'कुम्भ' },
  { id: 'meena', sa: 'मीन', en: 'Pisces', hi: 'मीन' },
];

export function findRashi(id: string): Rashi | undefined {
  return rashis.find((rashi) => rashi.id === id);
}
