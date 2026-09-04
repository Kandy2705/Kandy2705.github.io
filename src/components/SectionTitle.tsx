import { motion } from 'framer-motion'

export function SectionTitle({ eyebrow, title, align = 'center' }: { eyebrow?: string; title: string; align?: 'left' | 'center' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: .55 }}
      className={align === 'center' ? 'mb-10 text-center' : 'mb-8 text-left'}
    >
      {eyebrow && <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-pink-300/80">{eyebrow}</div>}
      <h2 className="font-display text-4xl font-semibold sm:text-5xl">
        <span className="pink-gradient-text">{title}</span>
      </h2>
    </motion.div>
  )
}
