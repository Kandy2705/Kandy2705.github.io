import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, ChevronLeft, ChevronRight, ExternalLink, FileBadge2, Images, Search, ShieldCheck, X } from 'lucide-react'
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
  return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' }).format(date)
}

export function AchievementsPage() {
  const { i18n } = useTranslation()
  const lang: 'en' | 'vi' = i18n.language.startsWith('vi') ? 'vi' : 'en'
  const { data: certificates = [] } = useCertificates()
  const { data: awards = [] } = useAwards()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null)
  const [activeAward, setActiveAward] = useState<AwardItem | null>(null)
  const [activeProofIndex, setActiveProofIndex] = useState(0)

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
      if (entry.kind === 'certificate') return [entry.item.title[lang], entry.item.issuer, entry.item.credentialId || ''].join(' ').toLowerCase().includes(q)
      return [entry.item.title[lang], entry.item.issuer || '', entry.item.description?.[lang] || ''].join(' ').toLowerCase().includes(q)
    })
  }, [items, filter, query, lang])

  const labels = {
    eyebrow: lang === 'vi' ? 'Thành tích & chứng nhận' : 'Credentials & recognition',
    title: lang === 'vi' ? 'Chứng chỉ · Giải thưởng' : 'Certificates · Awards',
    search: lang === 'vi' ? 'Tìm chứng chỉ, giải thưởng, đơn vị cấp...' : 'Search certificates, awards, issuers...',
    all: lang === 'vi' ? 'Tất cả' : 'All',
    certificates: lang === 'vi' ? 'Chứng chỉ' : 'Certificates',
    awards: lang === 'vi' ? 'Giải thưởng' : 'Awards',
    preview: lang === 'vi' ? 'Xem bằng' : 'Preview',
    verify: lang === 'vi' ? 'Xác minh' : 'Verify',
    proof: lang === 'vi' ? 'Xem minh chứng' : 'View proof',
    noProof: lang === 'vi' ? 'Chưa có minh chứng' : 'No proof added yet',
    empty: lang === 'vi' ? 'Không tìm thấy nội dung phù hợp.' : 'No matching credentials found.',
  }

  const openAward = (award: AwardItem) => {
    if (!award.proofImageUrls?.length) return
    setActiveProofIndex(0)
    setActiveAward(award)
  }

  const moveProof = (direction: -1 | 1) => {
    if (!activeAward?.proofImageUrls?.length) return
    setActiveProofIndex((current) => (current + direction + activeAward.proofImageUrls!.length) % activeAward.proofImageUrls!.length)
  }

  return (
    <section className="site-container pb-20 pt-36">
      <SectionTitle eyebrow={labels.eyebrow} title={labels.title} />

      <div className="mb-7 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search size={18} className="text-pink-300" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
        </div>
        <div className="glass-panel flex items-center gap-2 rounded-2xl p-2">
          {([
            ['all', labels.all, items.length],
            ['certificates', labels.certificates, certificates.length],
            ['awards', labels.awards, awards.length],
          ] as const).map(([value, label, count]) => (
            <button key={value} onClick={() => setFilter(value)} className={`rounded-xl px-3.5 py-2 text-xs transition ${filter === value ? 'bg-pink-500/15 text-pink-100 shadow-[0_0_20px_rgba(255,79,149,.08)]' : 'text-white/45 hover:text-white/75'}`}>
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
              return (
                <article key={`certificate-${certificate.id}`} className="glass-panel group overflow-hidden rounded-2xl border border-white/[.07] transition duration-300 hover:-translate-y-1 hover:border-pink-300/25">
                  <button type="button" onClick={() => setActiveCertificate(certificate)} className="block w-full text-left">
                    <div className="relative aspect-[16/7] overflow-hidden border-b border-white/[.06] bg-black/25">
                      {certificate.imageUrl ? <img src={certificate.imageUrl} alt={certificate.title[lang]} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(255,79,149,.13),transparent_68%)]"><FileBadge2 size={42} strokeWidth={1.25} className="text-pink-300/75" /></div>}
                      <span className="absolute left-3 top-3 rounded-full border border-pink-300/20 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-pink-200 backdrop-blur-md">{labels.certificates}</span>
                    </div>
                    <div className="p-5"><h2 className="font-display text-xl font-semibold text-white transition group-hover:text-pink-100">{certificate.title[lang]}</h2><p className="mt-2 text-sm text-white/48">{certificate.issuer}</p><p className="mt-3 text-xs text-white/30">{formatDate(certificate.issueDate, lang)}</p></div>
                  </button>
                  <div className="flex items-center gap-2 border-t border-white/[.06] px-5 py-3">
                    <button onClick={() => setActiveCertificate(certificate)} className="inline-flex items-center gap-2 text-xs font-medium text-pink-200 transition hover:text-pink-100"><ShieldCheck size={14} /> {labels.preview}</button>
                    {certificate.credentialUrl && <a href={certificate.credentialUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 text-xs text-white/42 transition hover:text-pink-200">{labels.verify} <ExternalLink size={13} /></a>}
                  </div>
                </article>
              )
            }

            const award = entry.item
            const proofCount = award.proofImageUrls?.length || 0
            return (
              <article key={`award-${award.id}`} className="glass-panel group overflow-hidden rounded-2xl border border-white/[.07] transition duration-300 hover:-translate-y-1 hover:border-pink-300/25">
                {proofCount > 0 ? (
                  <button type="button" onClick={() => openAward(award)} className="block w-full text-left">
                    <div className="relative aspect-[16/7] overflow-hidden border-b border-white/[.06] bg-black/25">
                      <img src={award.proofImageUrls![0]} alt={award.title[lang]} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                      <span className="absolute left-3 top-3 rounded-full border border-pink-300/20 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-pink-200 backdrop-blur-md">{labels.awards}</span>
                      {proofCount > 1 && <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur-md"><Images size={12} /> {proofCount}</span>}
                    </div>
                    <div className="p-5"><h2 className="font-display text-xl font-semibold text-white transition group-hover:text-pink-100">{award.title[lang]}</h2>{award.issuer && <p className="mt-2 text-sm text-white/48">{award.issuer}</p>}{award.description?.[lang] && <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/40">{award.description[lang]}</p>}<div className="mt-4 flex items-center justify-between text-xs"><span className="text-white/30">{formatDate(award.awardDate, lang)}</span><span className="text-pink-200">{labels.proof}</span></div></div>
                  </button>
                ) : (
                  <div className="p-5">
                    <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-pink-300/15 bg-pink-500/[.06] text-pink-300"><Award size={22} /></span><div><span className="text-[10px] font-semibold uppercase tracking-[.18em] text-pink-300/75">{labels.awards}</span><h2 className="mt-1.5 font-display text-xl font-semibold">{award.title[lang]}</h2>{award.issuer && <p className="mt-2 text-sm text-white/48">{award.issuer}</p>}</div></div>
                    {award.description?.[lang] && <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/45">{award.description[lang]}</p>}
                    <div className="mt-5 flex items-center justify-between border-t border-white/[.06] pt-3 text-xs"><span className="text-white/30">{formatDate(award.awardDate, lang)}</span><span className="text-white/25">{labels.noProof}</span></div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : <div className="glass-panel rounded-3xl py-20 text-center text-white/45">{labels.empty}</div>}

      <CertificateModal certificate={activeCertificate} onClose={() => setActiveCertificate(null)} />

      <AnimatePresence>
        {activeAward?.proofImageUrls?.length ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] grid place-items-center bg-black/80 p-4 backdrop-blur-md" onClick={() => setActiveAward(null)}>
            <motion.div initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .98 }} onClick={(e) => e.stopPropagation()} className="glass-panel w-full max-w-5xl rounded-3xl p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><div className="text-xs uppercase tracking-[.2em] text-pink-300">{labels.awards}</div><h3 className="mt-2 font-display text-3xl font-semibold">{activeAward.title[lang]}</h3><p className="mt-1 text-sm text-white/45">{activeProofIndex + 1} / {activeAward.proofImageUrls.length}</p></div><button onClick={() => setActiveAward(null)} className="outline-button grid h-10 w-10 place-items-center rounded-xl"><X size={18} /></button></div>
              <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/8 bg-black/35">
                <img src={activeAward.proofImageUrls[activeProofIndex]} alt={`${activeAward.title[lang]} proof ${activeProofIndex + 1}`} className="max-h-[65vh] w-full object-contain" />
                {activeAward.proofImageUrls.length > 1 && <><button onClick={() => moveProof(-1)} className="outline-button absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55"><ChevronLeft size={19} /></button><button onClick={() => moveProof(1)} className="outline-button absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55"><ChevronRight size={19} /></button></>}
              </div>
              {activeAward.proofImageUrls.length > 1 && <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{activeAward.proofImageUrls.map((url, index) => <button key={url} onClick={() => setActiveProofIndex(index)} className={`shrink-0 overflow-hidden rounded-xl border ${index === activeProofIndex ? 'border-pink-300/55' : 'border-white/8'}`}><img src={url} alt="" className="h-16 w-24 object-cover" /></button>)}</div>}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
