import { useEffect, useRef } from 'react'

interface AdBannerProps {
  type: 'leaderboard' | 'rectangle' | 'skyscraper' | 'fluid'
  className?: string
}

const adConfigs = {
  leaderboard: { key: '03bb7248133bb3a6051079a489c2b464', width: 728, height: 90 },
  rectangle: { key: 'fcbe792021876383cda761cbb6152f90', width: 300, height: 250 },
  skyscraper: { key: '3b4b0c960769f62764de9a49f5dad9d9', width: 160, height: 300 },
  fluid: { key: 'f59c7c8a65b0ee7556470ad303ff2491', width: '100%', height: 'auto' },
}

function AdUnit({ config, type }: { config: { key: string; width: number | string; height: number | string }; type: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const existingScripts = container.querySelectorAll('script')
    existingScripts.forEach(s => s.remove())

    if (type === 'fluid') {
      const div = document.createElement('div')
      div.id = `container-${config.key}`
      container.appendChild(div)

      const s = document.createElement('script')
      s.async = true
      s.setAttribute('data-cfasync', 'false')
      s.src = `https://pl28924845.effectivecpmnetwork.com/${config.key}/invoke.js`
      container.appendChild(s)
    } else {
      const w = typeof config.width === 'number' ? config.width : 300
      const h = typeof config.height === 'number' ? config.height : 250

      const atScript = document.createElement('script')
      atScript.textContent = `var atOptions={key:'${config.key}',format:'iframe',height:${h},width:${w},params:{}};`
      container.appendChild(atScript)

      const invokeScript = document.createElement('script')
      invokeScript.src = `https://www.highperformanceformat.com/${config.key}/invoke.js`
      container.appendChild(invokeScript)
    }

    return () => {
      while (container.firstChild) container.removeChild(container.firstChild)
    }
  }, [config.key, config.width, config.height, type])

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
