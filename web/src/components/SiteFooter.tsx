import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18n.tsx'
import { Mark } from './Mark.tsx'

export function SiteFooter() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-line/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3 text-gold">
          <Mark className="h-8 w-8" />
          <div>
            <p className="font-serif text-2xl tracking-[0.18em] text-ivory">{t('brand')}</p>
            <p className="font-deva text-gold">{t('sanskrit')}</p>
          </div>
        </div>
        <div className="flex gap-5 text-sm text-mist">
          <Link to="/account">{t('accountTitle')}</Link>
          <Link to="/privacy">{t('privacyTitle')}</Link>
          <Link to="/terms">{t('termsTitle')}</Link>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-8 text-sm leading-6 text-mist">{t('footerNote')}</p>
    </footer>
  )
}
