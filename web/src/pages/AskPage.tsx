import { useState } from 'react'
import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'

const prompts = ['suggestionCareer', 'suggestionDasha', 'suggestionNakshatra'] as const

export function AskPage() {
  const { t } = useI18n()
  const [question, setQuestion] = useState('')
  const [stopped, setStopped] = useState(false)

  return (
    <PageShell>
      <section className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{t('askTitle')}</h1>
        <p className="leading-8 text-mist">{t('askIntro')}</p>
        <div className="flex flex-col gap-2">
          {prompts.map((key) => (
            <button key={key} type="button" className="rounded-xl border border-line/25 px-4 py-3 text-left" onClick={() => setQuestion(t(key))}>
              {t(key)}
            </button>
          ))}
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            setStopped(true)
          }}
        >
          <label className="flex flex-col gap-2 text-sm text-mist">
            {t('askTitle')}
            <textarea className="min-h-32 rounded-xl border border-line/30 bg-card px-3 py-3 text-base text-ivory" value={question} onChange={(event) => setQuestion(event.target.value)} />
          </label>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ivory px-5 text-sm font-medium text-ink">
            {t('submitLogin')}
          </button>
        </form>
        {stopped ? <p className="rounded-2xl border border-line/25 bg-card p-4">{t('askSubmit')}</p> : null}
      </section>
    </PageShell>
  )
}
