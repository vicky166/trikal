import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { copy, type CopyKey, type Language } from './copy.ts'

const LANGUAGE_KEY = 'trikal.language'

type I18nValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: CopyKey) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY)
    return stored === 'hi' ? 'hi' : 'en'
  })
  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language)
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en'
  }, [language])
  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => copy[language][key],
    }),
    [language],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return value
}
