import type { ProjectCategory } from '@/types/content'

export const projectCategories: Array<'All' | ProjectCategory> = [
  'All',
  'Web',
  'Mobile App',
  'Game',
  'AR/VR',
  'Research',
  'Other',
]

export const ADMIN_EMAIL = 'man.ngoman2705@gmail.com'
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://kandy2705.github.io'
