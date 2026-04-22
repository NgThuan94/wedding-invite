'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useScrollReveal } from '@/lib/hooks/use-scroll-reveal'
import type { Tables } from '@/types/database'

interface TimelineSectionProps {
  items: Tables<'love_timeline'>[]
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
}

export function TimelineSection({ items }: TimelineSectionProps) {
  const { ref, inView } = useScrollReveal(0.1)

  if (items.length === 0) return null

  return (
    <section ref={ref} className="py-20 px-6 md:py-28 bg-secondary/40">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-14 text-center"
        >
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Những kỷ niệm đáng nhớ
          </h2>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-accent/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            <div className="h-px w-12 bg-accent/40" />
          </div>
        </motion.div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-accent/20 md:left-1/2 md:-translate-x-px" />

          <div className="space-y-12">
            {items.map((item, idx) => {
              const isLeft = idx % 2 === 0
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                  className="relative flex gap-6 md:gap-0"
                >
                  <div className="absolute left-4 top-2 z-10 -translate-x-1/2 md:left-1/2">
                    <div className="h-3 w-3 rounded-full border-2 border-accent bg-background" />
                  </div>

                  <div className={`pl-10 md:pl-0 md:w-1/2 ${isLeft ? 'md:pr-10' : 'md:ml-auto md:pl-10'}`}>
                    <div className="rounded-xl bg-card p-5 shadow-sm">
                      {item.photo_url && (
                        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src={item.photo_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 80vw, 40vw"
                            loading="lazy"
                          />
                        </div>
                      )}
                      {item.event_date && (
                        <p className="mb-1 text-xs font-medium tracking-wider text-accent uppercase">
                          {formatEventDate(item.event_date)}
                        </p>
                      )}
                      <h3 className="font-serif text-lg font-medium text-foreground">{item.title}</h3>
                      {item.description && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
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
