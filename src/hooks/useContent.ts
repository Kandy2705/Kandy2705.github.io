import { useQuery } from '@tanstack/react-query'
import {
  getAwards,
  getBlogPosts,
  getCertificates,
  getEducation,
  getExperiences,
  getLanguages,
  getProjects,
  getResearch,
  getSiteProfile,
  getSkills,
} from '@/services/contentService'

export const useProjects = () => useQuery({ queryKey: ['projects'], queryFn: getProjects })
export const useBlogPosts = () => useQuery({ queryKey: ['blog-posts'], queryFn: getBlogPosts })
export const useExperiences = () => useQuery({ queryKey: ['experiences'], queryFn: getExperiences })
export const useEducation = () => useQuery({ queryKey: ['education'], queryFn: getEducation })
export const useSkills = () => useQuery({ queryKey: ['skills'], queryFn: getSkills })
export const useCertificates = () => useQuery({ queryKey: ['certificates'], queryFn: getCertificates })
export const useAwards = () => useQuery({ queryKey: ['awards'], queryFn: getAwards })
export const useResearch = () => useQuery({ queryKey: ['research'], queryFn: getResearch })
export const useLanguages = () => useQuery({ queryKey: ['languages'], queryFn: getLanguages })
export const useSiteProfile = () => useQuery({ queryKey: ['site-profile'], queryFn: getSiteProfile })
