import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

const base =
  'inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-medium tracking-wide transition-opacity hover:opacity-85'

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={`${base} bg-ivory text-ink`}>
      {children}
    </Link>
  )
}

export function SecondaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={`${base} border border-line/30 text-ivory`}>
      {children}
    </Link>
  )
}

export function PrimaryButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`${base} bg-ivory text-ink disabled:opacity-40`}>
      {children}
    </button>
  )
}
