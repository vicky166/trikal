import type { ReactNode } from 'react'
import { PageShell } from '../components/PageShell.tsx'

export function StatusPage({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children?: ReactNode }) {
  return (
    <PageShell>
      <section className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-20">
        <p className="font-deva text-lg text-gold">{eyebrow}</p>
        <h1 className="font-serif text-5xl leading-none">{title}</h1>
        <p className="text-lg leading-8 text-mist">{body}</p>
        {children}
      </section>
    </PageShell>
  )
}
