import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  awards as fallbackAwards,
  blogPosts as fallbackBlogPosts,
  certificates as fallbackCertificates,
  education as fallbackEducation,
  experiences as fallbackExperiences,
  languages as fallbackLanguages,
  projects as fallbackProjects,
  research as fallbackResearch,
  siteProfile as fallbackSiteProfile,
  skills as fallbackSkills,
} from '@/lib/fallbackData'
import type {
  Award,
  BlogPost,
  Certificate,
  Education,
  EducationScoreDisplay,
  Experience,
  LanguageItem,
  Project,
  ResearchItem,
  SiteProfile,
  Skill,
  SkillCategory,
} from '@/types/content'

const localized = (en?: string | null, vi?: string | null) => ({ en: en || '', vi: vi || en || '' })

const mapProject = (row: any): Project => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: localized(row.excerpt_en, row.excerpt_vi),
  content: localized(row.content_en, row.content_vi),
  categories: row.categories || [],
  technologies: row.technologies || [],
  role: localized(row.role_en, row.role_vi),
  startDate: row.start_date,
  endDate: row.end_date,
  teamSize: row.team_size,
  status: localized(row.status_en, row.status_vi),
  githubUrl: row.github_url,
  demoUrl: row.demo_url,
  appStoreUrl: row.app_store_url,
  playStoreUrl: row.play_store_url,
  videoUrl: row.video_url,
  coverImageUrl: row.cover_image_url,
  galleryUrls: row.gallery_urls || [],
  featured: Boolean(row.featured),
  views: Number(row.views || 0),
})

const mapBlog = (row: any): BlogPost => ({
  id: row.id,
  slug: row.slug,
  title: localized(row.title_en, row.title_vi),
  excerpt: localized(row.excerpt_en, row.excerpt_vi),
  content: localized(row.content_en, row.content_vi),
  tags: row.tags || [],
  coverImageUrl: row.cover_image_url,
  galleryUrls: row.gallery_urls || [],
  videoUrls: row.video_urls || [],
  featured: Boolean(row.featured),
  publishedAt: row.published_at,
  views: Number(row.views || 0),
})

const mapExperience = (row: any): Experience => ({
  id: row.id,
  company: row.company,
  position: localized(row.position_en, row.position_vi),
  location: row.location || '',
  startDate: row.start_date,
  endDate: row.end_date,
  current: Boolean(row.current),
  description: localized(row.description_en, row.description_vi),
  responsibilities: (row.responsibilities || []).map((x: any) => localized(x.en, x.vi)),
  technologies: row.technologies || [],
  logoUrl: row.logo_url,
  companyUrl: row.company_url,
})

const mapEducation = (row: any): Education => ({
  id: row.id,
  institution: row.institution,
  degree: localized(row.degree_en, row.degree_vi),
  field: localized(row.field_en, row.field_vi),
  startDate: row.start_date,
  endDate: row.end_date,
  current: Boolean(row.current),
  gpa: row.gpa,
  gpa4: row.gpa_4 == null ? null : Number(row.gpa_4),
  score10: row.score_10 == null ? null : Number(row.score_10),
  scoreDisplay: (row.score_display || 'both') as EducationScoreDisplay,
  description: row.description_en || row.description_vi ? localized(row.description_en, row.description_vi) : null,
  thesis: row.thesis_en || row.thesis_vi ? localized(row.thesis_en, row.thesis_vi) : null,
  logoUrl: row.logo_url,
})

const mapCertificate = (row: any): Certificate => ({
  id: row.id,
  title: localized(row.title_en, row.title_vi),
  issuer: row.issuer,
  issueDate: row.issue_date,
  credentialId: row.credential_id,
  credentialUrl: row.credential_url,
  imageUrl: row.image_url,
  pdfUrl: row.pdf_url,
})

const mapAward = (row: any): Award => ({
  id: row.id,
  title: localized(row.title_en, row.title_vi),
  issuer: row.issuer,
  awardDate: row.award_date,
  description: row.description_en || row.description_vi ? localized(row.description_en, row.description_vi) : null,
  proofImageUrls: row.proof_image_urls || [],
  certificateIds: [],
})

const mapResearch = (row: any): ResearchItem => ({
  id: row.id,
  title: localized(row.title_en, row.title_vi),
  venue: row.venue,
  status: row.status_en || row.status_vi ? localized(row.status_en, row.status_vi) : null,
  description: row.description_en || row.description_vi ? localized(row.description_en, row.description_vi) : null,
  projectId: row.project_id,
  url: row.url,
})

const mapLanguage = (row: any): LanguageItem => ({
  id: row.id,
  name: localized(row.name_en, row.name_vi),
  level: localized(row.level_en, row.level_vi),
})

function shouldCountView(kind: 'project' | 'blog', slug: string) {
  if (typeof window === 'undefined') return true
  const key = `portfolio:viewed:${kind}:${slug}`
  if (sessionStorage.getItem(key)) return false
  sessionStorage.setItem(key, '1')
  return true
}

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured) return fallbackProjects
  const { data, error } = await supabase.from('projects').select('*').order('featured', { ascending: false }).order('start_date', { ascending: false })
  if (error) return fallbackProjects
  return (data || []).map(mapProject)
}

export async function getProject(slug: string): Promise<Project | undefined> {
  if (!isSupabaseConfigured) return fallbackProjects.find((x) => x.slug === slug)
  const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).maybeSingle()
  if (error || !data) return fallbackProjects.find((x) => x.slug === slug)
  return mapProject(data)
}

export async function incrementProjectView(slug: string) {
  if (!isSupabaseConfigured || !shouldCountView('project', slug)) return
  await supabase.rpc('increment_project_view', { p_slug: slug })
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return fallbackBlogPosts
  const { data, error } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false })
  if (error) return fallbackBlogPosts
  return (data || []).map(mapBlog)
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  if (!isSupabaseConfigured) return fallbackBlogPosts.find((x) => x.slug === slug)
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle()
  if (error || !data) return fallbackBlogPosts.find((x) => x.slug === slug)
  return mapBlog(data)
}

export async function incrementBlogView(slug: string) {
  if (!isSupabaseConfigured || !shouldCountView('blog', slug)) return
  await supabase.rpc('increment_blog_view', { p_slug: slug })
}

export async function getExperiences(): Promise<Experience[]> {
  if (!isSupabaseConfigured) return fallbackExperiences
  const { data, error } = await supabase.from('experiences').select('*').order('start_date', { ascending: false })
  if (error) return fallbackExperiences
  return (data || []).map(mapExperience)
}

export async function getEducation(): Promise<Education[]> {
  if (!isSupabaseConfigured) return fallbackEducation
  const { data, error } = await supabase.from('education').select('*').order('start_date', { ascending: false })
  if (error) return fallbackEducation
  return (data || []).map(mapEducation)
}

export async function getSkills(): Promise<Skill[]> {
  if (!isSupabaseConfigured) return fallbackSkills
  const { data, error } = await supabase.from('skills').select('*').order('sort_order')
  if (error) return fallbackSkills
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category as SkillCategory,
    description: localized(row.description_en, row.description_vi),
    iconKey: row.icon_key,
    sortOrder: row.sort_order || 0,
  }))
}

export async function getCertificates(): Promise<Certificate[]> {
  if (!isSupabaseConfigured) return fallbackCertificates
  const { data, error } = await supabase.from('certificates').select('*').order('issue_date', { ascending: false })
  if (error) return fallbackCertificates
  return (data || []).map(mapCertificate)
}

export async function getAwards(): Promise<Award[]> {
  if (!isSupabaseConfigured) return fallbackAwards
  const { data, error } = await supabase.from('awards').select('*').order('award_date', { ascending: false })
  if (error) return fallbackAwards
  return (data || []).map(mapAward)
}

export async function getResearch(): Promise<ResearchItem[]> {
  if (!isSupabaseConfigured) return fallbackResearch
  const { data, error } = await supabase.from('research').select('*').order('created_at', { ascending: false })
  if (error) return fallbackResearch
  return (data || []).map(mapResearch)
}

export async function getLanguages(): Promise<LanguageItem[]> {
  if (!isSupabaseConfigured) return fallbackLanguages
  const { data, error } = await supabase.from('languages').select('*').order('sort_order')
  if (error) return fallbackLanguages
  return (data || []).map(mapLanguage)
}

export async function getSiteProfile(): Promise<SiteProfile> {
  if (!isSupabaseConfigured) return fallbackSiteProfile
  const { data, error } = await supabase.from('site_profile').select('*').eq('key', 'main').maybeSingle()
  if (error || !data) return fallbackSiteProfile
  return {
    brand: data.brand || fallbackSiteProfile.brand,
    fullName: data.full_name || fallbackSiteProfile.fullName,
    role: localized(data.role_en, data.role_vi),
    tagline: localized(data.tagline_en, data.tagline_vi),
    about: localized(data.about_en, data.about_vi),
    city: localized(data.city_en, data.city_vi),
    email: data.email || fallbackSiteProfile.email,
    phone: data.phone || fallbackSiteProfile.phone,
    github: data.github || fallbackSiteProfile.github,
    linkedin: data.linkedin || fallbackSiteProfile.linkedin,
    facebook: data.facebook || fallbackSiteProfile.facebook,
    tiktokUrl: data.tiktok_url || fallbackSiteProfile.tiktokUrl,
    tiktokFollowers: data.tiktok_followers == null ? fallbackSiteProfile.tiktokFollowers : Number(data.tiktok_followers),
    profileImageUrl: data.profile_image_url || fallbackSiteProfile.profileImageUrl,
    cvEnUrl: data.cv_en_url || fallbackSiteProfile.cvEnUrl,
    cvViUrl: data.cv_vi_url || fallbackSiteProfile.cvViUrl,
    cvWebViUrl: data.cv_web_vi_url || fallbackSiteProfile.cvWebViUrl,
  }
}
