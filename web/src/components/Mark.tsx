type MarkProps = { className?: string }

export function Mark({ className }: MarkProps) {
  const arc = (start: number, sweep: number) => {
    const radius = 24
    const toXY = (degree: number) => {
      const radians = (Math.PI / 180) * degree
      return [36 + radius * Math.cos(radians), 36 + radius * Math.sin(radians)]
    }
    const [x1, y1] = toXY(start)
    const [x2, y2] = toXY(start + sweep)
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`
  }

  return (
    <svg className={className} viewBox="0 0 72 72" aria-hidden="true">
      {[-80, 40, 160].map((start) => (
        <path key={start} d={arc(start, 78)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      <circle cx="36" cy="36" r="2.4" fill="currentColor" />
    </svg>
  )
}
