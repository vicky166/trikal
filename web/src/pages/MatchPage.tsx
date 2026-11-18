import { useState } from 'react'
import { Link } from 'react-router-dom'
import { chartFromProfile } from '../astrology/fromProfile.ts'
import { gunaMilan } from '../astrology/guna.ts'
import { chartReady } from '../domain/birth.ts'
import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'
import type { CopyKey } from '../i18n/copy.ts'
import { useProfiles } from '../state/Profiles.tsx'

const labels: Record<string, CopyKey> = {
  varna: 'kootaVarna',
  tara: 'kootaTara',
  gana: 'kootaGana',
  grahaMaitri: 'kootaMaitri',
  bhakoot: 'kootaBhakoot',
  nadi: 'kootaNadi',
}

const notes: Record<string, CopyKey> = {
  varna: 'noteVarna',
  tara: 'noteTara',
  gana: 'noteGana',
  grahaMaitri: 'noteMaitri',
  bhakoot: 'noteBhakoot',
  nadi: 'noteNadi',
}

export function MatchPage() {
  const { t } = useI18n()
  const { profiles } = useProfiles()
  const ready = profiles.filter((profile) => chartReady(profile) === 'ready')
  const [firstId, setFirstId] = useState(ready[0]?.id ?? '')
  const [secondId, setSecondId] = useState(ready[1]?.id ?? '')
  const first = ready.find((profile) => profile.id === firstId)
  const second = ready.find((profile) => profile.id === secondId)
  const firstChart = first ? chartFromProfile(first) : null
  const secondChart = second ? chartFromProfile(second) : null
  const result =
    firstChart && secondChart
      ? gunaMilan(
          { moonSign: firstChart.planets.find((planet) => planet.name === 'moon')!.sign, nakshatra: firstChart.moonNakshatra.index },
          { moonSign: secondChart.planets.find((planet) => planet.name === 'moon')!.sign, nakshatra: secondChart.moonNakshatra.index },
        )
      : null

  return (
    <PageShell>
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('matchTitle')}</h1>
        <p className="leading-8 text-mist">{t('matchIntro')}</p>
        {ready.length < 2 ? (
          <div className="rounded-2xl border border-line/25 bg-card p-5">
            <p>{t('needTwo')}</p>
            <Link to="/birth" className="mt-3 inline-block text-gold">{t('addBirth')}</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Chooser label={t('firstChart')} value={firstId} onChange={setFirstId} options={ready.map((profile) => ({ id: profile.id, name: profile.fullName }))} />
            <Chooser label={t('secondChart')} value={secondId} onChange={setSecondId} options={ready.map((profile) => ({ id: profile.id, name: profile.fullName }))} />
          </div>
        )}
        {result ? (
          <div className="flex flex-col gap-3">
            {result.scored.map((item) => (
              <article key={item.id} className="rounded-2xl border border-line/25 bg-card p-4">
                <p className="text-gold">{t(labels[item.id] ?? 'matchTitle')}</p>
                <p className="mt-1 font-serif text-3xl">{item.points} / {item.max}</p>
                <p className="mt-2 text-sm leading-6 text-mist">{t(notes[item.id] ?? 'matchIntro')}</p>
              </article>
            ))}
            <article className="rounded-2xl border border-gold/40 p-4">
              <p className="font-serif text-3xl">{t('withheldTotal')}</p>
              <p className="mt-2 text-mist">{t('yoniHeld')}</p>
              <p className="mt-2 text-mist">{t('vashyaHeld')}</p>
            </article>
          </div>
        ) : null}
      </section>
    </PageShell>
  )
}

function Chooser({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { id: string; name: string }[] }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-mist">
      {label}
      <select className="min-h-12 rounded-xl border border-line/30 bg-card px-3 text-base text-ivory" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.name}</option>
        ))}
      </select>
    </label>
  )
}
