import { useMemo, useState, useEffect } from 'react'

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

const fallbackMessages = [
  'Support Yobest by disabling your ad blocker',
  'Ads help keep Yobest free for everyone',
  'Consider whitelisting Yobest in your ad blocker',
]

function AdIframe({ config, type }: { config: { key: string; width: number | string; height: number | string }; type: string }) {
  const [blocked, setBlocked] = useState(false)
  const [msgIdx] = useState(() => Math.floor(Math.random() * fallbackMessages.length))

  useEffect(() => {
    const timer = setTimeout(() => setBlocked(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  const srcDoc = useMemo(() => {
    if (type === 'fluid') {
      return `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:visible;background:transparent}</style></head><body>
<div id="container-${config.key}"></div>
<script>var atOptions={};(function(){var s=document.createElement('script');s.async=true;s.setAttribute('data-cfasync','false');s.src='https://pl28924845.effectivecpmnetwork.com/${config.key}/invoke.js';document.body.appendChild(s);var t=setTimeout(function(){parent.postMessage({adBlocked:true,key:'${config.key}'},'*');},3500);s.onload=function(){clearTimeout(t);parent.postMessage({adLoaded:true,key:'${config.key}'},'*');};})();</script>
</body></html>`
    }
    const w = typeof config.width === 'number' ? config.width : 300
    const h = typeof config.height === 'number' ? config.height : 250
    return `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent}iframe{border:none}</style></head><body>
<script>var atOptions={key:'${config.key}',format:'iframe',height:${h},width:${w},params:{}};</script>
<script src="https://www.highperformanceformat.com/${config.key}/invoke.js"></script>
<script>var t=setTimeout(function(){parent.postMessage({adBlocked:true,key:'${config.key}'},'*');},3500);document.querySelector('script[src*="invoke"]')?.addEventListener('load',function(){clearTimeout(t);parent.postMessage({adLoaded:true,key:'${config.key}'},'*');});</script>
</body></html>`
  }, [config.key, config.width, config.height, type])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.adLoaded && e.data?.key === config.key) setBlocked(false)
      if (e.data?.adBlocked && e.data?.key === config.key) setBlocked(true)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [config.key])

  const h = typeof config.height === 'number' ? config.height : 300

  if (blocked) {
    const isSmall = type === 'leaderboard' || type === 'skyscraper'
    return (
      <div
        style={{
          width: typeof config.width === 'number' ? config.width : '100%',
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(7,7,13,0.9) 0%, rgba(15,15,30,0.9) 100%)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: isSmall ? '8px' : '16px',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: isSmall ? 9 : 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
            {fallbackMessages[msgIdx]}
          </div>
        </div>
      </div>
    )
  }

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
