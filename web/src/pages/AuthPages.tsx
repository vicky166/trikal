import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginSchema, type BirthInput } from '../domain/birth.ts'
import { findCity, cities } from '../domain/places.ts'
import { upsertProfile } from '../domain/profiles.ts'
import { saveSignupDraft } from '../domain/signupDraft.ts'
import { PrimaryButton } from '../components/Button.tsx'
import { PageShell } from '../components/PageShell.tsx'
import { useI18n } from '../i18n/I18n.tsx'
import { authIssue } from '../services/authConfig.ts'
import { classifyAuthError, signupOutcome } from '../services/authMessages.ts'
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
  const { configured, ready, session } = useSession()
  const issue = authIssue()
  const navigate = useNavigate()
  useEffect(() => {
    if ((mode === 'login' || mode === 'signup') && session) navigate('/dashboard')
  }, [mode, navigate, session])
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [cityId, setCityId] = useState('delhi')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const title = mode === 'signup' ? t('signupTitle') : mode === 'forgot' ? t('forgotTitle') : mode === 'reset' ? t('resetTitle') : t('login')
  const body = mode === 'signup' ? t('signupBody') : mode === 'forgot' ? t('forgotBody') : mode === 'reset' ? t('resetBody') : t('loginBody')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (issue === 'missing') {
      setError(t('loginStopped'))
      return
    }
    if (issue) {
      setError(t('authInvalid'))
      return
    }
    const supabase = getSupabase()
    if (!supabase) {
      setError(t('authInvalid'))
      return
    }
    setBusy(true)
    try {
      if (mode === 'forgot') {
        const parsed = loginSchema.shape.email.safeParse(email)
        if (!parsed.success) {
          setError(t('authFormError'))
          return
        }
        const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` })
        if (result.error) setError(messageFor(result.error, t))
        else setMessage(t('passwordResetSent'))
        return
      }
      if (mode === 'reset') {
        const parsed = loginSchema.shape.password.safeParse(password)
        if (!parsed.success) {
          setError(t('authFormError'))
          return
        }
        if (!session) {
          setError(t('resetNeedsLink'))
          return
        }
        const result = await supabase.auth.updateUser({ password })
        if (result.error) setError(messageFor(result.error, t))
        else setMessage(t('passwordUpdated'))
        return
      }
      const parsed = loginSchema.safeParse({ email, password })
      const trimmedName = name.trim()
      const city = findCity(cityId)
      const birth = mode === 'signup' ? signupBirth(trimmedName, birthDate, birthTime, city) : null
      if (mode === 'signup' && (!birth || trimmedName.length < 2)) {
        setError(t('signupFormError'))
        return
      }
      if (!parsed.success) {
        setError(mode === 'signup' ? t('signupFormError') : t('authFormError'))
        return
      }
      if (birth) {
        saveSignupDraft({ name: trimmedName, birthDate, birthTime, cityId })
        upsertProfile(localStorage, birth)
      }
      const result =
        mode === 'signup'
          ? await supabase.auth.signUp({
              email: parsed.data.email,
              password: parsed.data.password,
              options: {
                data: { name: trimmedName, birthDate, birthTime, cityId },
                emailRedirectTo: `${window.location.origin}/dashboard`,
              },
            })
          : await supabase.auth.signInWithPassword(parsed.data)
      if (result.error) {
        setError(messageFor(result.error, t))
        return
      }
      if (mode === 'signup') {
        const outcome = signupOutcome(result.data.user, Boolean(result.data.session))
        if (outcome === 'duplicate') setError(t('duplicateAccount'))
        else if (outcome === 'confirm') setMessage(t('checkEmail'))
        else navigate('/dashboard', { state: { name: trimmedName, birthDate, birthTime, cityId } })
        return
      }
      if (!result.data.session) setMessage(t('checkEmail'))
      else navigate('/dashboard')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-xl flex-col gap-4 px-5 py-16">
        <p className="font-deva text-lg text-gold">{t('sanskrit')}</p>
        <h1 className="font-serif text-5xl">{title}</h1>
        <p className="leading-8 text-mist">{configured ? t('authReady') : body}</p>
        {issue === 'missing' ? <p className="leading-7 text-red-200">{t('loginStopped')}</p> : null}
        {issue === 'invalid' ? <p className="leading-7 text-red-200">{t('authInvalid')}</p> : null}
        {session?.user.email ? (
          <p className="text-gold">
            {t('signedIn')}: {session.user.email}
          </p>
        ) : null}
        {mode === 'reset' && configured && ready && !session ? <p className="leading-7 text-red-200">{t('resetNeedsLink')}</p> : null}
        <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)} noValidate>
          {mode === 'signup' ? (
            <>
              <label className="flex flex-col gap-2 text-sm text-mist">
                {t('fullName')}
                <input className={field} type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} disabled={busy} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-mist">
                {t('birthDate')}
                <input className={field} type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} disabled={busy} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-mist">
                {t('birthTime')}
                <input className={field} type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} disabled={busy} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-mist">
                {t('city')}
                <select className={field} value={cityId} onChange={(event) => setCityId(event.target.value)} disabled={busy}>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.label}</option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
          {mode !== 'reset' ? (
            <label className="flex flex-col gap-2 text-sm text-mist">
              {t('email')}
              <input className={field} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} />
            </label>
          ) : null}
          {mode !== 'forgot' ? (
            <label className="flex flex-col gap-2 text-sm text-mist">
              {mode === 'reset' ? t('newPassword') : t('password')}
              <input
                className={field}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
              />
            </label>
          ) : null}
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? t('authWorking') : mode === 'reset' ? t('updatePassword') : mode === 'forgot' ? t('forgotLink') : t('submitLogin')}
          </PrimaryButton>
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

function signupBirth(name: string, birthDate: string, birthTime: string, city: ReturnType<typeof findCity>): BirthInput | null {
  if (!city || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) return null
  return {
    fullName: name,
    birthDate,
    timePrecision: 'exact',
    birthTime,
    timeZone: city.timeZone,
    cityId: city.id,
    cityLabel: city.label,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
    gender: 'unspecified',
  }
}

function messageFor(error: { message: string; code?: string | null }, t: (key: 'invalidCredentials' | 'duplicateAccount' | 'emailNotConfirmed' | 'resetNeedsLink') => string): string {
  const failure = classifyAuthError(error)
  if (failure === 'invalid') return t('invalidCredentials')
  if (failure === 'duplicate') return t('duplicateAccount')
  if (failure === 'unconfirmed') return t('emailNotConfirmed')
  if (failure === 'session') return t('resetNeedsLink')
  return error.message
}
