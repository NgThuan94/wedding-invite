'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: string
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const target = new Date(targetDate + 'T00:00:00').getTime()
  const now = Date.now()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  }
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false })

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calcTimeLeft(targetDate))
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!mounted || timeLeft.isPast) return null

  const units = [
    { value: timeLeft.days, label: 'Ngày' },
    { value: timeLeft.hours, label: 'Giờ' },
    { value: timeLeft.minutes, label: 'Phút' },
    { value: timeLeft.seconds, label: 'Giây' },
  ]

  return (
    <div className={className}>
      <p className="mb-3 text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Đếm ngược đến ngày trọng đại
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        {units.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/80 sm:h-16 sm:w-16">
              <span className="font-serif text-2xl font-light tabular-nums text-foreground sm:text-3xl">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="mt-1.5 text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
