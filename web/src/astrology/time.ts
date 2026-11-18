export function zonedLocalToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error('Birth date or time is incomplete.')
  }
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  const first = zoneOffsetMs(guess, timeZone)
  let utc = new Date(guess.getTime() - first)
  const second = zoneOffsetMs(utc, timeZone)
  if (second !== first) utc = new Date(guess.getTime() - second)
  return utc
}

function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  const hour = read('hour') % 24
  const asUtc = Date.UTC(read('year'), read('month') - 1, read('day'), hour, read('minute'), read('second'))
  return asUtc - instant.getTime()
}
