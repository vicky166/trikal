import Svg, { Circle, Path } from 'react-native-svg';

function arc(cx: number, cy: number, radius: number, startDeg: number, sweep: number): string {
  const start = (Math.PI / 180) * startDeg;
  const end = (Math.PI / 180) * (startDeg + sweep);
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);
  return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
}

export function Mark({ size = 88, color }: { size?: number; color: string }) {
  const scale = size / 72;
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      {[ -80, 40, 160 ].map((start) => (
        <Path
          key={start}
          d={arc(36, 36, 24, start, 78)}
          stroke={color}
          strokeWidth={1.4 / Math.max(scale, 0.7)}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <Circle cx="36" cy="36" r="2.4" fill={color} />
    </Svg>
  );
}
