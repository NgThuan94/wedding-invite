import type { Tables } from '@/types/database'

export interface TemplateProps {
  inv: Tables<'invitations'>
  timeline: Tables<'love_timeline'>[]
  party: Tables<'wedding_party'>[]
  galleryImages: string[]
  isOwnerPreview: boolean
}
