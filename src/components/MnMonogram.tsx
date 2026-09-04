export function MnMonogram({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="MN monogram"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mn-gradient" x1="18" y1="20" x2="101" y2="101" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd3e5" />
          <stop offset="0.42" stopColor="#ff5ca2" />
          <stop offset="1" stopColor="#ff257f" />
        </linearGradient>
        <filter id="mn-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="60" cy="60" r="45" fill="none" stroke="#ff4b96" strokeOpacity="0.36" strokeWidth="1.2" strokeDasharray="142 54" transform="rotate(-26 60 60)" />
      <path d="M25 88V34L53 78L73 34V88" fill="none" stroke="url(#mn-gradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#mn-glow)" />
      <path d="M70 87V39L98 87V37" fill="none" stroke="url(#mn-gradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#mn-glow)" />
      <path d="M30 26C56 13 88 17 101 34" fill="none" stroke="#ff78b1" strokeOpacity="0.75" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22 73C27 94 44 104 61 106" fill="none" stroke="#ff78b1" strokeOpacity="0.6" strokeWidth="1.3" strokeLinecap="round" />

      <g fill="#ffd7e8" filter="url(#mn-glow)">
        <path d="M96 23L98.2 28.8L104 31L98.2 33.2L96 39L93.8 33.2L88 31L93.8 28.8Z" />
        <path d="M37 96L38.2 99.2L41.5 100.5L38.2 101.8L37 105L35.8 101.8L32.5 100.5L35.8 99.2Z" />
      </g>
    </svg>
  )
}
