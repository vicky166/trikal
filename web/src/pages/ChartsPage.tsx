import { Link } from 'react-router-dom'
import { chartReady } from '../domain/birth.ts'
import { PageShell } from '../components/PageShell.tsx'
import { PrimaryLink } from '../components/Button.tsx'
import { useI18n } from '../i18n/I18n.tsx'
import { useProfiles } from '../state/Profiles.tsx'

export function ChartsPage() {
  const { t } = useI18n()
  const { profiles, remove, syncStatus, syncDetail, retrySync } = useProfiles()

  return (
    <PageShell>
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('chartsTitle')}</h1>
        <p className="max-w-2xl leading-8 text-mist">{syncStatus === 'local' ? t('chartsIntro') : t('chartsAccount')}</p>
        {syncStatus === 'syncing' ? <p className="text-mist">{t('syncing')}</p> : null}
        {syncStatus === 'synced' ? <p className="text-mist">{t('syncSaved')}</p> : null}
        {syncStatus === 'offline' ? <p className="text-mist">{t('syncOffline')}</p> : null}
        {syncStatus === 'error' ? (
          <p className="text-mist">
            {t('syncError')} {syncDetail}{' '}
            <button type="button" className="text-gold" onClick={retrySync}>
              {t('syncRetry')}
            </button>
          </p>
        ) : null}
        {syncStatus === 'schema' ? (
          <p className="text-mist">
            {t('syncSchema')}{' '}
            <button type="button" className="text-gold" onClick={retrySync}>
              {t('syncRetry')}
            </button>
          </p>
        ) : null}
        <PrimaryLink to="/birth">{t('addBirth')}</PrimaryLink>
        {profiles.length === 0 ? <p className="rounded-2xl border border-line/25 bg-card p-6">{t('noProfiles')}</p> : null}
        <ul className="grid gap-4">
          {profiles.map((profile) => {
            const ready = chartReady(profile)
            return (
              <li key={profile.id} className="rounded-2xl border border-line/25 bg-card p-5">
                <h2 className="font-serif text-3xl">{profile.fullName}</h2>
                <p className="mt-2 text-mist">
                  {profile.birthDate}
                  {profile.birthTime ? ` · ${profile.birthTime}` : ''} · {profile.cityLabel}, {profile.country}
                </p>
                <p className="mt-2 text-sm text-gold">
                  {ready === 'ready' ? t('openKundli') : ready === 'time' ? t('unknownBlocks') : t('placeBlocks')}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <Link to={`/kundli/${profile.id}`}>{t('openKundli')}</Link>
                  <Link to={`/birth/${profile.id}`}>{t('editProfile')}</Link>
                  <button type="button" className="text-mist" onClick={() => remove(profile.id)}>
                    {t('deleteProfile')}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </PageShell>
  )
}
