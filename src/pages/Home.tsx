import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, Brain, Users, ShoppingBag, ArrowRight, Download, Play, Sparkles, Eye, Heart, Rocket, Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { experiences } from '@/data/official-games'
import { extractYoutubeId, formatNumber, cn } from '@/lib/utils'
import { useEffect, useState, useRef, useCallback } from 'react'
import { getPlatformStats, getOfficialGames } from '@/lib/api'
import { getSiteAnalytics } from '@/lib/analytics'
import { useStore } from '@/store/useStore'
import { toDirectImageUrl } from '@/lib/drive-upload'
import type { Experience } from '@/lib/types'
import AdBanner from '@/components/AdBanner'

const pillars = [
  {
    icon: Brain,
    emoji: '🧠',
    title: 'Yobest AI',
    subtitle: 'The Architect',
    description: 'Agentic AI coding assistant connected to your Roblox Studio. Create, update, and deploy instances in real time.',
    to: '/ai',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'glow-blue',
  },
  {
    icon: Users,
    emoji: '👥',
    title: 'Community Hub',
    subtitle: 'Connect & Compete',
    description: 'Profiles synced to Roblox avatars, follow graph, challenges, leaderboards, and direct messaging.',
    to: '/community',
    gradient: 'from-purple-500 to-pink-500',
    glow: 'glow-purple',
  },
  {
    icon: Gamepad2,
    emoji: '🎮',
    title: 'Experience Registry',
    subtitle: 'Discover Games',
    description: 'Browse official and community-submitted Roblox games with reviews, ratings, and gated downloads.',
    to: '/games',
    gradient: 'from-green-500 to-emerald-500',
    glow: 'glow-green',
  },
  {
    icon: ShoppingBag,
    emoji: '🛍️',
    title: 'Asset Marketplace',
    subtitle: 'Buy & Sell',
    description: 'Scripts, models, and UI kits for sale or free download, priced in Robux with gamepass-linked purchases.',
    to: '/marketplace',
    gradient: 'from-pink-500 to-rose-500',
    glow: 'glow-pink',
  },
]

const GameGallery = ({ officialGames }: { officialGames: Experience[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const allImages: { src: string; title: string; id: string }[] = []
  officialGames.forEach((game) => {
    if (game.thumbnail_url) {
      allImages.push({ src: toDirectImageUrl(game.thumbnail_url), title: game.title, id: game.id })
    }
    if (game.images && game.images.length > 0) {
      game.images.forEach((img, i) => {
        allImages.push({ src: toDirectImageUrl(img), title: `${game.title} #${i + 1}`, id: `${game.id}-${i}` })
      })
    }
  })

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    return () => { if (el) el.removeEventListener('scroll', checkScroll) }
  }, [checkScroll])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' })
  }

  if (allImages.length === 0) return null

  return (
    <div className="relative group">
      {canScrollLeft && (
        <button onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-bg-secondary/90 border border-border-primary flex items-center justify-center text-text-primary hover:bg-bg-elevated transition-all shadow-lg opacity-0 group-hover:opacity-100">
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-bg-secondary/90 border border-border-primary flex items-center justify-center text-text-primary hover:bg-bg-elevated transition-all shadow-lg opacity-0 group-hover:opacity-100">
          <ChevronRight size={20} />
        </button>
      )}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {allImages.map((img, i) => (
          <motion.div key={img.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="shrink-0 w-[300px] sm:w-[340px] snap-start">
            <Link to={`/games/${img.id.split('-')[0]}`} className="block rounded-2xl overflow-hidden bg-bg-secondary border border-border-primary card-hover group/card relative aspect-[16/10]">
              <img src={img.src} alt={img.title} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-sm font-semibold text-white truncate">{img.title}</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Play size={20} className="text-white ml-0.5" fill="white" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}

export default function Home() {
  const [officialGames, setOfficialGames] = useState(experiences)
  const featured = officialGames.filter((g) => g.game_play).slice(0, 4)
  const platformStats = useStore((s) => s.platformStats)
  const setPlatformStats = useStore((s) => s.setPlatformStats)
  const siteAnalytics = useStore((s) => s.siteAnalytics)
  const setSiteAnalytics = useStore((s) => s.setSiteAnalytics)

  useEffect(() => {
    getPlatformStats().then(setPlatformStats)
    getSiteAnalytics().then(setSiteAnalytics)
    getOfficialGames().then((data) => { if (data.length > 0) setOfficialGames(data) })
  }, [setPlatformStats, setSiteAnalytics])

  const stats = [
    { label: 'Official Games', value: String(platformStats.officialGames || officialGames.length), icon: Gamepad2, color: 'text-green-400', bg: 'bg-green-400/10', emoji: '🎮' },
    { label: 'Site Visitors', value: siteAnalytics.visitors > 0 ? formatNumber(siteAnalytics.visitors) : '0', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10', emoji: '👁️' },
    { label: 'Total Downloads', value: siteAnalytics.downloads > 0 ? formatNumber(siteAnalytics.downloads) : '0', icon: Download, color: 'text-cyan-400', bg: 'bg-cyan-400/10', emoji: '📥' },
    { label: 'AI Sessions', value: siteAnalytics.aiSessions > 0 ? formatNumber(siteAnalytics.aiSessions) : '0', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/10', emoji: '✨' },
  ]

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 lg:pt-28 lg:pb-24">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-medium mb-6"
            >
              <Sparkles size={14} /> <span>Powered by AI</span> <span className="w-1 h-1 rounded-full bg-accent-blue" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
              The <span className="gradient-text">Roblox Creator</span><br />Platform
            </h1>
            <p className="text-text-secondary text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
              Build games with AI assistance, share with the community, and monetize your creations.
              <br className="hidden sm:block" />
              Everything you need in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/games" className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-accent-blue/25">
                  <Gamepad2 size={18} /> Explore Games
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/ai" className="px-6 py-3.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary font-semibold text-sm hover:border-accent-blue/40 hover:bg-bg-tertiary transition-all flex items-center gap-2 animate-gradient-border">
                  <Brain size={18} /> Try AI Architect
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/creators" className="px-6 py-3.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary font-semibold text-sm hover:border-accent-purple/40 hover:bg-bg-tertiary transition-all flex items-center gap-2 animate-gradient-border">
                  <Users size={18} /> Find Creators
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="text-center p-5 rounded-2xl bg-bg-secondary/60 border border-border-primary/50 backdrop-blur-sm card-glow"
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3', stat.bg)}>
                    <Icon size={18} className={stat.color} />
                  </div>
                  <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                  <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-medium mb-3">
            <Eye size={14} /> Gallery
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Game <span className="gradient-text">Gallery</span></h2>
          <p className="text-text-secondary">Screenshots and images from our games</p>
        </motion.div>
        <GameGallery officialGames={officialGames} />
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <AdBanner type="leaderboard" />
      </div>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-medium mb-4">
            <Rocket size={14} /> Core Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Four Pillars, One <span className="gradient-text">Platform</span> 🏗️</h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">Everything a Roblox creator needs, from idea to published game.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <motion.div key={pillar.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={pillar.to} className={`block p-6 rounded-2xl bg-bg-secondary border border-border-primary card-hover card-glow group ${pillar.glow}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">{pillar.emoji} {pillar.subtitle}</div>
                      <h3 className="text-xl font-bold text-text-primary">{pillar.title}</h3>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">{pillar.description}</p>
                  <div className="flex items-center gap-2 text-accent-blue text-sm font-medium group-hover:gap-3 transition-all">
                    Explore <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-border-primary">
        <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-3">
              <Trophy size={14} /> Featured
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">⭐ Featured Games</h2>
            <p className="text-text-secondary">Official games from the Yobest team</p>
          </div>
          <Link to="/games" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm font-medium hover:border-accent-blue/30 transition-all">
            View All <ArrowRight size={14} />
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((game, i) => {
            const thumbId = extractYoutubeId(game.video_url)
            return (
              <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/games/${game.id}`} className="block rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden card-hover card-glow group">
                  <div className="relative aspect-video bg-bg-tertiary">
                    {thumbId ? (
                      <img src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Gamepad2 size={32} className="text-text-dim" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      {game.price === 'Free' && <div className="px-2 py-1 rounded-lg bg-green-500/90 text-white text-[11px] font-bold backdrop-blur-sm">🎁 FREE</div>}
                      {game.is_official && <div className="px-2 py-1 rounded-lg bg-yellow-500/90 text-black text-[11px] font-bold backdrop-blur-sm">⭐ Official</div>}
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/80 text-xs backdrop-blur-sm bg-black/30 px-2 py-0.5 rounded-md">
                      <Eye size={11} />
                      <span>{formatNumber(game.views_count || 0)}</span>
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white/80 text-xs backdrop-blur-sm bg-black/30 px-2 py-0.5 rounded-md">
                      <Heart size={11} />
                      <span>{formatNumber(game.likes_count || 0)}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                        <Play size={24} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">{game.title}</h3>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/games" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm font-medium">
            View All Games <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
        <AdBanner type="rectangle" />
      </div>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-border-primary">
        <motion.div className="text-center p-6 sm:p-8 lg:p-12 rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border-primary relative overflow-hidden card-glow"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-6 shadow-xl shadow-accent-blue/25">
              <Brain size={32} className="text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Build with <span className="gradient-text">AI Power</span></h2>
            <p className="text-text-secondary text-lg max-w-lg mx-auto mb-8">
              Connect your Roblox Studio and let Yobest AI build for you. From scripts to full game systems — just describe what you want.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/ai" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-accent-blue/25">
                  <Sparkles size={18} /> Launch AI Architect
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/creators" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bg-elevated border border-border-primary text-text-primary font-semibold text-sm hover:border-accent-blue/30 transition-all animate-gradient-border">
                  <Users size={18} /> Meet Creators
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold mb-2">Why <span className="gradient-text">Yobest</span>? 🤔</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { emoji: '🤖', title: 'AI-Powered', desc: 'Generate Luau code, game systems, and UI with AI that understands Roblox Studio.', color: 'border-accent-blue/20 hover:border-accent-blue/40' },
            { emoji: '🌍', title: 'Global Community', desc: 'Connect with creators worldwide. Follow, message, and collaborate on projects.', color: 'border-accent-purple/20 hover:border-accent-purple/40' },
            { emoji: '📦', title: 'Asset Marketplace', desc: 'Buy and sell scripts, models, and UI kits. Earn Robux from your creations.', color: 'border-accent-green/20 hover:border-accent-green/40' },
            { emoji: '🔒', title: 'Safe & Secure', desc: 'Roblox-verified accounts. Your data is encrypted and never shared.', color: 'border-accent-pink/20 hover:border-accent-pink/40' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`p-5 rounded-2xl bg-bg-secondary border ${item.color} transition-all card-hover card-glow text-center`}
            >
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="text-sm font-bold text-text-primary mb-1">{item.title}</h3>
              <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AdBanner type="fluid" />
      </div>
    </div>
  )
}
