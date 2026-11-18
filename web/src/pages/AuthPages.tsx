import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { loginSchema } from '../domain/birth.ts'
import { PrimaryButton } from '../components/Button.tsx'
import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'
import { getSupabase } from '../services/supabase.ts'
import { useSession } from '../services/useSession.ts'

const field = 'min-h-12 rounded-xl border border-line/30 bg-card px-3 text-base text-ivory'

export function LoginPage() {
  return <AuthForm mode="login" />
}

export function SignupPage() {
  return <AuthForm mode="signup" />
}

export function ForgotPage() {
  return <AuthForm mode="forgot" />
}

export function ResetPage() {
  return <AuthForm mode="reset" />
}

function AuthForm({ mode }: { mode: 'login' | 'signup' | 'forgot' | 'reset' }) {
  const { t } = useI18n()
  const { configured, session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const title = mode === 'signup' ? t('signupTitle') : mode === 'forgot' ? t('forgotTitle') : mode === 'reset' ? t('resetTitle') : t('login')
  const body = mode === 'signup' ? t('signupBody') : mode === 'forgot' ? t('forgotBody') : mode === 'reset' ? t('resetBody') : t('loginBody')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!configured) {
      setMessage(mode === 'login' ? t('loginStopped') : body)
      return
    }
    const supabase = getSupabase()
    if (!supabase) return
    if (mode === 'forgot') {
      const parsed = loginSchema.shape.email.safeParse(email)
      if (!parsed.success) {
        setError(t('formError'))
        return
      }
      const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` })
      if (result.error) setError(result.error.message)
      else setMessage(t('passwordResetSent'))
      return
    }
    if (mode === 'reset') {
      const parsed = loginSchema.shape.password.safeParse(password)
      if (!parsed.success) {
        setError(t('formError'))
        return
      }
      const result = await supabase.auth.updateUser({ password })
      if (result.error) setError(result.error.message)
      else setMessage(t('passwordUpdated'))
      return
    }
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(t('formError'))
      return
    }
    const result =
      mode === 'signup'
        ? await supabase.auth.signUp(parsed.data)
        : await supabase.auth.signInWithPassword(parsed.data)
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (!result.data.session) setMessage(t('checkEmail'))
    else setMessage(t('signedIn'))
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-xl flex-col gap-4 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{title}</h1>
        <p className="leading-8 text-mist">{configured ? t('authReady') : body}</p>
        {session?.user.email ? <p className="text-gold">{t('signedIn')}: {session.user.email}</p> : null}
        <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)} noValidate>
          {mode !== 'reset' ? (
            <label className="flex flex-col gap-2 text-sm text-mist">
              {t('email')}
              <input className={field} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
          ) : null}
          {mode !== 'forgot' ? (
            <label className="flex flex-col gap-2 text-sm text-mist">
              {mode === 'reset' ? t('newPassword') : t('password')}
              <input className={field} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
          ) : null}
          <PrimaryButton type="submit">{mode === 'reset' ? t('updatePassword') : mode === 'forgot' ? t('forgotLink') : t('submitLogin')}</PrimaryButton>
        </form>
        {message ? <p className="rounded-2xl border border-line/25 bg-card p-4 leading-7">{message}</p> : null}
        {error ? <p className="leading-7 text-red-200">{error}</p> : null}
        <div className="flex flex-col gap-2 text-sm text-mist">
          {mode !== 'login' ? <Link to="/login">{t('haveAccount')}</Link> : <Link to="/signup">{t('needAccount')}</Link>}
          {mode !== 'forgot' ? <Link to="/forgot">{t('forgotLink')}</Link> : null}
        </div>
      </section>
    </PageShell>
  )
}
