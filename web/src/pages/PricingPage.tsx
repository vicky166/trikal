import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'

const plans = [
  { name: 'planFree', body: 'planFreeBody' },
  { name: 'planMonth', body: 'planMonthBody' },
  { name: 'planYear', body: 'planYearBody' },
] as const

export function PricingPage() {
  const { t } = useI18n()
  return (
    <PageShell>
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('plansTitle')}</h1>
        <p className="max-w-2xl leading-8 text-mist">{t('plansBody')}</p>
        <p className="leading-7">{t('pricingWhy')}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-line/25 bg-card p-6">
              <p className="text-xs tracking-[0.16em] text-gold uppercase">{t('planStatus')}</p>
              <h2 className="mt-3 font-serif text-4xl">{t(plan.name)}</h2>
              <p className="mt-3 leading-7 text-mist">{t(plan.body)}</p>
              <button type="button" disabled className="mt-6 min-h-12 w-full rounded-xl border border-line/30 text-sm text-mist">
                {t('pricingBuy')}
              </button>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
