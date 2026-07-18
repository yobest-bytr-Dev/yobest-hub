import { useEffect, useRef } from 'react'

interface AdBannerProps {
  type: 'leaderboard' | 'rectangle' | 'skyscraper' | 'fluid'
  className?: string
}

const adConfigs = {
  leaderboard: { zone: '11344301', width: 728, height: 90 },
  rectangle: { zone: '11344299', width: 300, height: 250 },
  skyscraper: { zone: '11344310', width: 160, height: 300 },
  fluid: { zone: '11344299', width: '100%', height: 'auto' },
}

function AdUnit({ config, type }: { config: { zone: string; width: number | string; height: number | string }; type: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    while (container.firstChild) container.removeChild(container.firstChild)

    const s = document.createElement('script')
    s.dataset.zone = config.zone
    s.src = 'https://nap5k.com/tag.min.js'
    container.appendChild(s)

    return () => {
      while (container.firstChild) container.removeChild(container.firstChild)
    }
  }, [config.zone])

  const h = typeof config.height === 'number' ? config.height : 300

  if (type === 'fluid') {
    return <div ref={containerRef} style={{ minHeight: 100 }} />
  }

  return (
    <div ref={containerRef} style={{ width: typeof config.width === 'number' ? config.width : '100%', height: h, overflow: 'hidden' }} />
  )
}

export default function AdBanner({ type, className = '' }: AdBannerProps) {
  const config = adConfigs[type]

  if (type === 'skyscraper') {
    return (
      <div className={`flex justify-center ${className}`} style={{ width: 160, minHeight: 300 }}>
        <AdUnit config={config} type={type} />
      </div>
    )
  }

  if (type === 'leaderboard') {
    return (
      <div className={`flex justify-center overflow-hidden max-w-full ${className}`} style={{ width: 728, minHeight: 90 }}>
        <AdUnit config={config} type={type} />
      </div>
    )
  }

  if (type === 'rectangle') {
    return (
      <div className={`flex justify-center overflow-hidden max-w-full ${className}`} style={{ width: 300, minHeight: 250 }}>
        <AdUnit config={config} type={type} />
      </div>
    )
  }

  return (
    <div className={className} style={{ minHeight: 100 }}>
      <AdUnit config={config} type={type} />
    </div>
  )
}
