import { useMemo, useState } from 'react'
import { Award, ExternalLink, FileBadge2, Search, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CertificateModal } from '@/components/CertificateModal'
import { SectionTitle } from '@/components/SectionTitle'
import { useAwards, useCertificates } from '@/hooks/useContent'
import type { Award as AwardItem, Certificate } from '@/types/content'

type FilterMode = 'all' | 'certificates' | 'awards'

type ArchiveItem =
  | { kind: 'certificate'; item: Certificate; date?: string | null }
  | { kind: 'award'; item: AwardItem; date?: string | null }

function formatDate(value: string | null | undefined, lang: 'en' | 'vi') {
  if (!value) return lang === 'vi' ? 'Chưa cập nhật ngày' : 'Date not added'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function AchievementsPage() {
  const { i18n } = useTranslation()
  const lang: 'en' | 'vi' = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: certificates = [] } = useCertificates()
  const { data: awards = [] } = useAwards()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null)

  const certificateMap = useMemo(() => new Map(certificates.map((item) => [item.id, item])), [certificates])

  const items = useMemo<ArchiveItem[]>(() => {
    const certificateItems: ArchiveItem[] = certificates.map((item) => ({ kind: 'certificate', item, date: item.issueDate }))
    const awardItems: ArchiveItem[] = awards.map((item) => ({ kind: 'award', item, date: item.awardDate }))
    return [...certificateItems, ...awardItems].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [certificates, awards])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((entry) => {
      if (filter === 'certificates' && entry.kind !== 'certificate') return false
      if (filter === 'awards' && entry.kind !== 'award') return false
      if (!q) return true

      if (entry.kind === 'certificate') {
        return [entry.item.title[lang], entry.item.issuer, entry.item.credentialId || ''].join(' ').toLowerCase().includes(q)
      }

      return [entry.item.title[lang], entry.item.issuer || '', entry.item.description?.[lang] || ''].join(' ').toLowerCase().includes(q)
    })
  }, [items, filter, query, lang])

  const openAwardProof = (award: AwardItem) => {
    const related = award.certificateIds.map((id) => certificateMap.get(id)).find(Boolean)
    if (related) setActiveCertificate(related)
  }

  const labels = {
    eyebrow: lang === 'vi' ? 'Thành tích & chứng nhận' : 'Credentials & recognition',
    title: lang === 'vi' ? 'Chứng chỉ · Giải thưởng' : 'Certificates · Awards',
    search: lang === 'vi' ? 'Tìm chứng chỉ, giải thưởng, đơn vị cấp...' : 'Search certificates, awards, issuers...',
    all: lang === 'vi' ? 'Tất cả' : 'All',
    certificates: lang === 'vi' ? 'Chứng chỉ' : 'Certificates',
    awards: lang === 'vi' ? 'Giải thưởng' : 'Awards',
    preview: lang === 'vi' ? 'Xem bằng' : 'Preview',
    verify: lang === 'vi' ? 'Xác minh' : 'Verify',
    related: lang === 'vi' ? 'Chứng chỉ liên quan' : 'Related certificate',
    empty: lang === 'vi' ? 'Không tìm thấy nội dung phù hợp.' : 'No matching credentials found.',
    noProof: lang === 'vi' ? 'Chưa liên kết bằng/chứng chỉ' : 'No proof linked yet',
  }

  return (
    <section className="site-container pb-20 pt-36">
      <SectionTitle eyebrow={labels.eyebrow} title={labels.title} />

      <div className="mb-7 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search size={18} className="text-pink-300" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>

        <div className="glass-panel flex items-center gap-2 rounded-2xl p-2">
          {([
            ['all', labels.all, items.length],
            ['certificates', labels.certificates, certificates.length],
            ['awards', labels.awards, awards.length],
          ] as const).map(([value, label, count]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-xl px-3.5 py-2 text-xs transition ${filter === value ? 'bg-pink-500/15 text-pink-100 shadow-[0_0_20px_rgba(255,79,149,.08)]' : 'text-white/45 hover:text-white/75'}`}
            >
              {label} <span className="ml-1 text-white/30">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry) => {
            if (entry.kind === 'certificate') {
              const certificate = entry.item
              const hasPreview = Boolean(certificate.imageUrl || certificate.pdfUrl)
              return (
                <article key={`certificate-${certificate.id}`} className="glass-panel group overflow-hidden rounded-2xl border border-white/[.07] transition duration-300 hover:-translate-y-1 hover:border-pink-300/25">
                  <button type="button" onClick={() => setActiveCertificate(certificate)} className="block w-full text-left">
                    <div className="relative aspect-[16/7] overflow-hidden border-b border-white/[.06] bg-black/25">
                      {certificate.imageUrl ? (
                        <img src={certificate.imageUrl} alt={certificate.title[lang]} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(255,79,149,.13),transparent_68%)]">
                          <FileBadge2 size={42} strokeWidth={1.25} className="text-pink-300/75" />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full border border-pink-300/20 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-pink-200 backdrop-blur-md">{labels.certificates}</span>
                    </div>
                    <div className="p-5">
                      <h2 className="font-display text-xl font-semibold text-white transition group-hover:text-pink-100">{certificate.title[lang]}</h2>
                      <p className="mt-2 text-sm text-white/48">{certificate.issuer}</p>
                      <p className="mt-3 text-xs text-white/30">{formatDate(certificate.issueDate, lang)}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 border-t border-white/[.06] px-5 py-3">
                    <button onClick={() => setActiveCertificate(certificate)} className="inline-flex items-center gap-2 text-xs font-medium text-pink-200 transition hover:text-pink-100">
                      <ShieldCheck size={14} /> {hasPreview ? labels.preview : labels.preview}
                    </button>
                    {certificate.credentialUrl && (
                      <a href={certificate.credentialUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 text-xs text-white/42 transition hover:text-pink-200">
                        {labels.verify} <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </article>
              )
            }

            const award = entry.item
            const relatedCertificates = award.certificateIds.map((id) => certificateMap.get(id)).filter(Boolean) as Certificate[]
            const proof = relatedCertificates[0]
            return (
              <article key={`award-${award.id}`} className="glass-panel group rounded-2xl border border-white/[.07] p-5 transition duration-300 hover:-translate-y-1 hover:border-pink-300/25">
                <button type="button" onClick={() => openAwardProof(award)} disabled={!proof} className="w-full text-left disabled:cursor-default">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-pink-300/15 bg-pink-500/[.06] text-pink-300 shadow-[0_0_24px_rgba(255,79,149,.08)]">
                      <Award size={22} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-pink-300/75">{labels.awards}</span>
                      <h2 className="mt-1.5 font-display text-xl font-semibold text-white transition group-hover:text-pink-100">{award.title[lang]}</h2>
                      {award.issuer && <p className="mt-2 text-sm text-white/48">{award.issuer}</p>}
                    </div>
                  </div>
                  {award.description?.[lang] && <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/45">{award.description[lang]}</p>}
                  <div className="mt-5 flex items-center justify-between border-t border-white/[.06] pt-3 text-xs">
                    <span className="text-white/30">{formatDate(award.awardDate, lang)}</span>
                    <span className={proof ? 'text-pink-200' : 'text-white/25'}>{proof ? `${labels.related} · ${relatedCertificates.length}` : labels.noProof}</span>
                  </div>
                </button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl py-20 text-center text-white/45">{labels.empty}</div>
      )}

      <CertificateModal certificate={activeCertificate} onClose={() => setActiveCertificate(null)} />
    </section>
  )
}
