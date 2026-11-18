import { createContext, useContext, type ReactNode } from 'react';
import { translate, type CopyKey } from './copy';
import type { Language } from './languages';

const I18nContext = createContext<Language>('en');

export function I18nProvider({ language, children }: { language: Language; children: ReactNode }) {
  return <I18nContext.Provider value={language}>{children}</I18nContext.Provider>;
}

export function useI18n(): { language: Language; t: (key: CopyKey) => string } {
  const language = useContext(I18nContext);
  return {
    language,
    t: (key) => translate(language, key),
  };
}
