import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/I18n.tsx'
import type { CopyKey } from '../i18n/copy.ts'
import { Mark } from './Mark.tsx'

const links: { to: string; key: CopyKey }[] = [
  { to: '/charts', key: 'navCharts' },
  { to: '/kundli', key: 'navKundli' },
  { to: '/ask', key: 'navAsk' },
  { to: '/horoscope', key: 'navHoroscope' },
  { to: '/compatibility', key: 'navMatch' },
  { to: '/pricing', key: 'navPricing' },
]

export function SiteHeader() {
  const { t, language, setLanguage } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-line/20 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-3 text-gold" onClick={() => setOpen(false)}>
          <Mark className="h-9 w-9" />
          <span className="font-serif text-xl tracking-[0.22em] text-ivory">{t('brand')}</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `text-sm ${isActive ? 'text-gold' : 'text-mist hover:text-ivory'}`}
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            className="text-sm text-mist"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            {language === 'en' ? t('langHi') : t('langEn')}
          </button>
          <Link to="/login" className="text-sm text-ivory">
            {t('login')}
          </Link>
          <Link to="/login" className="rounded-xl bg-ivory px-4 py-2 text-sm text-ink">
            {t('getStarted')}
          </Link>
        </div>
        <button type="button" className="text-sm text-ivory lg:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? t('close') : t('menu')}
        </button>
      </div>
      {open ? (
        <nav className="flex flex-col gap-4 border-t border-line/20 px-5 py-4 lg:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-base text-ivory">
              {t(link.key)}
            </NavLink>
          ))}
          <button type="button" className="text-left text-mist" onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
            {language === 'en' ? t('langHi') : t('langEn')}
          </button>
          <Link to="/login" onClick={() => setOpen(false)}>
            {t('getStarted')}
          </Link>
        </nav>
      ) : null}
    </header>
  )
}
