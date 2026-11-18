import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { birthInputSchema, type BirthInput } from '../domain/birth.ts'
import { searchCities, type City } from '../domain/places.ts'
import { useI18n } from '../i18n/I18n.tsx'
import { useProfiles } from '../state/Profiles.tsx'
import { PrimaryButton } from './Button.tsx'

const field = 'min-h-12 rounded-xl border border-line/30 bg-card px-3 text-base text-ivory'

const empty: BirthInput = {
  fullName: '',
  birthDate: '',
  timePrecision: 'exact',
  birthTime: null,
  timeZone: null,
  cityId: null,
  cityLabel: '',
  country: '',
  latitude: null,
  longitude: null,
  gender: 'unspecified',
}

export function BirthForm({ initial, id }: { initial?: BirthInput; id?: string }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { save } = useProfiles()
  const [draft, setDraft] = useState<BirthInput>(initial ?? empty)
  const [query, setQuery] = useState(initial?.cityLabel ?? '')
  const [invalid, setInvalid] = useState(false)
  const matches = useMemo(() => searchCities(query), [query])

  function choose(city: City) {
    setQuery(city.label)
    setDraft((current) => ({
      ...current,
      cityId: city.id,
      cityLabel: city.label,
      country: city.country,
      timeZone: city.timeZone,
      latitude: city.latitude,
      longitude: city.longitude,
    }))
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        const payload: BirthInput = {
          ...draft,
          birthTime: draft.timePrecision === 'unknown' ? null : draft.birthTime || null,
          cityLabel: draft.cityId ? draft.cityLabel : query.trim() || draft.cityLabel,
        }
        const parsed = birthInputSchema.safeParse(payload)
        if (!parsed.success) {
          setInvalid(true)
          return
        }
        const saved = save(parsed.data, id)
        navigate(`/kundli/${saved.id}`)
      }}
      noValidate
    >
      <label className="flex flex-col gap-2 text-sm text-mist">
        {t('fullName')}
        <input className={field} value={draft.fullName} autoComplete="name" onChange={(event) => setDraft({ ...draft, fullName: event.target.value })} />
      </label>
      <label className="flex flex-col gap-2 text-sm text-mist">
        {t('birthDate')}
        <input className={field} type="date" value={draft.birthDate} min="1900-01-01" max={new Date().toISOString().slice(0, 10)} onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })} />
      </label>
      <label className="flex items-center gap-3 text-sm text-ivory">
        <input
          type="checkbox"
          checked={draft.timePrecision === 'unknown'}
          onChange={(event) =>
            setDraft({
              ...draft,
              timePrecision: event.target.checked ? 'unknown' : 'exact',
              birthTime: event.target.checked ? null : draft.birthTime,
            })
          }
        />
        {t('timeUnknown')}
      </label>
      {draft.timePrecision === 'exact' ? (
        <label className="flex flex-col gap-2 text-sm text-mist">
          {t('birthTime')}
          <input className={field} type="time" value={draft.birthTime ?? ''} onChange={(event) => setDraft({ ...draft, birthTime: event.target.value })} />
        </label>
      ) : null}
      <label className="flex flex-col gap-2 text-sm text-mist">
        {t('placeLabel')}
        <input
          className={field}
          value={query}
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          onChange={(event) => {
            setQuery(event.target.value)
            setDraft((current) => ({
              ...current,
              cityId: null,
              cityLabel: event.target.value,
              country: current.cityId ? '' : current.country,
              timeZone: null,
              latitude: null,
              longitude: null,
            }))
          }}
        />
        <span>{t('placeHint')}</span>
      </label>
      <ul className="grid gap-2 sm:grid-cols-2" role="listbox">
        {matches.map((city) => (
          <li key={city.id}>
            <button type="button" className="w-full rounded-xl border border-line/25 px-3 py-3 text-left" onClick={() => choose(city)}>
              <span className="block">{city.label}</span>
              <span className="text-sm text-mist">{city.country} · {city.timeZone}</span>
            </button>
          </li>
        ))}
      </ul>
      {draft.cityId ? (
        <p className="text-sm text-gold">
          {t('cityCentre')}: {draft.latitude}, {draft.longitude} · {draft.timeZone}
        </p>
      ) : (
        <label className="flex flex-col gap-2 text-sm text-mist">
          {t('country')}
          <input className={field} value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })} />
        </label>
      )}
      <label className="flex flex-col gap-2 text-sm text-mist">
        {t('gender')}
        <select className={field} value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value as BirthInput['gender'] })}>
          <option value="unspecified">{t('unspecified')}</option>
          <option value="female">{t('female')}</option>
          <option value="male">{t('male')}</option>
          <option value="other">{t('other')}</option>
        </select>
      </label>
      {invalid ? <p className="leading-7 text-red-200">{t('formError')}</p> : null}
      <PrimaryButton type="submit">{t('save')}</PrimaryButton>
    </form>
  )
}
