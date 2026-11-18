import { useState } from 'react'
import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'
import { getSupabase } from '../services/supabase.ts'
import { useSession } from '../services/useSession.ts'
import { useProfiles } from '../state/Profiles.tsx'

export function AccountPage() {
  const { t, language, setLanguage } = useI18n()
  const { configured, session } = useSession()
  const { clear, syncStatus, syncDetail, retrySync } = useProfiles()
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  return (
    <PageShell>
      <section className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('accountTitle')}</h1>
        <p className="leading-8 text-mist">{configured ? t('authReady') : t('accountIntro')}</p>
        {session?.user.email ? <p>{t('signedIn')}: {session.user.email}</p> : <p className="text-sm text-gold">{t('notAccount')}</p>}
        {syncStatus === 'syncing' ? <p className="text-mist">{t('syncing')}</p> : null}
        {syncStatus === 'synced' ? <p className="text-mist">{t('syncSaved')}</p> : null}
        {syncStatus === 'offline' ? <p className="text-mist">{t('syncOffline')}</p> : null}
        {syncStatus === 'error' ? <p className="text-mist">{t('syncError')} {syncDetail} <button type="button" className="text-gold" onClick={retrySync}>{t('syncRetry')}</button></p> : null}
        {syncStatus === 'schema' ? <p className="text-mist">{t('syncSchema')} <button type="button" className="text-gold" onClick={retrySync}>{t('syncRetry')}</button></p> : null}
        <label className="flex flex-col gap-2 text-sm text-mist">
          {t('language')}
          <select className="min-h-12 rounded-xl border border-line/30 bg-card px-3 text-ivory" value={language} onChange={(event) => setLanguage(event.target.value === 'hi' ? 'hi' : 'en')}>
            <option value="en">{t('langEn')}</option>
            <option value="hi">{t('langHi')}</option>
          </select>
        </label>
        <button
          type="button"
          className="min-h-12 rounded-xl border border-line/40 px-4 text-left"
          onClick={() => {
            clear()
            setNotice(t('deletedLocal'))
          }}
        >
          {t('deleteLocal')}
        </button>
        {configured && session ? (
          <>
            <button
              type="button"
              className="min-h-12 rounded-xl border border-line/40 px-4 text-left"
              onClick={() => {
                const supabase = getSupabase()
                if (!supabase) return
                void supabase.rpc('delete_own_account').then(({ error: rpcError }) => {
                  if (rpcError) setError(t('cloudDeleteFailed'))
                  else setNotice(t('cloudDeleteDone'))
                })
              }}
            >
              {t('cloudDelete')}
            </button>
            <button type="button" className="min-h-12 rounded-xl bg-ivory px-4 text-ink" onClick={() => void getSupabase()?.auth.signOut()}>
              {t('signOut')}
            </button>
          </>
        ) : null}
        {notice ? <p className="rounded-2xl border border-line/25 bg-card p-4">{notice}</p> : null}
        {error ? <p className="text-red-200">{error}</p> : null}
      </section>
    </PageShell>
  )
}
