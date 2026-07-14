import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  maxWidth?: string
}

export default function Modal({ open, onClose, title, children, className, maxWidth = 'max-w-2xl' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            className={cn(
              'relative w-full rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl',
              maxWidth,
              className
            )}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
