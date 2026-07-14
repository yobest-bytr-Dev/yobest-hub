import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Download, Play, ExternalLink, Eye, Heart, Share2, Copy, Check, MessageSquare, Calendar, User, Loader2, Lock, MessageCircle } from 'lucide-react'
import { experiences } from '@/data/official-games'
import { getApprovedCommunityGames, toggleGameLike, hasUserLikedGame, getGameLikeCount, addGameComment, getGameComments } from '@/lib/api'
import type { Experience } from '@/lib/types'
import { extractYoutubeId, formatNumber, getCategoryColor, cn } from '@/lib/utils'
import { getYouTubeStats, getYouTubeComments, type YouTubeStats, type YouTubeComment } from '@/lib/youtube'
import { trackGameView, getGameViewCount, trackDownload } from '@/lib/analytics'
import { useStore } from '@/store/useStore'
import { toDirectImageUrl } from '@/lib/drive-upload'
import RobloxAvatar from '@/components/ui/RobloxAvatar'

function LoginPrompt({ message, onLogin }: { message: string; onLogin: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-elevated border border-border-primary">
      <Lock size={16} className="text-accent-blue shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary">{message}</p>
      </div>
      <button onClick={onLogin} className="px-3 py-1.5 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shrink-0">
        Sign In
      </button>
    </div>
  )
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const [game, setGame] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [copied, setCopied] = useState(false)
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [ytStats, setYtStats] = useState<YouTubeStats | null>(null)
  const [ytLoading, setYtLoading] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [siteViews, setSiteViews] = useState(0)
  const [ytComments, setYtComments] = useState<YouTubeComment[]>([])
  const [ytCommentsLoading, setYtCommentsLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const found = experiences.find((e) => e.id === id)
    if (found) {
      setGame(found)
      setLoading(false)
    } else {
      getApprovedCommunityGames().then((community) => {
        const foundCommunity = community.find((e) => e.id === id)
        if (foundCommunity) setGame(foundCommunity)
        setLoading(false)
      })
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    trackGameView(id)
    setSiteViews(getGameViewCount(id))
    getGameLikeCount(id).then(setLikes)
    hasUserLikedGame(id).then(setLiked)
  }, [id])

  useEffect(() => {
    if (!id) return
    setCommentsLoading(true)
    getGameComments(id).then((data) => {
      setComments(data)
      setCommentsLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (game) {
      document.title = `${game.title} — Yobest`
    }
  }, [game])

  useEffect(() => {
    if (game?.video_url) {
      const thumbId = extractYoutubeId(game.video_url)
      if (thumbId) {
        setYtLoading(true)
        getYouTubeStats(thumbId).then((stats) => {
          setYtStats(stats)
          setYtLoading(false)
        })

        // Fetch YouTube comments
        setYtCommentsLoading(true)
        getYouTubeComments(thumbId, 15).then((comments) => {
          setYtComments(comments)
          setYtCommentsLoading(false)
        })
      }
    }
  }, [game])

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 shimmer rounded-lg" />
          <div className="aspect-video shimmer rounded-xl" />
          <div className="h-6 w-96 shimmer rounded-lg" />
          <div className="h-4 w-64 shimmer rounded-lg" />
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Game not found</h2>
        <Link to="/games" className="text-accent-blue hover:underline text-sm">Back to Games</Link>
      </div>
    )
  }

  const thumbId = extractYoutubeId(game.video_url)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: game.title, text: game.description || game.title, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLike = async () => {
    if (!currentUser) { navigate('/auth'); return }
    try {
      const newLiked = await toggleGameLike(game.id)
      setLiked(newLiked)
      setLikes((prev) => newLiked ? prev + 1 : prev - 1)
    } catch {}
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { navigate('/auth'); return }
    if (!comment.trim()) return
    setCommentLoading(true)
    try {
      await addGameComment(game.id, comment.trim())
      setComment('')
      const updated = await getGameComments(game.id)
      setComments(updated)
    } catch {
      alert('Failed to post comment.')
    }
    setCommentLoading(false)
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Games
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-bg-secondary border border-border-primary">
              {thumbId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${thumbId}?rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={game.title}
                />
              ) : game.thumbnail_url ? (
                <img src={toDirectImageUrl(game.thumbnail_url)} alt={game.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play size={64} className="text-text-dim" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={cn('inline-flex items-center px-3 py-1 rounded-lg border text-xs font-medium', getCategoryColor(game.category))}>
                  {game.category}
                </span>
                {game.is_official && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 text-xs font-bold">
                    Official Yobest Game
                  </span>
                )}
                {game.price === 'Free' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-bold">Free</span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 text-xs font-bold">{game.price}</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">{game.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
                {game.creator && (
                  <span className="flex items-center gap-1.5"><User size={14} /> {game.creator}</span>
                )}
                <span className="flex items-center gap-1.5"><Heart size={14} /> {formatNumber(likes)} likes</span>
                <span className="flex items-center gap-1.5"><Eye size={14} /> {formatNumber(siteViews)} views</span>
                <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {comments.length} comments</span>
                {ytStats?.publishedAt && (
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(ytStats.publishedAt).toLocaleDateString()}</span>
                )}
              </div>

              {game.description && (
                <p className="text-text-secondary leading-relaxed mb-6">{game.description}</p>
              )}

              <div className="flex flex-wrap gap-3 mb-6">
                {game.game_play && game.game_url && (
                  <a href={game.game_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors">
                    <Globe size={18} /> Play on Roblox
                  </a>
                )}
                {game.download_enabled && game.download_url && (
                  <a href={game.download_url} target="_blank" rel="noopener noreferrer" onClick={() => trackDownload(game.id)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-bg-elevated border border-border-primary text-text-primary font-semibold text-sm hover:border-border-hover transition-all">
                    <Download size={18} /> Download Source
                  </a>
                )}
                {game.video_url && (
                  <a href={game.video_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 font-semibold text-sm hover:bg-red-500/25 transition-colors">
                    <ExternalLink size={18} /> YouTube
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleLike}
                  className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    liked ? 'bg-red-500/15 border-red-500/25 text-red-400' : 'bg-bg-elevated border-border-primary text-text-secondary hover:text-text-primary')}>
                  <Heart size={16} className={liked ? 'fill-red-400' : ''} /> {formatNumber(likes)}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-secondary hover:text-text-primary text-sm font-medium transition-all">
                  {copied ? <><Check size={16} className="text-green-400" /> Link Copied!</> : <><Share2 size={16} /> Share</>}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
              <div className="px-5 py-4 border-b border-border-primary">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <MessageSquare size={16} className="text-accent-blue" /> Comments ({comments.length})
                </h3>
              </div>
              <div className="p-4">
                {currentUser ? (
                  <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..." className="flex-1 px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
                    <button type="submit" disabled={!comment.trim() || commentLoading}
                      className="px-4 py-2 rounded-xl bg-accent-blue text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {commentLoading ? <Loader2 size={14} className="animate-spin" /> : 'Post'}
                    </button>
                  </form>
                ) : (
                  <LoginPrompt message="Sign in to leave a comment" onLogin={() => navigate('/auth')} />
                )}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-accent-blue" /></div>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-4">No comments yet. Be the first!</p>
                  ) : (
                    comments.map((c: any) => (
                      <div key={c.id} className="flex gap-3">
                        <RobloxAvatar
                          userId={c.profile?.roblox_id}
                          username={c.profile?.username}
                          avatarUrl={c.profile?.avatar_url}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-text-primary">{c.profile?.username || 'Unknown'}</span>
                            <span className="text-[10px] text-text-muted">{timeAgo(c.created_at)}</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-bg-secondary border border-border-primary p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Game Info</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Category</span>
                  <span className="text-text-primary font-medium">{game.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Price</span>
                  <span className={game.price === 'Free' ? 'text-green-400 font-medium' : 'text-yellow-400 font-medium'}>{game.price}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Creator</span>
                  <span className="text-text-primary font-medium">{game.creator || 'Community'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Type</span>
                  <span className="text-text-primary font-medium">{game.is_official ? 'Official' : 'Community'}</span>
                </div>

                <div className="pt-2 mt-2 border-t border-border-primary">
                  <span className="text-[11px] text-accent-blue font-medium uppercase tracking-wider">Site Stats</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Site Likes</span>
                  <span className="text-accent-blue font-medium">{formatNumber(likes)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Site Views</span>
                  <span className="text-accent-blue font-medium">{formatNumber(siteViews)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Comments</span>
                  <span className="text-accent-blue font-medium">{comments.length}</span>
                </div>

                {ytStats && (
                  <>
                    <div className="pt-2 mt-2 border-t border-border-primary">
                      <span className="text-[11px] text-red-400 font-medium uppercase tracking-wider">YouTube Stats</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">YouTube Views</span>
                      <span className="text-red-400 font-medium">{formatNumber(ytStats.viewCount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">YouTube Likes</span>
                      <span className="text-red-400 font-medium">{formatNumber(ytStats.likeCount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">YouTube Comments</span>
                      <span className="text-red-400 font-medium">{formatNumber(ytStats.commentCount)}</span>
                    </div>
                    {ytStats.publishedAt && (
                      <div className="flex justify-between text-xs">
                        <span className="text-text-muted">Published</span>
                        <span className="text-red-400 font-medium">{new Date(ytStats.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </>
                )}
                {!ytStats && !ytLoading && game.video_url && (
                  <div className="pt-2 mt-2 border-t border-border-primary">
                    <span className="text-[11px] text-text-dim font-medium uppercase tracking-wider">YouTube Stats</span>
                    <p className="text-[11px] text-text-muted mt-1">Stats unavailable</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
              <div className="px-5 py-4 border-b border-border-primary">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <MessageCircle size={16} className="text-red-400" /> YouTube Comments
                  {ytComments.length > 0 && <span className="text-[10px] text-text-muted font-normal">({ytComments.length})</span>}
                </h3>
              </div>
              <div className="p-4">
                {ytCommentsLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-red-400" /></div>
                ) : ytComments.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {ytComments.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <img
                          src={c.authorProfileImageUrl}
                          alt={c.authorDisplayName}
                          className="w-7 h-7 rounded-full shrink-0 bg-bg-tertiary"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-semibold text-text-primary truncate">{c.authorDisplayName}</span>
                            <span className="text-[9px] text-text-muted shrink-0">{new Date(c.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: c.textDisplay }} />
                          {c.likeCount > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-[9px] text-text-muted">
                              <Heart size={9} /> {formatNumber(c.likeCount)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : thumbId ? (
                  <div className="space-y-3">
                    <div className="aspect-video rounded-xl overflow-hidden bg-bg-tertiary border border-border-primary">
                      <iframe
                        src={`https://www.youtube.com/embed/${thumbId}?rel=0`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={game.title}
                      />
                    </div>
                    <a href={`https://www.youtube.com/watch?v=${thumbId}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
                      <ExternalLink size={14} /> View all comments on YouTube
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-4">No YouTube video linked</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-bg-secondary border border-border-primary p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Related Games</h3>
              <div className="space-y-3">
                {experiences.filter((e) => e.category === game.category && e.id !== game.id).slice(0, 3).map((g) => (
                  <Link key={g.id} to={`/games/${g.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-elevated transition-colors">
                    {(() => {
                      const tid = extractYoutubeId(g.video_url)
                      return tid ? (
                        <img src={`https://img.youtube.com/vi/${tid}/default.jpg`} alt="" className="w-12 h-9 rounded-md object-cover" />
                      ) : (
                        <div className="w-12 h-9 rounded-md bg-bg-tertiary flex items-center justify-center"><Play size={12} className="text-text-dim" /></div>
                      )
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-text-primary truncate">{g.title}</div>
                      <div className="text-[10px] text-text-muted">{g.price}</div>
                    </div>
                  </Link>
                ))}
                {experiences.filter((e) => e.category === game.category && e.id !== game.id).length === 0 && (
                  <p className="text-xs text-text-muted text-center py-2">No related games</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
