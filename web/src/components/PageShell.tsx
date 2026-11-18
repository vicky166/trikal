import { useEffect, useState, type ReactNode } from 'react'
import { SiteFooter } from './SiteFooter.tsx'
import { SiteHeader } from './SiteHeader.tsx'
import { useI18n } from '../i18n/I18n.tsx'

type InstallEvent = Event & { prompt: () => Promise<void> }

export function PageShell({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [install, setInstall] = useState<InstallEvent | null>(null)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstall(event as InstallEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {install ? (
        <div className="fixed right-4 bottom-4">
          <button
            type="button"
            className="rounded-xl border border-line/40 bg-raised px-4 py-3 text-sm text-ivory"
            onClick={() => {
              void install.prompt()
              setInstall(null)
            }}
          >
            {t('install')}
          </button>
        </div>
      ) : null}
      <SiteFooter />
    </div>
  )
}
