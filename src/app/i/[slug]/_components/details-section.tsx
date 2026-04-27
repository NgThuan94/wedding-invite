'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
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

function buildEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15&hl=vi`
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
  const { ref: revealRef, inView } = useScrollReveal()
  const { scrollY } = useScroll()

  const blobLeftY  = useTransform(scrollY, [800, 3000], [-40, 40])
  const blobRightY = useTransform(scrollY, [800, 3000], [40, -40])
  const ornamentY  = useTransform(scrollY, [800, 3000], [-20, 20])

  const mapsUrl = venueMapUrl || (venueAddress ? buildMapsUrl(venueAddress) : null)

  return (
    <section className="relative overflow-hidden py-20 px-6 md:py-28">
      {/* Parallax background blobs */}
      <motion.div
        aria-hidden
        style={{ y: blobLeftY }}
        className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: blobRightY }}
        className="pointer-events-none absolute -right-20 bottom-1/4 h-56 w-56 rounded-full bg-accent/5 blur-3xl"
      />

      <motion.div
        ref={revealRef as React.Ref<HTMLDivElement>}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative mx-auto max-w-xl"
      >
        <div className="mb-14 text-center">
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Thông tin lễ cưới
          </h2>
          <motion.div style={{ y: ornamentY }} className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-accent/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            <div className="h-px w-12 bg-accent/40" />
          </motion.div>
        </div>

        {weddingDate && <CountdownTimer targetDate={weddingDate} className="mb-8" />}

        <div className="space-y-6">
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

          {venueName && (
            <div className="rounded-xl bg-secondary/60 px-5 py-4">
              <div className="flex gap-4">
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

              {venueAddress && (
                <div className="mt-4 overflow-hidden rounded-lg">
                  <iframe
                    src={buildEmbedUrl(venueAddress)}
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ ${venueName}`}
                  />
                </div>
              )}
            </div>
          )}

          {dressCode && (
            <div className="flex gap-4 rounded-xl bg-secondary/60 px-5 py-4">
              <ShirtIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Dress code</p>
                <p className="font-medium text-foreground">{dressCode}</p>
              </div>
            </div>
          )}

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
      </motion.div>
    </section>
  )
}
