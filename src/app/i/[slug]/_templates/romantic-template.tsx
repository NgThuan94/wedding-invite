'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDownIcon, CalendarIcon, MapPinIcon, ShirtIcon, TvIcon } from 'lucide-react'
import { GradientPlaceholder } from '@/components/gradient-placeholder'
import { GallerySection } from '../_components/gallery-section'
import { RsvpSection } from '../_components/rsvp-section'
import { CountdownTimer } from '@/components/countdown-timer'
import { useScrollReveal } from '@/lib/hooks/use-scroll-reveal'
import type { TemplateProps } from './types'
import type { Tables } from '@/types/database'

// ---------------------------------------------------------------------------
// Floral decorators (inline SVG — no separate file)
// ---------------------------------------------------------------------------

function FloralDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="h-px w-12 bg-rose-300/60" />
      <svg width="32" height="18" viewBox="0 0 32 18" fill="none" aria-hidden className="text-rose-300">
        <path d="M16 9 C12 4,4 4,4 9 C4 14,12 14,16 9Z" fill="currentColor" fillOpacity="0.5" />
        <path d="M16 9 C20 4,28 4,28 9 C28 14,20 14,16 9Z" fill="currentColor" fillOpacity="0.5" />
        <circle cx="16" cy="9" r="2" fill="currentColor" fillOpacity="0.8" />
      </svg>
      <div className="h-px w-12 bg-rose-300/60" />
    </div>
  )
}

function RomanticHero({ inv }: { inv: Tables<'invitations'> }) {
  const coupleName = [inv.groom_name, inv.bride_name].filter(Boolean).join(' & ')
  const { scrollY } = useScroll()
  const imgY = useTransform(scrollY, [0, 500], [0, 80])
  const textY = useTransform(scrollY, [0, 500], [0, 40])

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <section className="relative h-svh min-h-[600px] flex items-end overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        {inv.cover_photo_url ? (
          <Image src={inv.cover_photo_url} alt={coupleName} fill priority className="object-cover" sizes="100vw" />
        ) : (
          <GradientPlaceholder className="h-full w-full" />
        )}
      </motion.div>

      {/* Romantic gradient: more pink tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-rose-900/30 to-transparent" />

      <motion.div style={{ y: textY }} className="relative z-10 w-full px-6 pb-16 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        >
          {inv.hashtag && (
            <p className="mb-4 text-sm font-light tracking-[0.25em] text-white/80 uppercase">
              #{inv.hashtag}
            </p>
          )}
          <h1
            className="leading-tight text-5xl md:text-7xl"
            style={{ fontFamily: 'var(--font-dancing-variable)', fontWeight: 600 }}
          >
            {inv.groom_name && <span>{inv.groom_name}</span>}
            {inv.groom_name && inv.bride_name && (
              <span className="mx-4 text-3xl text-white/70 md:text-5xl">&amp;</span>
            )}
            {inv.bride_name && <span>{inv.bride_name}</span>}
          </h1>
          {inv.wedding_date && (
            <p className="mt-5 text-sm font-light tracking-widest text-white/80 uppercase">
              {formatDate(inv.wedding_date)}
            </p>
          )}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/60 animate-bounce">
        <ChevronDownIcon className="h-6 w-6" />
      </div>
    </section>
  )
}

function RomanticStory({ story }: { story: string }) {
  const { ref, inView } = useScrollReveal()
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="py-20 px-6 md:py-28"
      style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FFF0F3 100%)' }}
    >
      <div className="mx-auto max-w-xl text-center">
        <FloralDivider />
        <h2
          className="my-5 text-3xl md:text-4xl text-rose-800"
          style={{ fontFamily: 'var(--font-dancing-variable)', fontWeight: 600 }}
        >
          Chuyện tình của chúng mình
        </h2>
        <p
          className="text-base leading-relaxed text-rose-900/70 whitespace-pre-line"
          style={{ fontFamily: 'var(--font-lora-variable)' }}
        >
          {story}
        </p>
        <FloralDivider />
      </div>
    </motion.section>
  )
}

function RomanticTimeline({ items }: { items: Tables<'love_timeline'>[] }) {
  const { ref, inView } = useScrollReveal(0.1)
  if (items.length === 0) return null

  function formatEventDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  }

  return (
    <section ref={ref} className="py-20 px-6 md:py-28" style={{ background: '#FFF0F3' }}>
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <FloralDivider />
          <h2
            className="my-4 text-3xl md:text-4xl text-rose-800"
            style={{ fontFamily: 'var(--font-dancing-variable)', fontWeight: 600 }}
          >
            Những kỷ niệm đáng nhớ
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-rose-300/40 md:left-1/2 md:-translate-x-px" />
          <div className="space-y-12">
            {items.map((item, idx) => {
              const isLeft = idx % 2 === 0
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="relative flex gap-6 md:gap-0"
                >
                  <div className="absolute left-4 top-2 z-10 -translate-x-1/2 md:left-1/2">
                    <div className="h-3 w-3 rounded-full border-2 border-rose-400 bg-white" />
                  </div>
                  <div className={`pl-10 md:pl-0 md:w-1/2 ${isLeft ? 'md:pr-10' : 'md:ml-auto md:pl-10'}`}>
                    <div className="rounded-2xl bg-white/80 p-5 shadow-sm border border-rose-100">
                      {item.photo_url && (
                        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl">
                          <Image src={item.photo_url} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 80vw, 40vw" loading="lazy" />
                        </div>
                      )}
                      {item.event_date && (
                        <p className="mb-1 text-xs font-medium tracking-wider text-rose-400 uppercase">
                          {formatEventDate(item.event_date)}
                        </p>
                      )}
                      <h3 className="text-lg font-medium text-rose-900" style={{ fontFamily: 'var(--font-lora-variable)' }}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-2 text-sm leading-relaxed text-rose-800/60">{item.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function RomanticDetails({ inv }: { inv: Tables<'invitations'> }) {
  const { ref, inView } = useScrollReveal()

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const mapsUrl = inv.venue_map_url || (inv.venue_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inv.venue_address)}` : null)

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="py-20 px-6 md:py-28"
      style={{ background: 'linear-gradient(180deg, #FFF0F3 0%, #FFF5F5 100%)' }}
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-14 text-center">
          <FloralDivider />
          <h2
            className="my-4 text-3xl md:text-4xl text-rose-800"
            style={{ fontFamily: 'var(--font-dancing-variable)', fontWeight: 600 }}
          >
            Thông tin lễ cưới
          </h2>
        </div>

        {inv.wedding_date && <CountdownTimer targetDate={inv.wedding_date} className="mb-8" />}

        <div className="space-y-5">
          {inv.wedding_date && (
            <div className="flex gap-4 rounded-2xl bg-white/70 px-5 py-4 border border-rose-100">
              <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-medium text-rose-900">{formatDate(inv.wedding_date)}</p>
                {inv.wedding_time && <p className="mt-0.5 text-sm text-rose-700/70">{inv.wedding_time}</p>}
              </div>
            </div>
          )}
          {inv.venue_name && (
            <div className="flex gap-4 rounded-2xl bg-white/70 px-5 py-4 border border-rose-100">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-medium text-rose-900">{inv.venue_name}</p>
                {inv.venue_address && <p className="mt-0.5 text-sm text-rose-700/70">{inv.venue_address}</p>}
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-rose-500 underline-offset-4 hover:underline">
                    Mở Google Maps →
                  </a>
                )}
              </div>
            </div>
          )}
          {inv.dress_code && (
            <div className="flex gap-4 rounded-2xl bg-white/70 px-5 py-4 border border-rose-100">
              <ShirtIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="text-sm text-rose-700/70">Dress code</p>
                <p className="font-medium text-rose-900">{inv.dress_code}</p>
              </div>
            </div>
          )}
          {inv.live_stream_url && (
            <div className="flex gap-4 rounded-2xl bg-white/70 px-5 py-4 border border-rose-100">
              <TvIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="text-sm text-rose-700/70">Xem trực tiếp</p>
                <a href={inv.live_stream_url} target="_blank" rel="noopener noreferrer" className="font-medium text-rose-500 underline-offset-4 hover:underline">
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

function RomanticParty({ members }: { members: Tables<'wedding_party'>[] }) {
  const { ref, inView } = useScrollReveal(0.1)
  if (members.length === 0) return null

  return (
    <section ref={ref} className="py-20 px-6 md:py-28" style={{ background: '#FFF0F3' }}>
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <FloralDivider />
          <h2
            className="my-4 text-3xl md:text-4xl text-rose-800"
            style={{ fontFamily: 'var(--font-dancing-variable)', fontWeight: 600 }}
          >
            Những người thân yêu
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="text-center"
            >
              <div className="relative mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border-2 border-rose-300/40 md:h-28 md:w-28">
                {member.photo_url ? (
                  <Image src={member.photo_url} alt={member.name} fill className="object-cover" sizes="112px" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-rose-50 text-2xl text-rose-400">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-base font-medium text-rose-900" style={{ fontFamily: 'var(--font-lora-variable)' }}>{member.name}</p>
              {member.role && <p className="mt-0.5 text-xs text-rose-400">{member.role}</p>}
              {member.description && <p className="mt-1 text-xs leading-relaxed text-rose-700/60">{member.description}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main template
// ---------------------------------------------------------------------------

export function RomanticTemplate({ inv, timeline, party, galleryImages }: TemplateProps) {
  return (
    <div className="min-h-screen" style={{ background: '#FFF5F5' }}>
      <RomanticHero inv={inv} />
      {inv.story && <RomanticStory story={inv.story} />}
      <RomanticTimeline items={timeline} />
      <RomanticDetails inv={inv} />
      {galleryImages.length > 0 && (
        <div style={{ background: '#FFF0F3' }}>
          <GallerySection images={galleryImages} />
        </div>
      )}
      <RomanticParty members={party} />
      <div style={{ background: '#FFF0F3' }}>
        <RsvpSection invitationId={inv.id} />
      </div>
      <footer className="py-8 pb-24 md:pb-8 text-center" style={{ background: '#FFF0F3' }}>
        <p className="text-xs text-rose-400/60">
          Được tạo bằng <span className="text-rose-500">Thiệp Cưới Online</span>
        </p>
      </footer>
    </div>
  )
}
