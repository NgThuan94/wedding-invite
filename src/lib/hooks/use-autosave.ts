'use client'

import { useEffect, useRef, useState } from 'react'

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

/**
 * Debounced auto-save hook.
 *
 * Edge cases handled:
 * - Fast typing: debounce resets on each change, only fires after `delay` ms of quiet.
 * - User types during in-flight save: statusRef detects the 'pending' state set by the
 *   new change and prevents the old save from overwriting it with 'saved'.
 * - Network failure: status → 'error', resets to 'idle' after 5s.
 * - Initial mount: effect skips the first run to avoid saving stale server data.
 */
export function useAutoSave<T>(
  value: T,
  saveFn: (value: T) => Promise<{ error?: string }>,
  { delay = 2000 }: { delay?: number } = {}
) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')

  // Mirror status in a ref so async callbacks can read the current value
  // without stale closures. Always update both together.
  const statusRef = useRef<AutoSaveStatus>('idle')

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Keep saveFn always-current without adding it as an effect dependency.
  // This avoids re-running the debounce effect if the caller doesn't memoize saveFn.
  const saveFnRef = useRef(saveFn)
  useEffect(() => {
    saveFnRef.current = saveFn
  })

  function updateStatus(s: AutoSaveStatus) {
    statusRef.current = s
    setStatus(s)
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Cancel pending reset timer (e.g. the "saved → idle" fade)
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateStatus('pending')

    // Cancel previous debounce
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    // Capture value for this closure — the timeout always saves the latest state
    // because the effect re-runs on every value change and re-captures it.
    const capturedValue = value

    debounceTimerRef.current = setTimeout(async () => {
      updateStatus('saving')

      let result: { error?: string }
      try {
        result = await saveFnRef.current(capturedValue)
      } catch {
        result = { error: 'Network error' }
      }

      // If user typed during the save, status is now 'pending' (set by the new
      // effect run triggered by the new value). Don't overwrite it.
      if (statusRef.current !== 'saving') return

      if (result.error) {
        updateStatus('error')
        resetTimerRef.current = setTimeout(() => {
          if (statusRef.current === 'error') updateStatus('idle')
        }, 5000)
      } else {
        updateStatus('saved')
        resetTimerRef.current = setTimeout(() => {
          if (statusRef.current === 'saved') updateStatus('idle')
        }, 3000)
      }
    }, delay)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [value, delay])

  return { status }
}
