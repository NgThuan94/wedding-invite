interface FloralDividerProps {
  className?: string
}

export function FloralDivider({ className }: FloralDividerProps) {
  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, margin: '56px 0' }}
    >
      <span style={{ height: 1, width: 120, background: 'linear-gradient(90deg, transparent, #C68C86 50%, transparent)', display: 'block' }} />
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ color: '#A96E68', flexShrink: 0 }}>
        <circle cx="20" cy="20" r="3" fill="currentColor" opacity=".85" />
        <circle cx="20" cy="10" r="3.2" fill="currentColor" opacity=".55" />
        <circle cx="20" cy="30" r="3.2" fill="currentColor" opacity=".55" />
        <circle cx="10" cy="20" r="3.2" fill="currentColor" opacity=".55" />
        <circle cx="30" cy="20" r="3.2" fill="currentColor" opacity=".55" />
        <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1" opacity=".4" fill="none" />
      </svg>
      <span style={{ height: 1, width: 120, background: 'linear-gradient(90deg, transparent, #C68C86 50%, transparent)', display: 'block' }} />
    </div>
  )
}
