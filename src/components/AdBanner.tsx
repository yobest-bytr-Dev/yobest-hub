import { useMemo } from 'react'

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

function AdIframe({ config, type }: { config: { key: string; width: number | string; height: number | string }; type: string }) {
  const srcDoc = useMemo(() => {
    if (type === 'fluid') {
      return `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:visible;background:transparent}</style></head><body>
<div id="container-${config.key}"></div>
<script>var atOptions={};(function(){var s=document.createElement('script');s.async=true;s.setAttribute('data-cfasync','false');s.src='https://pl28924845.effectivecpmnetwork.com/${config.key}/invoke.js';document.body.appendChild(s);})();</script>
</body></html>`
    }
    const w = typeof config.width === 'number' ? config.width : 300
    const h = typeof config.height === 'number' ? config.height : 250
    return `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent}iframe{border:none}</style></head><body>
<script>var atOptions={key:'${config.key}',format:'iframe',height:${h},width:${w},params:{}};</script>
<script src="https://www.highperformanceformat.com/${config.key}/invoke.js"></script>
</body></html>`
  }, [config.key, config.width, config.height, type])

  const h = typeof config.height === 'number' ? config.height : 300
  const w = typeof config.width === 'number' ? config.width : 300

  return (
    <iframe
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      style={{ width: typeof config.width === 'number' ? config.width : '100%', height: h, border: 'none', overflow: 'hidden' }}
      scrolling="no"
      loading="lazy"
      title="Advertisement"
    />
  )
}

export default function AdBanner({ type, className = '' }: AdBannerProps) {
  const config = adConfigs[type]

  if (type === 'skyscraper') {
    return (
      <div className={`flex justify-center ${className}`} style={{ width: 160, minHeight: 300 }}>
        <AdIframe config={config} type={type} />
      </div>
    )
  }

  if (type === 'leaderboard') {
    return (
      <div className={`flex justify-center overflow-hidden max-w-full ${className}`} style={{ width: 728, minHeight: 90 }}>
        <AdIframe config={config} type={type} />
      </div>
    )
  }

  if (type === 'rectangle') {
    return (
      <div className={`flex justify-center overflow-hidden max-w-full ${className}`} style={{ width: 300, minHeight: 250 }}>
        <AdIframe config={config} type={type} />
      </div>
    )
  }

  return (
    <div className={className} style={{ minHeight: 100 }}>
      <AdIframe config={config} type={type} />
    </div>
  )
}
