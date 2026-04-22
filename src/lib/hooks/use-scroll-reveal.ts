'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: threshold })
  return { ref, inView }
}
