import imageCompression from 'browser-image-compression'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5

export function validateImage(
  file: File,
  maxSizeMB = MAX_SIZE_MB
): { ok: true } | { ok: false; error: string } {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Chỉ chấp nhận JPG, PNG, WEBP' }
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { ok: false, error: `Ảnh không được vượt quá ${maxSizeMB}MB` }
  }
  return { ok: true }
}

type CompressPreset = 'cover' | 'gallery' | 'portrait'

const PRESETS: Record<CompressPreset, { maxSizeMB: number; maxWidthOrHeight: number }> = {
  cover:    { maxSizeMB: 1,   maxWidthOrHeight: 1920 },
  gallery:  { maxSizeMB: 0.8, maxWidthOrHeight: 1200 },
  portrait: { maxSizeMB: 0.5, maxWidthOrHeight: 800  },
}

export async function compressImage(file: File, preset: CompressPreset): Promise<File> {
  const options = {
    ...PRESETS[preset],
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
    initialQuality: 0.85,
  }
  const compressed = await imageCompression(file, options)
  // imageCompression may return Blob — wrap in File to keep filename
  return new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
  })
}

// Extract storage path from a Supabase public URL
// e.g. https://xxx.supabase.co/storage/v1/object/public/Wedding/uid/inv/cover-123.jpg
// → uid/inv/cover-123.jpg
export function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}
