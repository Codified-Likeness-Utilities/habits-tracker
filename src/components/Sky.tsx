import type { Moment } from '../lib/types';

/** Paysage illustré dont la lumière suit le moment de la journée. */
const PALETTES: Record<Moment, { sky: [string, string]; star: string; hills: [string, string, string] }> = {
  morning: { sky: ['#ffb38a', '#ffe3c2'], star: '#fff4d6', hills: ['#f49a7a', '#e0705c', '#b8505a'] },
  afternoon: { sky: ['#8fd0d0', '#f6e7b8'], star: '#fff6cf', hills: ['#7dbfa4', '#4f9c86', '#2f7468'] },
  evening: { sky: ['#1e1a47', '#4b3a78'], star: '#f6e7b8', hills: ['#43366f', '#2f2759', '#1c1840'] },
};

export function Sky({ moment, className }: { moment: Moment; className?: string }) {
  const p = PALETTES[moment];
  const night = moment === 'evening';
  const sunY = moment === 'morning' ? 118 : moment === 'afternoon' ? 58 : 70;
  return (
    <svg className={className} viewBox="0 0 400 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`sky-${moment}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`glow-${moment}`}>
          <stop offset="0" stopColor={p.star} stopOpacity="0.9" />
          <stop offset="1" stopColor={p.star} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#sky-${moment})`} />
      {night &&
        STARS.map(([x, y, r], i) => (
          <circle key={i} className="sky-star" cx={x} cy={y} r={r} fill={p.star} style={{ animationDelay: `${i * 0.37}s` }} />
        ))}
      <circle cx="300" cy={sunY} r="70" fill={`url(#glow-${moment})`} />
      {night ? (
        <>
          <mask id="moon-cut">
            <rect width="400" height="220" fill="#fff" />
            <circle cx="310" cy={sunY - 7} r="17" fill="#000" />
          </mask>
          <circle cx="300" cy={sunY} r="20" fill={p.star} mask="url(#moon-cut)" />
        </>
      ) : (
        <circle cx="300" cy={sunY} r="24" fill={p.star} />
      )}
      <path d="M0 150 C 70 120 130 126 200 146 S 330 130 400 118 V220 H0Z" fill={p.hills[0]} />
      <path d="M0 176 C 90 150 160 160 240 176 S 350 168 400 156 V220 H0Z" fill={p.hills[1]} />
      <path d="M0 204 C 110 184 220 188 300 200 S 380 196 400 192 V220 H0Z" fill={p.hills[2]} />
    </svg>
  );
}

const STARS: [number, number, number][] = [
  [30, 30, 1.4], [72, 58, 1], [118, 22, 1.6], [160, 70, 1], [204, 36, 1.2],
  [246, 16, 1], [356, 30, 1.4], [380, 82, 1], [92, 96, 0.9], [226, 92, 1.1],
];
