import { Link, useParams } from 'react-router-dom'
import { BirthForm } from '../components/BirthForm.tsx'
import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'
import { useProfiles } from '../state/Profiles.tsx'

export function BirthPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { profiles } = useProfiles()
  const existing = profiles.find((profile) => profile.id === id)

  return (
    <PageShell>
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('birthTitle')}</h1>
        <p className="leading-8 text-mist">{t('birthIntro')}</p>
        <p className="text-sm text-gold">{t('notAccount')}</p>
        {id && !existing ? <p>{t('noProfiles')}</p> : <BirthForm initial={existing} id={existing?.id} />}
        <Link to="/charts" className="text-sm text-mist">
          {t('navCharts')}
        </Link>
      </section>
    </PageShell>
  )
}
