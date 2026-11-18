import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { calculateChart, type Chart } from '../astrology/chart.ts'
import { formatArc, planetLabels, signNames } from '../astrology/names.ts'
import { nakshatraNames } from '../astrology/nakshatra.ts'
import { zonedLocalToUtc } from '../astrology/time.ts'
import { PageShell } from '../components/PageShell.tsx'
import { PrimaryButton } from '../components/Button.tsx'
import { cities } from '../domain/places.ts'
import { nameIdeas, padaSounds } from '../domain/nameIdeas.ts'
import { bhagyankFromDate, moolankFromDate, namankFromName, planetOfNumber } from '../domain/numerology.ts'
import { useI18n } from '../i18n/I18n.tsx'
import { useSession } from '../services/useSession.ts'
import { readSignupDraft } from '../domain/signupDraft.ts'

const field = 'min-h-12 rounded-xl border border-line/30 bg-card px-3 text-base text-ivory'

type Pending = { name?: string; birthDate?: string; birthTime?: string; cityId?: string; needsConfirm?: boolean }

export function DashboardPage() {
  const { language } = useI18n()
  const hi = language === 'hi'
  const { session, ready } = useSession()
  const navigate = useNavigate()
  const pending = (useLocation().state ?? null) as Pending | null
  const draft = readSignupDraft()
  const signedInName = sessionName(session?.user.user_metadata, session?.user.email)
  const [name, setName] = useState(signedInName || pending?.name || draft?.name || '')
  const [birthDate, setBirthDate] = useState(pending?.birthDate || draft?.birthDate || '')
  const [birthTime, setBirthTime] = useState(pending?.birthTime || draft?.birthTime || '')
  const [cityId, setCityId] = useState(pending?.cityId || draft?.cityId || 'delhi')
  const [planetPick, setPlanetPick] = useState<number | null>(null)
  const [chart, setChart] = useState<Chart | null>(null)
  const [chartError, setChartError] = useState('')

  const numbers = useMemo(() => {
    const moolank = birthDate ? moolankFromDate(birthDate) : null
    const bhagyank = birthDate ? bhagyankFromDate(birthDate) : null
    const namank = namankFromName(name)
    return { moolank, bhagyank, namank }
  }, [birthDate, name])

  const activeNumber = planetPick ?? numbers.moolank?.number ?? numbers.namank?.number ?? 1
  const ideas = nameIdeas[activeNumber]
  useEffect(() => {
    if (ready && !session) navigate('/login')
  }, [navigate, ready, session])

  useEffect(() => {
    if (birthDate && birthTime) onCalculate()
    // Fill the chart once from the saved signup details.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const labels = planetLabels[hi ? 'hi' : 'en']
  const signs = signNames[hi ? 'hi' : 'en']
  const stars = nakshatraNames[hi ? 'hi' : 'en']

  function onCalculate() {
    setChartError('')
    setChart(null)
    if (!birthDate || !birthTime) {
      setChartError(hi ? 'कुंडली और भाव के लिए जन्म समय और शहर चाहिए। अंक बिना समय के बन जाते हैं।' : 'Kundli and houses need a birth time and a city. The numbers work from the date alone.')
      return
    }
    const city = cities.find((item) => item.id === cityId)
    if (!city) return
    try {
      setChart(calculateChart({
        instant: zonedLocalToUtc(birthDate, birthTime, city.timeZone),
        latitude: city.latitude,
        longitude: city.longitude,
        timeZone: city.timeZone,
      }))
    } catch {
      setChartError(hi ? 'यह समय या शहर गणना के लिए पूरा नहीं है।' : 'That time or city could not be calculated.')
    }
  }

  const displayName = signedInName || name || pending?.name || (hi ? 'मेहमान' : 'Guest')

  if (!ready || !session) {
    return (
      <PageShell>
        <p className="px-5 py-16 text-mist">{hi ? 'लॉगिन खोला जा रहा है…' : 'Opening login…'}</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-12">
        <div>
          <p className="font-deva text-lg text-gold">त्रिकाल</p>
          <h1 className="font-serif text-5xl">{hi ? 'डैशबोर्ड' : 'Dashboard'}</h1>
          <p className="mt-3 text-lg text-ivory">{hi ? 'नमस्ते' : 'Hello'}, {displayName}</p>
          {session?.user.email ? <p className="text-sm text-mist">{session.user.email}</p> : null}
        </div>

        <form className="grid gap-4 rounded-3xl border border-line/25 bg-card p-5 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onCalculate() }}>
          <label className="flex flex-col gap-2 text-sm text-mist">{hi ? 'नाम' : 'Name'}
            <input className={field} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-mist">{hi ? 'जन्म तिथि' : 'Birth date'}
            <input className={field} type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-mist">{hi ? 'जन्म समय' : 'Birth time'}
            <input className={field} type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-mist">{hi ? 'शहर' : 'City'}
            <select className={field} value={cityId} onChange={(event) => setCityId(event.target.value)}>
              {cities.map((city) => <option key={city.id} value={city.id}>{city.label}</option>)}
            </select>
          </label>
          <div className="md:col-span-2">
            <PrimaryButton type="submit">{hi ? 'गणना करो' : 'Calculate'}</PrimaryButton>
          </div>
        </form>
        {chartError ? <p className="text-sm leading-6 text-gold">{chartError}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <NumberCard title={hi ? 'मूलांक' : 'Moolank'} body={numbers.moolank ? String(numbers.moolank.number) : '—'} note={numbers.moolank ? planetName(numbers.moolank.number, labels, hi) : (hi ? 'जन्म तिथि से दिन का अंक।' : 'From the day of birth.')} />
          <NumberCard title={hi ? 'भाग्यांक' : 'Bhagyank'} body={numbers.bhagyank ? String(numbers.bhagyank) : '—'} note={numbers.bhagyank ? planetName(numbers.bhagyank, labels, hi) : (hi ? 'पूरी तिथि के अंक।' : 'From the full date.')} />
          <NumberCard title={hi ? 'नामांक' : 'Namank'} body={numbers.namank ? String(numbers.namank.number) : '—'} note={numbers.namank ? `${hi ? 'चाल्डियन योग' : 'Chaldean total'} ${numbers.namank.total}. ${planetName(numbers.namank.number, labels, hi)}` : (hi ? 'नाम के अक्षरों से।' : 'From the letters in the name.')} />
        </div>

        <section className="rounded-3xl border border-line/25 bg-card p-5">
          <h2 className="font-serif text-3xl">{hi ? 'ग्रह के नाम' : 'Names by planet'}</h2>
          <p className="mt-2 max-w-3xl leading-7 text-mist">
            {hi
              ? 'ये वैदिक और आज चलने वाले नाम उस अंक के ग्रह से जोड़े जाते हैं। नाम कुंडली नहीं बदलता।'
              : 'These Vedic and current names are grouped by the planet of that number. A name does not change the chart.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button key={number} type="button" className={`rounded-full border px-3 py-1 text-sm ${number === activeNumber ? 'border-gold text-gold' : 'border-line/30 text-mist'}`} onClick={() => setPlanetPick(number)}>
                {number} {labels[planetOfNumber[number]]}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <NameList title={hi ? 'वैदिक' : 'Vedic'} names={ideas.vedic} />
            <NameList title={hi ? 'आधुनिक' : 'Modern'} names={ideas.modern} />
          </div>
        </section>

        {chart ? <ChartCards chart={chart} hi={hi} signs={signs} stars={stars} labels={labels} /> : (
          <p className="leading-7 text-mist">{hi ? 'कुंडली, भाव, नक्षत्र और दशा जन्म समय के बाद यहाँ खुलेंगे।' : 'Kundli, houses, nakshatra, and dasha open here after a birth time.'}</p>
        )}
      </section>
    </PageShell>
  )
}

function ChartCards({ chart, hi, signs, stars, labels }: { chart: Chart; hi: boolean; signs: readonly string[]; stars: readonly string[]; labels: Record<string, string> }) {
  const moon = chart.planets.find((planet) => planet.name === 'moon')
  const sound = moon ? padaSounds[moon.nakshatra]?.[moon.pada - 1] : null
  const houses = Array.from({ length: 12 }, (_, index) => {
    const house = index + 1
    const sign = (chart.lagna.sign + index) % 12
    const planets = chart.planets.filter((planet) => planet.house === house).map((planet) => labels[planet.name])
    return { house, sign: signs[sign], planets }
  })

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <NumberCard title={hi ? 'लग्न' : 'Lagna'} body={signs[chart.lagna.sign]} note={formatArc(chart.lagna.degreeInSign)} />
        <NumberCard title={hi ? 'चन्द्र राशि' : 'Moon sign'} body={moon ? signs[moon.sign] : '—'} note={moon ? formatArc(moon.degreeInSign) : ''} />
        <NumberCard title={hi ? 'नक्षत्र' : 'Nakshatra'} body={moon ? stars[moon.nakshatra] : '—'} note={moon ? `${hi ? 'पाद' : 'Pada'} ${moon.pada}${sound ? ` · ${sound}` : ''}` : ''} />
      </div>
      <section className="rounded-3xl border border-line/25 bg-card p-5">
        <h2 className="font-serif text-3xl">{hi ? 'भाव' : 'Houses'}</h2>
        <p className="mt-2 text-sm text-mist">{hi ? 'पूर्ण भाव। लग्न पहला भाव है।' : 'Whole sign. The lagna is the first house.'}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((house) => (
            <p key={house.house} className="rounded-2xl border border-line/20 px-3 py-3 text-sm">
              <span className="text-gold">{house.house}. {house.sign}</span>
              <span className="mt-1 block text-mist">{house.planets.length ? house.planets.join(', ') : (hi ? 'कोई ग्रह नहीं' : 'No planet')}</span>
            </p>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-line/25 bg-card p-5">
        <h2 className="font-serif text-3xl">{hi ? 'दशा' : 'Dasha'}</h2>
        <p className="mt-2 leading-7 text-mist">
          {chart.dasha.current
            ? `${labels[chart.dasha.current.maha] ?? chart.dasha.current.maha} / ${labels[chart.dasha.current.antar] ?? chart.dasha.current.antar}`
            : (hi ? 'वर्तमान दशा इस क्षण पर नहीं मिली।' : 'No current period was found for this moment.')}
        </p>
        <p className="text-sm text-mist">{hi ? 'जन्म पर शेष' : 'Balance at birth'}: {chart.dasha.balanceYears.toFixed(2)} {hi ? 'वर्ष' : 'years'}</p>
      </section>
    </div>
  )
}

function NumberCard({ title, body, note }: { title: string; body: string; note: string }) {
  return (
    <article className="rounded-3xl border border-line/25 bg-card p-5">
      <p className="text-sm text-mist">{title}</p>
      <p className="mt-2 font-serif text-4xl text-ivory">{body}</p>
      <p className="mt-2 text-sm leading-6 text-gold">{note}</p>
    </article>
  )
}

function NameList({ title, names }: { title: string; names: string[] }) {
  return (
    <div>
      <h3 className="text-sm text-gold">{title}</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {names.map((item) => <li key={item} className="rounded-full border border-line/30 px-3 py-1 text-sm">{item}</li>)}
      </ul>
    </div>
  )
}

function planetName(number: number, labels: Record<string, string>, hi: boolean): string {
  const planet = planetOfNumber[number]
  return planet ? `${hi ? 'ग्रह' : 'Planet'}: ${labels[planet]}` : ''
}

function sessionName(metadata: unknown, email?: string): string {
  if (metadata && typeof metadata === 'object' && 'name' in metadata && typeof metadata.name === 'string') return metadata.name
  return email ?? ''
}
