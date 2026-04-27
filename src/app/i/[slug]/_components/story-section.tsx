'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useScrollReveal } from '@/lib/hooks/use-scroll-reveal'

interface StorySectionProps {
  story: string
}

export function StorySection({ story }: StorySectionProps) {
  const { ref: revealRef, inView } = useScrollReveal()
  const { scrollY } = useScroll()

  const ornamentY   = useTransform(scrollY, [0, 2000], [-28, 28])
  const textY       = useTransform(scrollY, [0, 2000], [14, -14])
  const dotLeftY    = useTransform(scrollY, [0, 2000], [-40, 40])
  const dotRightY   = useTransform(scrollY, [0, 2000], [40, -40])

  return (
    <section className="relative overflow-hidden py-20 px-6 md:py-28">
      {/* Floating background accents */}
      <motion.div
        aria-hidden
        style={{ y: dotLeftY }}
        className="pointer-events-none absolute -left-8 top-1/3 h-48 w-48 rounded-full bg-accent/5 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: dotRightY }}
        className="pointer-events-none absolute -right-8 bottom-1/3 h-64 w-64 rounded-full bg-accent/5 blur-3xl"
      />

      <motion.div
        ref={revealRef as React.Ref<HTMLDivElement>}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative mx-auto max-w-xl text-center"
      >
        {/* Ornament — faster parallax layer */}
        <motion.div style={{ y: ornamentY }} className="mb-8 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-accent/40" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent" aria-hidden>
            <path d="M12 2C9 6 3 7 3 12s6 6 9 10c3-4 9-5 9-10S15 6 12 2z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
          </svg>
          <div className="h-px w-16 bg-accent/40" />
        </motion.div>

        {/* Text block — slower parallax layer */}
        <motion.div style={{ y: textY }}>
          <h2 className="mb-6 font-serif text-3xl font-light text-foreground md:text-4xl">
            Chuyện tình của chúng mình
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
            {story}
          </p>
        </motion.div>

        {/* Bottom ornament */}
        <motion.div style={{ y: ornamentY }} className="mt-10 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-accent/40" />
          <div className="h-1.5 w-1.5 rounded-full bg-accent/50" />
          <div className="h-px w-16 bg-accent/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}
