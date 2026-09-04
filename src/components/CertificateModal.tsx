import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, FileText, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Certificate } from '@/types/content'

export function CertificateModal({ certificate, onClose }: { certificate: Certificate | null; onClose: () => void }) {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('vi') ? 'vi' : 'en'

  return (
    <AnimatePresence>
      {certificate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4 backdrop-blur-md" onClick={onClose}>
          <motion.div initial={{ opacity: 0, y: 20, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .98 }} onClick={(e) => e.stopPropagation()} className="glass-panel w-full max-w-3xl rounded-3xl p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[.2em] text-pink-300">Certificate</div>
                <h3 className="mt-2 font-display text-3xl font-semibold">{certificate.title[lang]}</h3>
                <p className="mt-1 text-sm text-white/50">{certificate.issuer}</p>
              </div>
              <button onClick={onClose} className="outline-button grid h-10 w-10 place-items-center rounded-xl"><X size={18} /></button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-black/30">
              {certificate.imageUrl ? (
                <img src={certificate.imageUrl} alt={certificate.title[lang]} className="max-h-[55vh] w-full object-contain" />
              ) : (
                <div className="grid min-h-64 place-items-center text-center text-white/35">
                  <div><FileText className="mx-auto mb-3 text-pink-300/70" size={40} /><p>Upload an image or PDF from Admin → Certificates.</p></div>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {certificate.pdfUrl && <a href={certificate.pdfUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"><FileText size={16} /> Open PDF</a>}
              {certificate.credentialUrl && <a href={certificate.credentialUrl} target="_blank" rel="noreferrer" className="outline-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"><ExternalLink size={16} /> Verify credential</a>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
