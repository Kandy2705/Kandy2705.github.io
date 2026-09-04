import { motion } from 'framer-motion'
import { MnMonogram } from '@/components/MnMonogram'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#070609]">
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          filter: [
            'drop-shadow(0 0 6px #ff2f86)',
            'drop-shadow(0 0 28px #ff2f86)',
            'drop-shadow(0 0 6px #ff2f86)',
          ],
        }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className="h-24 w-24"
      >
        <MnMonogram className="h-full w-full" />
      </motion.div>
    </div>
  )
}
