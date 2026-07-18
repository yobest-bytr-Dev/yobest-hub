import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, Images } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toDirectImageUrl } from '@/lib/drive-upload'

interface GalleryProps {
  images: string[]
  alt?: string
}

function Lightbox({ images, index, alt, onClose, onNavigate }: {
  images: string[]
  index: number
  alt: string
  onClose: () => void
  onNavigate: (i: number) => void
}) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [index])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate(index > 0 ? index - 1 : images.length - 1)
      if (e.key === 'ArrowRight') onNavigate(index < images.length - 1 ? index + 1 : 0)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [index, images.length, onClose, onNavigate])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
        <X size={20} />
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium">
        {index + 1} / {images.length}
      </div>

      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onNavigate(index > 0 ? index - 1 : images.length - 1) }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNavigate(index < images.length - 1 ? index + 1 : 0) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors">
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <motion.div
        key={index}
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <img
          src={toDirectImageUrl(images[index])}
          alt={`${alt} ${index + 1}`}
          className={cn('max-w-[90vw] max-h-[85vh] object-contain rounded-lg transition-opacity duration-200', loaded ? 'opacity-100' : 'opacity-0')}
          onLoad={() => setLoaded(true)}
          draggable={false}
        />
      </motion.div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm max-w-[90vw] overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); onNavigate(i) }}
              className={cn(
                'w-12 h-9 rounded-md overflow-hidden shrink-0 border-2 transition-all',
                i === index ? 'border-white shadow-lg shadow-white/20 scale-110' : 'border-transparent opacity-50 hover:opacity-80'
              )}>
              <img src={toDirectImageUrl(img)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function Gallery({ images, alt = 'Gallery image' }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleNavigate = useCallback((i: number) => {
    setActiveIndex(i)
    setLightboxIndex(i)
  }, [])

  if (!images || images.length === 0) return null

  const displayCount = Math.min(images.length, 6)
  const remaining = images.length - displayCount

  return (
    <>
      <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <Images size={14} className="text-accent-blue" />
          <h3 className="text-xs font-semibold text-text-primary">Gallery</h3>
          <span className="text-[10px] text-text-muted">({images.length})</span>
        </div>

        <div className="px-4 pb-4 space-y-3">
          <button onClick={() => setLightboxIndex(activeIndex)}
            className="relative w-full aspect-video rounded-xl overflow-hidden bg-bg-tertiary border border-border-primary group cursor-pointer block">
            <img src={toDirectImageUrl(images[activeIndex])} alt={alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                <ZoomIn size={14} /> Click to enlarge
              </span>
            </div>
            {images.length > 1 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
                {activeIndex + 1} / {images.length}
              </div>
            )}
          </button>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {images.slice(0, displayCount).map((img, i) => (
                <button key={i} onClick={() => setActiveIndex(i)}
                  className={cn(
                    'relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 block',
                    i === activeIndex
                      ? 'border-accent-blue shadow-md shadow-accent-blue/20 scale-105'
                      : 'border-border-primary hover:border-border-hover opacity-60 hover:opacity-100'
                  )}>
                  <img src={toDirectImageUrl(img)} alt={`${alt} ${i + 1}`}
                    className="w-full h-full object-cover" loading="lazy" />
                  {i === activeIndex && (
                    <div className="absolute inset-0 ring-2 ring-accent-blue/30 rounded-lg" />
                  )}
                </button>
              ))}
              {remaining > 0 && (
                <button onClick={() => setLightboxIndex(displayCount)}
                  className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-bg-elevated border border-border-primary flex items-center justify-center hover:bg-bg-tertiary transition-colors">
                  <span className="text-xs font-bold text-accent-blue">+{remaining}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            index={lightboxIndex}
            alt={alt}
            onClose={() => setLightboxIndex(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </>
  )
}
