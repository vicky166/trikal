export const languages = ['en', 'hi', 'hinglish'] as const;

export type Language = (typeof languages)[number];

export function isLanguage(value: string): value is Language {
  return languages.includes(value as Language);
}

export function localeFor(language: Language): string {
  if (language === 'hi') {
    return 'hi-IN';
  }
  return 'en-IN';
}
