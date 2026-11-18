import { PrimaryLink, SecondaryLink } from '../components/Button.tsx'
import { Mark } from '../components/Mark.tsx'
import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'

const stars = [
  'left-[8%] top-[18%]',
  'left-[22%] top-[42%]',
  'left-[70%] top-[16%]',
  'left-[84%] top-[38%]',
  'left-[48%] top-[12%]',
  'left-[90%] top-[70%]',
]

export function LandingPage() {
  const { t } = useI18n()
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(110,90,138,0.28),transparent_42%)]" />
        {stars.map((star) => (
          <span key={star} className={`twinkle pointer-events-none absolute h-1 w-1 rounded-full bg-gold/80 ${star}`} />
        ))}
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-20 md:py-28">
          <Mark className="h-16 w-16 text-gold" />
          <p className="font-deva text-xl text-gold">{t('sanskrit')}</p>
          <h1 className="max-w-3xl font-serif text-5xl leading-none text-ivory md:text-7xl">{t('heroTitle')}</h1>
          <p className="max-w-2xl text-lg leading-8 text-mist">{t('heroBody')}</p>
          <p className="text-sm tracking-[0.18em] text-gold uppercase">{t('tagline')}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryLink to="/login">{t('getStarted')}</PrimaryLink>
            <SecondaryLink to="/kundli">{t('explore')}</SecondaryLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-4xl">{t('featuresTitle')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Feature title={t('featureKundliTitle')} body={t('featureKundliBody')} />
          <Feature title={t('featureAskTitle')} body={t('featureAskBody')} />
          <Feature title={t('featureDayTitle')} body={t('featureDayBody')} />
          <Feature title={t('featureMatchTitle')} body={t('featureMatchBody')} />
        </div>
      </section>

      <section className="border-y border-line/20 bg-raised">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          <h2 className="font-serif text-4xl md:col-span-3">{t('howTitle')}</h2>
          <Step n="01" text={t('howOne')} />
          <Step n="02" text={t('howTwo')} />
          <Step n="03" text={t('howThree')} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-4xl">{t('whyTitle')}</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-mist">{t('whyBody')}</p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="font-serif text-4xl">{t('plansTitle')}</h2>
        <p className="mt-3 max-w-2xl text-mist">{t('plansBody')}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Plan name={t('planFree')} body={t('planFreeBody')} status={t('planStatus')} />
          <Plan name={t('planMonth')} body={t('planMonthBody')} status={t('planStatus')} />
          <Plan name={t('planYear')} body={t('planYearBody')} status={t('planStatus')} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="font-serif text-4xl">{t('faqTitle')}</h2>
        <div className="mt-6 divide-y divide-line/20 border-y border-line/20">
          <Faq q={t('faq1q')} a={t('faq1a')} />
          <Faq q={t('faq2q')} a={t('faq2a')} />
          <Faq q={t('faq3q')} a={t('faq3a')} />
          <Faq q={t('faq4q')} a={t('faq4a')} />
        </div>
      </section>
    </PageShell>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-line/25 bg-card p-6">
      <h3 className="font-serif text-3xl">{title}</h3>
      <p className="mt-3 leading-7 text-mist">{body}</p>
    </article>
  )
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <article>
      <p className="font-serif text-3xl text-gold">{n}</p>
      <p className="mt-3 leading-7">{text}</p>
    </article>
  )
}

function Plan({ name, body, status }: { name: string; body: string; status: string }) {
  return (
    <article className="rounded-2xl border border-line/25 bg-card p-6">
      <p className="text-xs tracking-[0.16em] text-gold uppercase">{status}</p>
      <h3 className="mt-3 font-serif text-4xl">{name}</h3>
      <p className="mt-3 leading-7 text-mist">{body}</p>
    </article>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group py-4">
      <summary className="cursor-pointer list-none font-medium">{q}</summary>
      <p className="mt-2 leading-7 text-mist">{a}</p>
    </details>
  )
}
