import { Link, useParams } from 'react-router-dom'
import { chartFromProfile } from '../astrology/fromProfile.ts'
import { chartReady } from '../domain/birth.ts'
import { ChartView } from '../components/ChartView.tsx'
import { PageShell } from '../components/PageShell.tsx'
import { PrimaryLink } from '../components/Button.tsx'
import { useI18n } from '../i18n/I18n.tsx'
import { useProfiles } from '../state/Profiles.tsx'

export function KundliPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { profiles } = useProfiles()
  const selected = profiles.find((profile) => profile.id === id) ?? profiles.find((profile) => chartReady(profile) === 'ready') ?? profiles[0]
  const ready = selected ? chartReady(selected) : null
  const chart = selected && ready === 'ready' ? chartFromProfile(selected) : null

  return (
    <PageShell>
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('navKundli')}</h1>
        <p className="max-w-3xl leading-8 text-mist">{t('kundliIntro')}</p>
        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-line/25 bg-card p-6">
            <p>{t('noProfiles')}</p>
            <div className="mt-4">
              <PrimaryLink to="/birth">{t('addBirth')}</PrimaryLink>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {profiles.map((profile) => (
              <Link key={profile.id} to={`/kundli/${profile.id}`} className={`rounded-full border px-4 py-2 text-sm ${profile.id === selected?.id ? 'border-gold text-gold' : 'border-line/30 text-mist'}`}>
                {profile.fullName}
              </Link>
            ))}
          </div>
        )}
        {selected && ready === 'time' ? <p className="rounded-2xl border border-line/25 bg-card p-5">{t('unknownBlocks')}</p> : null}
        {selected && ready === 'place' ? <p className="rounded-2xl border border-line/25 bg-card p-5">{t('placeBlocks')}</p> : null}
        {chart && selected ? (
          <>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link to={`/report/${selected.id}`}>{t('print')}</Link>
              <Link to={`/birth/${selected.id}`}>{t('editProfile')}</Link>
            </div>
            <ChartView chart={chart} />
          </>
        ) : null}
      </section>
    </PageShell>
  )
}
