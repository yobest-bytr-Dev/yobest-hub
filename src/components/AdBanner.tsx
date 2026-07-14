import { useEffect, useRef } from 'react'

interface AdBannerProps {
  type: 'leaderboard' | 'rectangle' | 'skyscraper' | 'fluid'
  className?: string
}

const adConfigs = {
  leaderboard: {
    key: '03bb7248133bb3a6051079a489c2b464',
    width: 728,
    height: 90,
  },
  rectangle: {
    key: 'fcbe792021876383cda761cbb6152f90',
    width: 300,
    height: 250,
  },
  skyscraper: {
    key: '3b4b0c960769f62764de9a49f5dad9d9',
    width: 160,
    height: 300,
  },
  fluid: {
    key: 'f59c7c8a65b0ee7556470ad303ff2491',
    width: '100%',
    height: 'auto',
  },
}

export default function AdBanner({ type, className = '' }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const config = adConfigs[type]

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    // Clean previous content
    container.innerHTML = ''

    if (type === 'fluid') {
      // Fluid ad needs a container div
      const adDiv = document.createElement('div')
      adDiv.id = `container-${config.key}`
      container.appendChild(adDiv)

      const script1 = document.createElement('script')
      script1.async = true
      script1.setAttribute('data-cfasync', 'false')
      script1.src = `https://pl28924845.effectivecpmnetwork.com/${config.key}/invoke.js`
      container.appendChild(script1)
    } else {
      // iframe-based ads
      const scriptContent = `atOptions = { 'key': '${config.key}', 'format': 'iframe', 'height': ${config.height}, 'width': ${typeof config.width === 'number' ? config.width : 300}, 'params': {} };`
      const script1 = document.createElement('script')
      script1.textContent = scriptContent
      container.appendChild(script1)

      const script2 = document.createElement('script')
      script2.src = `https://www.highperformanceformat.com/${config.key}/invoke.js`
      container.appendChild(script2)
    }

    return () => {
      container.innerHTML = ''
    }
  }, [type, config.key])

  if (type === 'skyscraper') {
    return (
      <div ref={containerRef} className={`flex justify-center ${className}`} style={{ width: 160, minHeight: 300 }} />
    )
  }

  if (type === 'leaderboard') {
    return (
      <div ref={containerRef} className={`flex justify-center ${className}`} style={{ width: 728, minHeight: 90 }} />
    )
  }

  if (type === 'rectangle') {
    return (
      <div ref={containerRef} className={`flex justify-center ${className}`} style={{ width: 300, minHeight: 250 }} />
    )
  }

  return (
    <div ref={containerRef} className={className} style={{ minHeight: 100 }} />
  )
}
