import { useId } from "react";

/** Glass outlined ZECONDS, stretched to the rail width. */
export function ZecondsWord({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 100 26"
      className={className}
      role="img"
      aria-label="Zeconds"
    >
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.62" />
          <stop offset="22%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="52%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.42" />
        </linearGradient>
        <linearGradient id={`${gid}-stroke`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.78" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.7" />
        </linearGradient>
        <filter id={`${gid}-glow`} x="-8%" y="-30%" width="116%" height="170%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.7" floodColor="#fff" floodOpacity="0.28" />
        </filter>
      </defs>
      <text
        x="50"
        y="20.4"
        textAnchor="middle"
        fontFamily='"Bebas Neue", sans-serif'
        fontSize="21"
        letterSpacing="-0.45"
        fill={`url(#${gid}-fill)`}
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="0.95"
        paintOrder="stroke fill"
        textLength="94"
        lengthAdjust="spacingAndGlyphs"
        filter={`url(#${gid}-glow)`}
      >
        ZECONDS
      </text>
    </svg>
  );
}
