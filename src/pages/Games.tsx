import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Play, Eye, X, ChevronDown, Plus, Loader2, Heart, MessageSquare, ExternalLink } from 'lucide-react'
import { experiences } from '@/data/official-games'
import { getApprovedCommunityGames, submitGame } from '@/lib/api'
import { toDirectImageUrl } from '@/lib/drive-upload'
import ImagePicker from '@/components/ui/ImagePicker'
import type { Experience, GameCategory } from '@/lib/types'
import { extractYoutubeId, formatNumber, getCategoryColor, cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { getYouTubeStatsBatch, type YouTubeStats } from '@/lib/youtube'
import Tabs from '@/components/ui/Tabs'
import Modal from '@/components/ui/Modal'
import AdBanner from '@/components/AdBanner'

const categories: GameCategory[] = [
  'All', 'Uncopylocked', 'Minigame', 'Anime', 'Paid',
  'Tower Defense', 'Script Kit', 'UI Kit', 'Core API', 'Template',
]

function GameCard({ game, ytStats, onMouseEnter, onMouseLeave }: {
  game: Experience
  ytStats?: YouTubeStats | null
  onMouseEnter: (e: React.MouseEvent, game: Experience, ytStats?: YouTubeStats | null) => void
  onMouseLeave: () => void
}) {
  const navigate = useNavigate()
  const thumbId = extractYoutubeId(game.video_url)
  const isFree = game.price === 'Free'
  const views = ytStats?.viewCount ?? game.views_count ?? 0
  const likes = ytStats?.likeCount ?? game.likes_count ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl bg-bg-secondary border border-border-primary overflow-hidden card-hover group cursor-pointer"
      onClick={() => navigate(`/games/${game.id}`)}
      onMouseEnter={(e) => onMouseEnter(e, game, ytStats)}
      onMouseLeave={onMouseLeave}
      onMouseMove={(e) => onMouseEnter(e, game, ytStats)}
    >
      <div className="relative aspect-video bg-bg-tertiary">
        {(game.thumbnail_url || game.download_url) ? (
          <img
            src={toDirectImageUrl(game.thumbnail_url || game.download_url)}
            alt={game.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (thumbId) {
                target.src = `https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`
              } else {
                target.style.display = 'none'
              }
            }}
          />
        ) : thumbId ? (
          <img
            src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`}
            alt={game.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={40} className="text-text-dim" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {game.is_official && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/90 text-black text-xs font-bold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Official
            </div>
          )}
          {isFree ? (
            <div className="px-2 py-0.5 rounded-md bg-green-500/90 text-white text-xs font-bold">FREE</div>
          ) : (
            <div className="px-2 py-0.5 rounded-md bg-yellow-500/90 text-black text-xs font-bold">{game.price}</div>
          )}
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-3 text-white/80 text-xs">
          <span className="flex items-center gap-1"><Eye size={12} />{formatNumber(views)}</span>
          <span className="flex items-center gap-1"><Heart size={12} />{formatNumber(likes)}</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Play size={24} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug mb-2">{game.title}</h3>
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium', getCategoryColor(game.category))}>
            {game.category}
          </span>
          {game.creator && <span className="text-xs text-text-muted">by {game.creator}</span>}
        </div>
      </div>
    </motion.div>
  )
}

function GameTooltip({ game, ytStats, position }: {
  game: Experience
  ytStats?: YouTubeStats | null
  position: { x: number; y: number }
}) {
  const thumbId = extractYoutubeId(game.video_url)
  const views = ytStats?.viewCount ?? game.views_count ?? 0
  const likes = ytStats?.likeCount ?? game.likes_count ?? 0
  const comments = ytStats?.commentCount ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[100] pointer-events-none"
      style={{
        left: Math.min(position.x + 16, window.innerWidth - 360),
        top: Math.min(position.y - 10, window.innerHeight - 400),
      }}
    >
      <div className="w-[340px] rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl shadow-black/50 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-bg-tertiary">
          {thumbId ? (
            <img
              src={`https://img.youtube.com/vi/${thumbId}/maxresdefault.jpg`}
              alt={game.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${thumbId}/hqdefault.jpg`
              }}
            />
          ) : game.thumbnail_url ? (
            <img src={toDirectImageUrl(game.thumbnail_url)} alt={game.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Play size={40} className="text-text-dim" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">{game.title}</h3>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-2.5">
          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-text-secondary"><Eye size={12} className="text-blue-400" />{formatNumber(views)} views</span>
            <span className="flex items-center gap-1 text-text-secondary"><Heart size={12} className="text-red-400" />{formatNumber(likes)} likes</span>
            {comments > 0 && <span className="flex items-center gap-1 text-text-secondary"><MessageSquare size={12} className="text-green-400" />{formatNumber(comments)}</span>}
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Category</span>
              <span className={cn('px-1.5 py-0.5 rounded border text-[10px] font-medium', getCategoryColor(game.category))}>{game.category}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Creator</span>
              <span className="text-text-primary font-medium">{game.creator || 'Community'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Price</span>
              <span className={game.price === 'Free' ? 'text-green-400 font-medium' : 'text-yellow-400 font-medium'}>{game.price}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Type</span>
              <span className="text-text-primary font-medium">{game.is_official ? 'Official' : 'Community'}</span>
            </div>
            {game.description && (
              <div className="pt-1.5 mt-1.5 border-t border-border-primary">
                <p className="text-[10px] text-text-muted line-clamp-3 leading-relaxed">{game.description}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-border-primary">
            {game.video_url && (
              <span className="flex items-center gap-1 text-[10px] text-red-400"><ExternalLink size={9} />YouTube</span>
            )}
            {game.game_url && (
              <span className="flex items-center gap-1 text-[10px] text-blue-400"><Play size={9} />Play on Roblox</span>
            )}
            {game.download_enabled && (
              <span className="flex items-center gap-1 text-[10px] text-green-400"><Eye size={9} />Download available</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Games() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const [activeTab, setActiveTab] = useState('official')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<GameCategory>('All')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'az'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitForm, setSubmitForm] = useState({ title: '', description: '', category: 'Minigame', videoUrl: '', gameUrl: '', imageUrl: '', price: '0', gamepassUrl: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [communityData, setCommunityData] = useState<Experience[]>([])
  const [loadingCommunity, setLoadingCommunity] = useState(false)

  // YouTube stats for all games
  const [ytStatsMap, setYtStatsMap] = useState<Map<string, YouTubeStats>>(new Map())

  // Hover tooltip state
  const [tooltipGame, setTooltipGame] = useState<Experience | null>(null)
  const [tooltipYtStats, setTooltipYtStats] = useState<YouTubeStats | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleCardMouseEnter = useCallback((e: React.MouseEvent, game: Experience, ytStats?: YouTubeStats | null) => {
    setTooltipGame(game)
    setTooltipYtStats(ytStats || null)
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleCardMouseLeave = useCallback(() => {
    setTooltipGame(null)
    setTooltipYtStats(null)
  }, [])

  useEffect(() => {
    if (activeTab === 'community') {
      setLoadingCommunity(true)
      getApprovedCommunityGames().then((data) => {
        setCommunityData(data)
        setLoadingCommunity(false)
      })
    }
  }, [activeTab])

  // Fetch YouTube stats for all visible games
  useEffect(() => {
    const games = activeTab === 'official' ? experiences : communityData
    const videoIds = games
      .map(g => extractYoutubeId(g.video_url))
      .filter((id): id is string => !!id)
      .filter(id => !ytStatsMap.has(id))

    if (videoIds.length === 0) return

    getYouTubeStatsBatch(videoIds).then((stats) => {
      setYtStatsMap(prev => {
        const next = new Map(prev)
        stats.forEach((v, k) => next.set(k, v))
        return next
      })
    })
  }, [activeTab, communityData])

  const allGames = activeTab === 'official' ? experiences : communityData

  const filteredGames = useMemo(() => {
    let result = [...allGames]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || (g.creator || '').toLowerCase().includes(q))
    }
    if (category !== 'All') result = result.filter((g) => g.category === category)
    if (priceFilter === 'free') result = result.filter((g) => g.price === 'Free')
    else if (priceFilter === 'paid') result = result.filter((g) => g.price !== 'Free')
    if (sortBy === 'az') result.sort((a, b) => a.title.localeCompare(b.title))
    else if (sortBy === 'popular') result.sort((a, b) => ((b.game_play ? 1 : 0)) - ((a.game_play ? 1 : 0)))
    return result
  }, [allGames, search, category, priceFilter, sortBy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { navigate('/auth'); return }
    setSubmitting(true)
    try {
      const priceVal = parseInt(submitForm.price) || 0
      await submitGame({
        title: submitForm.title,
        description: submitForm.description,
        category: submitForm.category,
        video_url: submitForm.videoUrl,
        game_url: submitForm.gameUrl,
        drive_file_url: submitForm.imageUrl,
        thumbnail_url: submitForm.imageUrl,
        gamepass_url: submitForm.gamepassUrl,
        price: priceVal === 0 ? 'Free' : `${priceVal} Robux`,
      })
      setSubmitSuccess(true)
      setTimeout(() => {
        setShowSubmit(false)
        setSubmitSuccess(false)
        setSubmitForm({ title: '', description: '', category: 'Minigame', videoUrl: '', gameUrl: '', imageUrl: '', price: '0', gamepassUrl: '' })
      }, 2000)
    } catch {
      alert('Failed to submit. Make sure you are signed in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            🎮 Experience <span className="gradient-text">Registry</span>
          </h1>
          <p className="text-text-secondary text-lg">Browse official and community-submitted Roblox games</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <Tabs
              tabs={[
                { id: 'official', label: 'Official Games', count: experiences.length },
                { id: 'community', label: 'Community Games', count: communityData.length },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              className="flex-1 max-w-md"
            />
            {activeTab === 'community' && (
              <button onClick={() => { if (!currentUser) { navigate('/auth'); return } setShowSubmit(true) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-blue/15 text-accent-blue text-sm font-semibold hover:bg-accent-blue/25 transition-colors border border-accent-blue/20 ml-3 shrink-0">
                <Plus size={14} /> Submit Game
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search games..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  <X size={14} />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                showFilters ? 'bg-accent-blue/15 border-accent-blue/25 text-accent-blue' : 'bg-bg-secondary border-border-primary text-text-secondary hover:text-text-primary hover:border-border-hover')}>
              <SlidersHorizontal size={16} /> Filters
              <ChevronDown size={14} className={cn('transition-transform', showFilters && 'rotate-180')} />
            </button>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => setCategory(cat)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          category === cat ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25' : 'bg-bg-elevated text-text-secondary border border-transparent hover:border-border-hover')}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:w-48">
                  <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Price</label>
                  <div className="flex gap-1.5">
                    {(['all', 'free', 'paid'] as const).map((p) => (
                      <button key={p} onClick={() => setPriceFilter(p)}
                        className={cn('flex-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                          priceFilter === p ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25' : 'bg-bg-elevated text-text-secondary border border-transparent hover:border-border-hover')}>
                        {p === 'all' ? 'All' : p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:w-48">
                  <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 block">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-xs focus:outline-none focus:border-accent-blue/50">
                    <option value="newest">Newest</option>
                    <option value="popular">Most Playable</option>
                    <option value="az">A-Z</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="text-sm text-text-muted mb-4">
          Showing {filteredGames.length} {activeTab === 'official' ? 'official' : 'community'} games
        </div>

        <div className="flex justify-center mb-6">
          <AdBanner type="leaderboard" />
        </div>

        {loadingCommunity ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-accent-blue" />
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGames.map((game) => {
              const thumbId = extractYoutubeId(game.video_url)
              const ytStats = thumbId ? ytStatsMap.get(thumbId) ?? null : null
              return (
                <GameCard
                  key={game.id}
                  game={game}
                  ytStats={ytStats}
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto mb-4 text-text-dim" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No games found</h3>
            <p className="text-text-secondary text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <AdBanner type="rectangle" />
        </div>
      </motion.div>

      <Modal open={showSubmit} onClose={() => { setShowSubmit(false); setSubmitSuccess(false) }} title="Submit a Game" maxWidth="max-w-lg">
        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Submitted!</h3>
            <p className="text-text-secondary text-sm">Your game is pending review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">Title</label>
              <input type="text" value={submitForm.title} onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                placeholder="My awesome game" required
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">Description</label>
              <textarea value={submitForm.description} onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                placeholder="Describe your game..." rows={3}
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">Category</label>
              <select value={submitForm.category} onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all">
                {categories.filter((c) => c !== 'All').map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">YouTube Video URL (optional)</label>
              <input type="url" value={submitForm.videoUrl} onChange={(e) => setSubmitForm({ ...submitForm, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">Roblox Game URL (optional)</label>
              <input type="url" value={submitForm.gameUrl} onChange={(e) => setSubmitForm({ ...submitForm, gameUrl: e.target.value })}
                placeholder="https://www.roblox.com/games/..."
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div>
              <ImagePicker
                value={submitForm.imageUrl}
                onChange={(url) => setSubmitForm({ ...submitForm, imageUrl: url })}
                folder="yobest/thumbnails"
                label="Thumbnail Image"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">Price (Robux)</label>
                <input type="number" min="0" value={submitForm.price} onChange={(e) => setSubmitForm({ ...submitForm, price: e.target.value })}
                  placeholder="0 = Free"
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
                <p className="text-[10px] text-text-dim mt-1">0 = Free to download</p>
              </div>
              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">Gamepass ID (if paid)</label>
                <input type="text" value={submitForm.gamepassUrl} onChange={(e) => setSubmitForm({ ...submitForm, gamepassUrl: e.target.value })}
                  placeholder="e.g. 12345678"
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
                <p className="text-[10px] text-text-dim mt-1">Paste the numeric gamepass ID — buyers must own this to download</p>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit for Review'}
            </button>
          </form>
        )}
      </Modal>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {tooltipGame && (
          <GameTooltip game={tooltipGame} ytStats={tooltipYtStats} position={tooltipPos} />
        )}
      </AnimatePresence>
    </div>
  )
}
