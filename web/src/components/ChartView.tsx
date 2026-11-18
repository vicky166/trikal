import type { Chart, PlanetName } from '../astrology/chart.ts'
import { formatArc, planetLabels, signNames } from '../astrology/names.ts'
import { nakshatraNames } from '../astrology/nakshatra.ts'
import { useI18n } from '../i18n/I18n.tsx'
import type { Language } from '../i18n/copy.ts'

const north: Record<number, { points: string; x: number; y: number }> = {
  1: { points: '180,8 250,78 180,148 110,78', x: 180, y: 78 },
  2: { points: '8,8 180,8 110,78', x: 90, y: 36 },
  3: { points: '8,8 110,78 8,180', x: 42, y: 90 },
  4: { points: '8,180 110,78 180,148 110,218', x: 100, y: 156 },
  5: { points: '8,180 110,218 8,332', x: 42, y: 250 },
  6: { points: '8,332 110,218 180,332', x: 90, y: 300 },
  7: { points: '180,332 250,262 180,192 110,262', x: 180, y: 270 },
  8: { points: '180,332 352,332 250,262', x: 270, y: 300 },
  9: { points: '250,262 352,332 352,180', x: 318, y: 250 },
  10: { points: '180,192 250,78 352,180 250,262', x: 260, y: 180 },
  11: { points: '250,78 352,8 352,180', x: 318, y: 90 },
  12: { points: '180,8 352,8 250,78', x: 270, y: 36 },
}

const southSigns = [11, 0, 1, 2, 10, -1, -1, 3, 9, -1, -1, 4, 8, 7, 6, 5]

const short: Record<Language, Record<PlanetName, string>> = {
  en: { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' },
  hi: { sun: 'सू', moon: 'चं', mars: 'मं', mercury: 'बु', jupiter: 'गु', venus: 'शु', saturn: 'श', rahu: 'रा', ketu: 'के' },
}

export function ChartView({ chart }: { chart: Chart }) {
  const { t, language } = useI18n()
  const signs = signNames[language]
  const planets = planetLabels[language]
  const marks = short[language]
  const moon = chart.planets.find((planet) => planet.name === 'moon')
  const sun = chart.planets.find((planet) => planet.name === 'sun')

  return (
    <div className="flex flex-col gap-8">
      <p className="leading-7 text-mist">{t('engineNote')}</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Fact label={t('lagnaLabel')} value={`${signs[chart.lagna.sign]} ${formatArc(chart.lagna.degreeInSign)}`} />
        <Fact label={t('yourMoon')} value={moon ? signs[moon.sign] : '—'} />
        <Fact label={t('sign')} value={sun ? `${planets.sun} · ${signs[sun.sign]}` : '—'} />
      </div>
      {moon ? (
        <p className="text-lg">
          {nakshatraNames[language][moon.nakshatra]} · {t('pada')} {moon.pada}
        </p>
      ) : null}
      {chart.nearBoundary.length > 0 ? (
        <p className="text-sm text-gold">
          {t('boundaryNote')}: {chart.nearBoundary.map((name) => planets[name]).join(', ')}
        </p>
      ) : null}

      <section>
        <h2 className="font-serif text-3xl">{t('northChart')}</h2>
        <svg viewBox="0 0 360 340" className="mt-4 w-full max-w-xl text-ivory" role="img" aria-label={t('northChart')}>
          {Object.entries(north).map(([house, shape]) => {
            const number = Number(house)
            const bodies = chart.planets.filter((planet) => planet.house === number)
            return (
              <g key={house}>
                <polygon points={shape.points} fill="#171322" stroke="#c6a36a" strokeOpacity="0.55" />
                <text x={shape.x} y={shape.y - 8} textAnchor="middle" fill="#c6a36a" fontSize="11">
                  {number === 1 ? signs[chart.lagna.sign] : number}
                </text>
                <text x={shape.x} y={shape.y + 12} textAnchor="middle" fill="#f3ede2" fontSize="12">
                  {bodies.map((planet) => marks[planet.name]).join(' ')}
                </text>
              </g>
            )
          })}
        </svg>
      </section>

      <section>
        <h2 className="font-serif text-3xl">{t('southChart')}</h2>
        <div className="mt-4 grid max-w-xl grid-cols-4 border border-line/40" aria-label={t('southChart')}>
          {southSigns.map((sign, index) => {
            const bodies = sign < 0 ? [] : chart.planets.filter((planet) => planet.sign === sign)
            return (
              <div key={index} className="flex min-h-20 flex-col gap-1 border border-line/25 p-2 text-sm">
                {sign < 0 ? null : (
                  <>
                    <span className="text-gold">{signs[sign]}</span>
                    <span>{bodies.map((planet) => marks[planet.name]).join(' ')}</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="overflow-x-auto">
        <h2 className="font-serif text-3xl">{t('planetTable')}</h2>
        <table className="mt-4 w-full min-w-[36rem] text-left text-sm">
          <thead className="text-gold">
            <tr>
              <th className="py-2 pr-3 font-medium">{t('planetTable')}</th>
              <th className="py-2 pr-3 font-medium">{t('sign')}</th>
              <th className="py-2 pr-3 font-medium">{t('degree')}</th>
              <th className="py-2 pr-3 font-medium">{t('house')}</th>
              <th className="py-2 pr-3 font-medium">{t('nakshatra')}</th>
              <th className="py-2 font-medium">{t('navamsaTitle')}</th>
            </tr>
          </thead>
          <tbody>
            {chart.planets.map((planet) => (
              <tr key={planet.name} className="border-t border-line/20">
                <td className="py-2 pr-3">
                  {planets[planet.name]}
                  {planet.retrograde ? <span className="text-gold"> · {t('retrograde')}</span> : null}
                </td>
                <td className="py-2 pr-3">{signs[planet.sign]}</td>
                <td className="py-2 pr-3">{formatArc(planet.degreeInSign)}</td>
                <td className="py-2 pr-3">{planet.house}</td>
                <td className="py-2 pr-3">
                  {nakshatraNames[language][planet.nakshatra]} {planet.pada}
                </td>
                <td className="py-2">{signs[planet.navamsa]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-serif text-3xl">{t('dashaTitle')}</h2>
        {chart.dasha.current ? (
          <p className="mt-3 text-lg">
            {t('currentPeriod')}: {planets[chart.dasha.current.maha as PlanetName]} / {planets[chart.dasha.current.antar as PlanetName]}
          </p>
        ) : null}
        <p className="mt-2 text-mist">
          {t('balance')}: {chart.dasha.balanceYears.toFixed(2)} {t('years')}
        </p>
        <ol className="mt-4 grid gap-2 md:grid-cols-3">
          {chart.dasha.periods.map((period) => (
            <li key={period.lord} className="rounded-xl border border-line/25 px-3 py-2 text-sm">
              <span className="text-gold">{planets[period.lord]}</span>
              <span className="mt-1 block text-mist">{period.start.slice(0, 10)} – {period.end.slice(0, 10)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-line/25 bg-card p-4">
      <p className="text-xs tracking-[0.16em] text-gold uppercase">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </article>
  )
}
