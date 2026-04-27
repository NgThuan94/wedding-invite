interface PetalSvgProps {
  style?: React.CSSProperties
  className?: string
}

export function PetalSvg({ style, className }: PetalSvgProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <path d="M20 2 C 32 10, 34 28, 20 38 C 6 28, 8 10, 20 2 Z" fill="currentColor" opacity="0.85" />
      <path d="M20 4 C 22 16, 22 28, 20 38" stroke="#fff" strokeWidth=".5" fill="none" opacity="0.5" />
    </svg>
  )
}
