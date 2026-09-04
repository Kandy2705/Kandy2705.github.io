export type Locale = 'en' | 'vi'

export type ProjectCategory =
  | 'Web'
  | 'Mobile App'
  | 'Game'
  | 'AR/VR'
  | 'Research'
  | 'Other'

export interface LocalizedText {
  en: string
  vi: string
}

export interface Project {
  id: string
  slug: string
  title: string
  excerpt: LocalizedText
  content: LocalizedText
  categories: ProjectCategory[]
  technologies: string[]
  role: LocalizedText
  startDate?: string | null
  endDate?: string | null
  teamSize?: number | null
  status?: LocalizedText
  githubUrl?: string | null
  demoUrl?: string | null
  appStoreUrl?: string | null
  playStoreUrl?: string | null
  videoUrl?: string | null
  coverImageUrl?: string | null
  galleryUrls: string[]
  featured: boolean
  views: number
}

export interface BlogPost {
  id: string
  slug: string
  title: LocalizedText
  excerpt: LocalizedText
  content: LocalizedText
  tags: string[]
  coverImageUrl?: string | null
  galleryUrls: string[]
  videoUrls: string[]
  featured: boolean
  publishedAt: string
  views: number
}

export interface Experience {
  id: string
  company: string
  position: LocalizedText
  location: string
  startDate: string
  endDate?: string | null
  current: boolean
  description: LocalizedText
  responsibilities: LocalizedText[]
  technologies: string[]
  logoUrl?: string | null
  companyUrl?: string | null
}

export type EducationScoreDisplay = 'both' | 'gpa4' | 'score10'

export interface Education {
  id: string
  institution: string
  degree: LocalizedText
  field: LocalizedText
  startDate: string
  endDate?: string | null
  current: boolean
  gpa?: string | null
  gpa4?: number | null
  score10?: number | null
  scoreDisplay?: EducationScoreDisplay
  description?: LocalizedText | null
  thesis?: LocalizedText | null
  logoUrl?: string | null
}

export interface Skill {
  id: string
  name: string
  category: string
  sortOrder: number
}

export interface Certificate {
  id: string
  title: LocalizedText
  issuer: string
  issueDate?: string | null
  credentialId?: string | null
  credentialUrl?: string | null
  imageUrl?: string | null
  pdfUrl?: string | null
}

export interface Award {
  id: string
  title: LocalizedText
  issuer?: string | null
  awardDate?: string | null
  description?: LocalizedText | null
  certificateIds: string[]
}

export interface ResearchItem {
  id: string
  title: LocalizedText
  venue?: string | null
  status?: LocalizedText | null
  description?: LocalizedText | null
  projectId?: string | null
  url?: string | null
}

export interface LanguageItem {
  id: string
  name: LocalizedText
  level: LocalizedText
}

export interface SiteProfile {
  brand: string
  fullName: string
  role: LocalizedText
  tagline: LocalizedText
  about: LocalizedText
  city: LocalizedText
  email: string
  phone: string
  github: string
  linkedin: string
  facebook: string
  profileImageUrl: string
  cvEnUrl: string
  cvViUrl: string
  cvWebViUrl?: string
}
