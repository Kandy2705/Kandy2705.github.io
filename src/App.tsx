import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingScreen } from '@/components/LoadingScreen'
import { SpotlightCursor } from '@/components/SpotlightCursor'
import { AdminAwardsPage } from '@/features/admin/AdminAwardsPage'
import { AdminBlogPage } from '@/features/admin/AdminBlogPage'
import { AdminDashboard } from '@/features/admin/AdminDashboard'
import { AdminGuard } from '@/features/admin/AdminGuard'
import { AdminLayout } from '@/features/admin/AdminLayout'
import { AdminMediaPage } from '@/features/admin/AdminMediaPage'
import { AdminMessagesPage } from '@/features/admin/AdminMessagesPage'
import { AdminProfilePage } from '@/features/admin/AdminProfilePage'
import { AdminProjectsPage } from '@/features/admin/AdminProjectsPage'
import { AdminSettingsPage } from '@/features/admin/AdminSettingsPage'
import {
  AdminCertificatesPage,
  AdminEducationPage,
  AdminExperiencePage,
  AdminLanguagesPage,
  AdminResearchPage,
  AdminSkillsPage,
} from '@/features/admin/AdminSimplePages'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AboutPage } from '@/pages/AboutPage'
import { BlogDetailPage } from '@/pages/BlogDetailPage'
import { BlogPage } from '@/pages/BlogPage'
import { EducationPage } from '@/pages/EducationPage'
import { ExperiencePage } from '@/pages/ExperiencePage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { ProjectsPage } from '@/pages/ProjectsPage'

export default function App() {
  const [booting, setBooting] = useState(true)
  useEffect(() => {
    const id = window.setTimeout(() => setBooting(false), 650)
    return () => window.clearTimeout(id)
  }, [])

  if (booting) return <LoadingScreen />

  return (
    <>
      <SpotlightCursor />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:slug" element={<ProjectDetailPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="blog" element={<AdminBlogPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="experience" element={<AdminExperiencePage />} />
          <Route path="education" element={<AdminEducationPage />} />
          <Route path="skills" element={<AdminSkillsPage />} />
          <Route path="certificates" element={<AdminCertificatesPage />} />
          <Route path="awards" element={<AdminAwardsPage />} />
          <Route path="research" element={<AdminResearchPage />} />
          <Route path="languages" element={<AdminLanguagesPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  )
}
