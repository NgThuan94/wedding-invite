'use client'

import { motion } from 'framer-motion'
import { CalendarIcon, MapPinIcon, ShirtIcon, TvIcon } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/use-scroll-reveal'
import { CountdownTimer } from '@/components/countdown-timer'

interface DetailsSectionProps {
  weddingDate: string | null
  weddingTime: string | null
  venueName: string | null
  venueAddress: string | null
  venueMapUrl: string | null
  dressCode: string | null
  liveStreamUrl: string | null
}

function formatWeddingDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function DetailsSection({
  weddingDate,
  weddingTime,
  venueName,
  venueAddress,
  venueMapUrl,
  dressCode,
  liveStreamUrl,
}: DetailsSectionProps) {
  const { ref, inView } = useScrollReveal()

  const mapsUrl = venueMapUrl || (venueAddress ? buildMapsUrl(venueAddress) : null)

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="py-20 px-6 md:py-28"
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Thông tin lễ cưới
          </h2>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-accent/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            <div className="h-px w-12 bg-accent/40" />
          </div>
        </div>

        {/* Countdown */}
        {weddingDate && <CountdownTimer targetDate={weddingDate} className="mb-8" />}

        <div className="space-y-6">
          {/* Date & Time */}
          {weddingDate && (
            <div className="flex gap-4 rounded-xl bg-secondary/60 px-5 py-4">
              <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">{formatWeddingDate(weddingDate)}</p>
                {weddingTime && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{weddingTime}</p>
                )}
              </div>
            </div>
          )}

          {/* Venue */}
          {venueName && (
            <div className="flex gap-4 rounded-xl bg-secondary/60 px-5 py-4">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">{venueName}</p>
                {venueAddress && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{venueAddress}</p>
                )}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
                  >
                    Mở Google Maps →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Dress code */}
          {dressCode && (
            <div className="flex gap-4 rounded-xl bg-secondary/60 px-5 py-4">
              <ShirtIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Dress code</p>
                <p className="font-medium text-foreground">{dressCode}</p>
              </div>
            </div>
          )}

          {/* Live stream */}
          {liveStreamUrl && (
            <div className="flex gap-4 rounded-xl bg-secondary/60 px-5 py-4">
              <TvIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Xem trực tiếp</p>
                <a
                  href={liveStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent underline-offset-4 hover:underline"
                >
                  Nhấn để xem live stream →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
