interface FloralCornerProps {
  className?: string
  style?: React.CSSProperties
}

export function FloralCorner({ className, style }: FloralCornerProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      style={style}
      aria-hidden="true"
      fill="none"
    >
      <g strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <path d="M10 10 C 60 40, 110 70, 150 140" stroke="#9CAF88" strokeWidth="1.4" />
        <path d="M10 10 C 40 80, 80 120, 130 170" stroke="#9CAF88" strokeWidth="1.1" opacity=".7" />
        <path d="M10 10 C 80 30, 130 50, 180 90" stroke="#9CAF88" strokeWidth="1.1" opacity=".7" />
        <g fill="#9CAF88" opacity=".55" stroke="none">
          <ellipse cx="40" cy="30" rx="12" ry="5" transform="rotate(30 40 30)" />
          <ellipse cx="62" cy="46" rx="10" ry="4" transform="rotate(25 62 46)" />
          <ellipse cx="86" cy="66" rx="13" ry="5" transform="rotate(35 86 66)" />
          <ellipse cx="112" cy="86" rx="11" ry="4.5" transform="rotate(30 112 86)" />
          <ellipse cx="34" cy="68" rx="9" ry="4" transform="rotate(70 34 68)" />
          <ellipse cx="58" cy="92" rx="11" ry="4" transform="rotate(65 58 92)" />
          <ellipse cx="78" cy="120" rx="10" ry="4" transform="rotate(60 78 120)" />
          <ellipse cx="108" cy="146" rx="9" ry="3.5" transform="rotate(55 108 146)" />
          <ellipse cx="138" cy="20" rx="10" ry="4" transform="rotate(10 138 20)" />
          <ellipse cx="170" cy="40" rx="12" ry="5" transform="rotate(15 170 40)" />
        </g>
        <g>
          <g transform="translate(148 138)">
            <circle r="22" fill="#EFC9C4" />
            <circle r="15" fill="#D9A7A1" />
            <circle r="8" fill="#B8827D" />
            <path d="M -18 -4 Q -8 -18 4 -14" stroke="#B8827D" fill="none" strokeWidth="1.2" />
            <path d="M -4 18 Q 10 14 18 4" stroke="#B8827D" fill="none" strokeWidth="1.2" />
          </g>
          <g transform="translate(70 80)">
            <circle r="14" fill="#F3D6D1" />
            <circle r="9" fill="#DDB0AA" />
            <circle r="4" fill="#B8827D" />
          </g>
          <g transform="translate(198 82)">
            <circle r="11" fill="#F6DDD8" />
            <circle r="7" fill="#E0B6B0" />
            <circle r="3" fill="#B8827D" />
          </g>
          <g fill="#E9B8B1" stroke="none">
            <circle cx="30" cy="110" r="4" />
            <circle cx="120" cy="38" r="3.5" />
            <circle cx="182" cy="128" r="4.5" />
          </g>
        </g>
      </g>
    </svg>
  )
}
