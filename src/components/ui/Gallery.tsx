import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, Images, Download, RotateCcw } from 'lucide-react'
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
  const [zoomed, setZoomed] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const dragX = useMotionValue(0)
  const dragOpacity = useTransform(dragX, [-200, 0, 200], [0.4, 1, 0.4])

  useEffect(() => { setLoaded(false); setZoomed(false) }, [index])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate(index > 0 ? index - 1 : images.length - 1)
      if (e.key === 'ArrowRight') onNavigate(index < images.length - 1 ? index + 1 : 0)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = '' }
  }, [index, images.length, onClose, onNavigate])

  useEffect(() => {
    if (index > 0) { const img = new window.Image(); img.src = toDirectImageUrl(images[index - 1]) }
    if (index < images.length - 1) { const img = new window.Image(); img.src = toDirectImageUrl(images[index + 1]) }
  }, [index, images])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) onNavigate(index > 0 ? index - 1 : images.length - 1)
      else onNavigate(index < images.length - 1 ? index + 1 : 0)
    }
  }

  const handleDoubleClick = () => setZoomed(!zoomed)

  const handleDownload = async () => {
    try {
      const res = await fetch(toDirectImageUrl(images[index]))
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${alt}-${index + 1}.png`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    } catch { window.open(toDirectImageUrl(images[index]), '_blank') }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,20,0.92) 0%, rgba(0,0,0,0.97) 100%)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-blue/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-purple/5 rounded-full blur-[120px]" />
      </div>

      <button onClick={onClose}
        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/8 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200">
        <X size={18} />
      </button>

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <div className="px-4 py-1.5 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-white/80 text-xs font-medium tracking-wide">
          <span className="text-white font-bold">{index + 1}</span>
          <span className="mx-1.5 text-white/30">/</span>
          <span>{images.length}</span>
        </div>
      </div>

      <div className="absolute top-5 left-5 z-10 flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); handleDownload() }}
          className="w-9 h-9 rounded-full bg-white/8 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all duration-200"
          title="Download">
          <Download size={15} />
        </button>
        {zoomed && (
          <button onClick={(e) => { e.stopPropagation(); setZoomed(false) }}
            className="w-9 h-9 rounded-full bg-white/8 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all duration-200"
            title="Reset zoom">
            <RotateCcw size={15} />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onNavigate(index > 0 ? index - 1 : images.length - 1) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-2xl bg-white/6 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/12 hover:border-white/20 transition-all duration-200 group">
            <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNavigate(index < images.length - 1 ? index + 1 : 0) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-2xl bg-white/6 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/12 hover:border-white/20 transition-all duration-200 group">
            <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      <motion.div
        key={index}
        className={cn(
          'relative flex items-center justify-center select-none',
          zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        )}
        style={{ x: dragX, opacity: dragOpacity }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => { e.stopPropagation(); handleDoubleClick() }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        drag={images.length > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x > 80) onNavigate(index > 0 ? index - 1 : images.length - 1)
          else if (info.offset.x < -80) onNavigate(index < images.length - 1 ? index + 1 : 0)
        }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-10 h-10 border-[3px] border-white/10 border-t-accent-blue rounded-full animate-spin" />
              <div className="absolute inset-0 w-10 h-10 border-[3px] border-transparent border-b-accent-purple rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
          </div>
        )}
        <motion.img
          src={toDirectImageUrl(images[index])}
          alt={`${alt} ${index + 1}`}
          className={cn(
            'max-w-[88vw] max-h-[82vh] object-contain rounded-xl transition-all duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            zoomed ? 'scale-150' : 'scale-100'
          )}
          onLoad={() => setLoaded(true)}
          draggable={false}
        />
      </motion.div>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/6 backdrop-blur-xl border border-white/10 max-w-[92vw] overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); onNavigate(i) }}
              className={cn(
                'relative shrink-0 rounded-lg overflow-hidden transition-all duration-300',
                i === index
                  ? 'w-14 h-10 ring-2 ring-accent-blue shadow-lg shadow-accent-blue/30 scale-110'
                  : 'w-11 h-8 opacity-40 hover:opacity-70 hover:scale-105'
              )}>
              <img src={toDirectImageUrl(img)} alt="" className="w-full h-full object-cover" />
              {i === index && (
                <motion.div layoutId="thumb-highlight"
                  className="absolute inset-0 rounded-lg ring-2 ring-accent-blue/50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="absolute bottom-6 right-6 z-10 hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/6 backdrop-blur-md border border-white/10 text-white/30 text-[10px] font-medium">
        <span className="text-white/50">←→</span> navigate
        <span className="mx-1 text-white/15">·</span>
        <span className="text-white/50">Esc</span> close
      </div>
    </motion.div>
  )
}

export default function Gallery({ images, alt = 'Gallery image' }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const handleNavigate = useCallback((i: number) => {
    setActiveIndex(i)
    setLightboxIndex(i)
  }, [])

  if (!images || images.length === 0) return null

  return (
    <>
      <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden group/gallery">
        <div className="px-5 pt-4 pb-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-blue/15 flex items-center justify-center">
            <Images size={12} className="text-accent-blue" />
          </div>
          <h3 className="text-xs font-semibold text-text-primary">Gallery</h3>
          <span className="text-[10px] text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full">{images.length}</span>
        </div>

        <div className="px-4 pb-4 space-y-3">
          <button onClick={() => setLightboxIndex(activeIndex)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative w-full aspect-video rounded-xl overflow-hidden bg-bg-tertiary border border-border-primary group/main cursor-pointer block">
            <AnimatePresence mode="wait">
              <motion.img key={activeIndex}
                src={toDirectImageUrl(images[activeIndex])} alt={alt}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

            <motion.div className="absolute inset-0 flex items-center justify-center"
              initial={false} animate={{ opacity: isHovering ? 1 : 0 }}
              transition={{ duration: 0.2 }}>
              <div className="px-5 py-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium flex items-center gap-2">
                <ZoomIn size={14} /> Click to view fullsize
              </div>
            </motion.div>

            {images.length > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <div className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium">
                  {activeIndex + 1}<span className="text-white/40 mx-0.5">/</span>{images.length}
                </div>
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                    className={cn(
                      'transition-all duration-300 rounded-full',
                      i === activeIndex ? 'w-6 h-1.5 bg-accent-blue' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                    )} />
                ))}
              </div>
            )}
          </button>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveIndex(i)}
                  className={cn(
                    'relative shrink-0 w-[76px] h-[54px] rounded-xl overflow-hidden transition-all duration-300 block',
                    i === activeIndex
                      ? 'ring-2 ring-accent-blue shadow-lg shadow-accent-blue/20 scale-105 z-10'
                      : 'border border-border-primary opacity-50 hover:opacity-85 hover:border-border-hover hover:scale-102'
                  )}>
                  <img src={toDirectImageUrl(img)} alt={`${alt} ${i + 1}`}
                    className="w-full h-full object-cover" loading="lazy" />
                  {i === activeIndex && (
                    <motion.div layoutId="gallery-active-border"
                      className="absolute inset-0 rounded-xl ring-2 ring-accent-blue/40"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <div className="absolute bottom-0.5 right-0.5 px-1 py-px rounded bg-black/50 text-[8px] text-white/60 font-medium backdrop-blur-sm">
                    {i + 1}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox images={images} index={lightboxIndex} alt={alt}
            onClose={() => setLightboxIndex(null)} onNavigate={handleNavigate} />
        )}
      </AnimatePresence>
    </>
  )
}
