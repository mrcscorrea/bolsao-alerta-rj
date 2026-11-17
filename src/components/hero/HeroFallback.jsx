/**
 * Versão 2D (SVG) do hero: usada enquanto o 3D carrega, quando o usuário
 * prefere menos movimento ou quando o aparelho não tem WebGL.
 */
export function HeroFallback({ laminaCm }) {
  const nivel = 300 - laminaCm * 2.4
  return (
    <svg
      viewBox="0 0 600 360"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <rect x="0" y="300" width="600" height="60" fill="var(--bg-3)" />
      <path d="M0 302 H600" stroke="var(--signal)" strokeWidth="3" strokeDasharray="28 22" />
      <g transform="translate(330 196)">
        <path d="M0 70 L10 38 L60 34 L92 4 H170 L205 34 L250 40 L258 70 Z" fill="#f2b705" />
        <rect x="6" y="52" width="250" height="8" fill="#1f4fa0" />
        <path d="M100 12 H164 L190 34 H82 Z" fill="#10161c" />
        <circle cx="62" cy="82" r="24" fill="#0d0d0d" />
        <circle cx="204" cy="82" r="24" fill="#0d0d0d" />
      </g>
      <rect
        x="0"
        y={nivel}
        width="600"
        height={360 - nivel}
        fill="var(--water)"
        opacity="0.6"
        style={{ transition: 'y 500ms ease' }}
      />
    </svg>
  )
}
