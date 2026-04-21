'use client'

// TODO: cleanup orphaned Storage files (cron job — not in Phần B)

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage, validateImage } from '@/lib/utils/image'

const BUCKET = 'Wedding'

export type UploadType = 'cover' | 'gallery' | 'timeline' | 'party'

const PRESET_MAP = {
  cover:    'cover',
  gallery:  'gallery',
  timeline: 'gallery',
  party:    'portrait',
} as const satisfies Record<UploadType, 'cover' | 'gallery' | 'portrait'>

interface UseStorageUploadOptions {
  userId: string
  invitationId: string
}

export function useStorageUpload({ userId, invitationId }: UseStorageUploadOptions) {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = useCallback(
    async (file: File, type: UploadType): Promise<string> => {
      const validation = validateImage(file, 5)
      if (!validation.ok) throw new Error(validation.error)

      setIsUploading(true)
      setProgress(0)

      try {
        // Stage 1: compression (0 → 30%)
        setProgress(10)
        const preset = PRESET_MAP[type]
        const compressed = await compressImage(file, preset)
        setProgress(30)

        // Stage 2: upload (30 → 100%)
        const ext = 'jpg'
        const path = `${userId}/${invitationId}/${type}-${Date.now()}.${ext}`
        const supabase = createClient()

        // Smooth fake progress from 30 → 90 while upload is in-flight
        let fake = 30
        const ticker = setInterval(() => {
          fake = Math.min(fake + 6, 90)
          setProgress(fake)
        }, 200)

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, compressed, { contentType: 'image/jpeg', upsert: false })

        clearInterval(ticker)

        if (error) throw new Error('Không thể upload, thử lại')

        setProgress(100)

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
        return data.publicUrl
      } finally {
        // Small delay so user sees 100% before resetting
        setTimeout(() => {
          setIsUploading(false)
          setProgress(0)
        }, 600)
      }
    },
    [userId, invitationId]
  )

  return { uploadFile, progress, isUploading }
}
