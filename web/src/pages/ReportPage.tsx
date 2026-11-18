import { Link, useParams } from 'react-router-dom'
import { chartFromProfile } from '../astrology/fromProfile.ts'
import { ChartView } from '../components/ChartView.tsx'
import { PageShell } from '../components/PageShell.tsx'
import { chartReady } from '../domain/birth.ts'
import { useI18n } from '../i18n/I18n.tsx'
import { useProfiles } from '../state/Profiles.tsx'

export function ReportPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { profiles } = useProfiles()
  const profile = profiles.find((item) => item.id === id)
  const chart = profile && chartReady(profile) === 'ready' ? chartFromProfile(profile) : null

  return (
    <PageShell>
      <article className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-16">
        <p className="font-deva text-lg text-gold print:text-black">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('reportTitle')}</h1>
        {!profile ? <p>{t('noProfiles')}</p> : null}
        {profile && !chart ? <p>{chartReady(profile) === 'time' ? t('unknownBlocks') : t('placeBlocks')}</p> : null}
        {profile && chart ? (
          <>
            <p>
              {profile.fullName} · {profile.birthDate} {profile.birthTime} · {profile.cityLabel}, {profile.country}
            </p>
            <p className="text-sm text-mist">{profile.timeZone} · {chart.instantUtc}</p>
            <p className="text-sm text-mist">
              {chart.ephemeris.name} {chart.ephemeris.version} · {chart.ayanamsa.name} {chart.ayanamsa.degrees.toFixed(4)}° · {chart.houseSystem} · {chart.node}
            </p>
            <button type="button" className="no-print min-h-12 rounded-xl bg-ivory px-5 text-ink" onClick={() => window.print()}>
              {t('print')}
            </button>
            <ChartView chart={chart} />
            <p className="leading-7 text-mist">{t('termsBody')}</p>
          </>
        ) : (
          <Link to="/charts">{t('navCharts')}</Link>
        )}
      </article>
    </PageShell>
  )
}
