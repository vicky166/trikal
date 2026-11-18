import { useState } from 'react'
import { Link } from 'react-router-dom'
import { chartFromProfile } from '../astrology/fromProfile.ts'
import { signNames } from '../astrology/names.ts'
import { chartReady } from '../domain/birth.ts'
import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'
import { useProfiles } from '../state/Profiles.tsx'

const periods = ['daily', 'weekly', 'monthly'] as const

export function HoroscopePage() {
  const { t, language } = useI18n()
  const { profiles } = useProfiles()
  const [period, setPeriod] = useState<(typeof periods)[number]>('daily')
  const ready = profiles.filter((profile) => chartReady(profile) === 'ready')
  const chart = ready[0] ? chartFromProfile(ready[0]) : null
  const moon = chart?.planets.find((planet) => planet.name === 'moon')

  return (
    <PageShell>
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('horoscopeTitle')}</h1>
        <p className="max-w-3xl leading-8 text-mist">{t('horoscopeIntro')}</p>
        <div className="flex gap-2" role="tablist">
          {periods.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={period === item} className={`min-h-12 rounded-xl px-4 ${period === item ? 'bg-ivory text-ink' : 'border border-line/30 text-ivory'}`} onClick={() => setPeriod(item)}>
              {t(item)}
            </button>
          ))}
        </div>
        <p className="rounded-2xl border border-line/25 bg-card p-5">{t('notPublished')}</p>
        {moon ? (
          <p className="text-lg">
            {t('yourMoon')}: {signNames[language][moon.sign]}
            {ready[0] ? <span className="text-mist"> · {ready[0].fullName}</span> : null}
          </p>
        ) : (
          <Link to="/birth" className="text-gold">{t('addBirth')}</Link>
        )}
        <ol className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {signNames[language].map((name) => (
            <li key={name} className={`rounded-xl border px-4 py-3 ${moon && signNames[language][moon.sign] === name ? 'border-gold' : 'border-line/25'}`}>
              {name}
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  )
}
