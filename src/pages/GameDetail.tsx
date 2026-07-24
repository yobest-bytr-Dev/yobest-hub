import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Download, Play, ExternalLink, Eye, Heart, Share2, Copy, Check, MessageSquare, Calendar, User, Loader2, Lock, MessageCircle, Pencil, Trash2, Tag, ShieldCheck, ShoppingCart } from 'lucide-react'
import { experiences } from '@/data/official-games'
import { getApprovedCommunityGames, getOfficialGames, toggleGameLike, hasUserLikedGame, getGameLikeCount, addGameComment, getGameComments, editGameComment, deleteGameComment, getReviewsStats, submitReview, getUserReview, getReleases, verifyGamepassOwnership, isGamepassVerified, extractGamepassId } from '@/lib/api'
import type { Experience, Release } from '@/lib/types'
import { extractYoutubeId, formatNumber, getCategoryColor, cn } from '@/lib/utils'
import { getYouTubeStats, getYouTubeComments, type YouTubeStats, type YouTubeComment } from '@/lib/youtube'
import { trackGameView, getGameViewCount, trackExperienceDownload } from '@/lib/analytics'
import { useStore } from '@/store/useStore'
import { toDirectImageUrl } from '@/lib/drive-upload'
import RobloxAvatar from '@/components/ui/RobloxAvatar'
import StarRating from '@/components/ui/StarRating'
import Gallery from '@/components/ui/Gallery'
import { useToast } from '@/components/ui/Toast'
import { addNotification } from '@/lib/notifications'

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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 })
  const [myReview, setMyReview] = useState<{ rating: number; comment: string } | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [releases, setReleases] = useState<Release[]>([])
  const [gamepassVerified, setGamepassVerified] = useState(false)
  const [verifyingPurchase, setVerifyingPurchase] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    // Always query DB for latest data (hardcoded data may be stale after Dashboard edits)
    Promise.all([getOfficialGames(), getApprovedCommunityGames()]).then(([official, community]) => {
      const all = [...official, ...community]
      const foundDb = all.find((e) => e.id === id)
      if (foundDb) {
        setGame(foundDb)
      } else {
        // Fallback to hardcoded data (for games not in DB)
        const found = experiences.find((e) => e.id === id)
        if (found) setGame(found)
      }
      setLoading(false)
    }).catch(() => {
      // If DB query fails, fall back to hardcoded
      const found = experiences.find((e) => e.id === id)
      if (found) setGame(found)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!id) return
    trackGameView(id)
    getGameViewCount(id).then(setSiteViews)
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
    getReviewsStats(id).then(setReviewStats)
    getUserReview(id).then(setMyReview)
    getReleases('game', id).then(setReleases)
  }, [id])

  useEffect(() => {
    if (!game?.gamepass_id || !currentUser) return
    const gpId = extractGamepassId(game.gamepass_id) || game.gamepass_id
    isGamepassVerified(gpId).then(setGamepassVerified)
  }, [game, currentUser])

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
    const shareUrl = `${window.location.origin}/p/${game.id}`
    if (navigator.share) {
      try { await navigator.share({ title: game.title, text: game.description || game.title, url: shareUrl }) } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVerifyPurchase = async () => {
    if (!currentUser) { navigate('/auth'); return }
    if (!game?.gamepass_id) { toast('No gamepass configured for this game', 'error'); return }
    setVerifyingPurchase(true)
    try {
      const gpId = extractGamepassId(game.gamepass_id) || game.gamepass_id
      const result = await verifyGamepassOwnership(gpId)
      if (result.verified) {
        setGamepassVerified(true)
        toast('Purchase verified successfully!', 'success')
      } else {
        toast(result.error || 'Could not verify purchase', 'error')
      }
    } catch {
      toast('Verification failed. Try again later.', 'error')
    }
    setVerifyingPurchase(false)
  }

  const handleLike = async () => {
    if (!currentUser) { navigate('/auth'); return }
    try {
      const newLiked = await toggleGameLike(game.id)
      setLiked(newLiked)
      setLikes((prev) => newLiked ? prev + 1 : prev - 1)
      toast(newLiked ? 'Liked!' : 'Unliked', 'success')
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
      addNotification({ type: 'comment', title: 'New comment', body: `You commented on ${game.title}`, link: `/games/${game.id}` })
      toast('Comment posted!', 'success')
    } catch {
      toast('Failed to post comment', 'error')
    }
    setCommentLoading(false)
  }

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return
    try {
      await editGameComment(commentId, editCommentText.trim())
      const updated = await getGameComments(game.id)
      setComments(updated)
      setEditingCommentId(null)
      setEditCommentText('')
      toast('Comment edited!', 'success')
    } catch {
      toast('Failed to edit comment', 'error')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    try {
      await deleteGameComment(commentId)
      const updated = await getGameComments(game.id)
      setComments(updated)
      toast('Comment deleted', 'success')
    } catch {
      toast('Failed to delete comment', 'error')
    }
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

            {(() => {
              const gallery = game.gallery_images || game.images || []
              return gallery.length > 0 ? <Gallery images={gallery} alt={game.title} /> : null
            })()}

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
                {reviewStats.count > 0 && (
                  <span className="flex items-center gap-1.5"><StarRating rating={reviewStats.avg} count={reviewStats.count} size={14} /></span>
                )}
                <span className="flex items-center gap-1.5"><Heart size={14} /> {formatNumber(likes)} likes</span>
                <span className="flex items-center gap-1.5"><Eye size={14} /> {formatNumber(siteViews)} views</span>
                <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {comments.length} comments</span>
                {ytStats?.publishedAt ? (
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(ytStats.publishedAt).toLocaleDateString()}</span>
                ) : game.created_at ? (
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> Added {new Date(game.created_at).toLocaleDateString()}</span>
                ) : null}
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
                {game.download_enabled && game.download_url && (!game.gamepass_id || gamepassVerified) && (
                  <a href={game.download_url} target="_blank" rel="noopener noreferrer" onClick={() => id && trackExperienceDownload(id)}
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

              {game.gamepass_id && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart size={16} className="text-yellow-400" />
                    <h4 className="text-sm font-semibold text-text-primary">Purchase Required</h4>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">This game requires a gamepass to download ({game.price}).</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={`https://www.roblox.com/game-pass/${extractGamepassId(game.gamepass_id) || game.gamepass_id}/`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400 transition-colors">
                      <ShoppingCart size={14} /> Buy Gamepass
                    </a>
                    {currentUser ? (
                      gamepassVerified ? (
                        <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-semibold">
                          <ShieldCheck size={14} /> Verified
                        </span>
                      ) : (
                        <button onClick={handleVerifyPurchase} disabled={verifyingPurchase}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs font-semibold hover:border-accent-blue/30 disabled:opacity-50 transition-all">
                          {verifyingPurchase ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Verify Purchase
                        </button>
                      )
                    ) : (
                      <button onClick={() => navigate('/auth')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-xs font-semibold hover:border-accent-blue/30 transition-all">
                        <Lock size={14} /> Sign in to verify
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {reviewStats.count > 0 && (
              <div className="rounded-2xl bg-bg-secondary border border-border-primary p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Ratings</h3>
                  <StarRating rating={reviewStats.avg} count={reviewStats.count} size={16} />
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-bg-secondary border border-border-primary p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">{myReview ? 'Your Rating' : 'Rate this Game'}</h3>
                {!showReviewForm && !myReview && currentUser && (
                  <button onClick={() => { setShowReviewForm(true); setReviewRating(0); setReviewComment('') }}
                    className="text-xs text-accent-blue hover:underline">
                    Rate it
                  </button>
                )}
              </div>
              {myReview && (
                <div>
                  <StarRating rating={myReview.rating} size={18} />
                  {myReview.comment && <p className="text-xs text-text-secondary mt-2">{myReview.comment}</p>}
                  {currentUser && (
                    <button onClick={() => { setShowReviewForm(true); setReviewRating(myReview.rating); setReviewComment(myReview.comment || '') }}
                      className="text-[11px] text-text-muted hover:text-accent-blue mt-2">
                      Edit your rating
                    </button>
                  )}
                </div>
              )}
              {showReviewForm && (
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  if (!reviewRating || !id) return
                  setReviewSubmitting(true)
                  try {
                    await submitReview(id, reviewRating, reviewComment, game?.is_official ?? true)
                    setMyReview({ rating: reviewRating, comment: reviewComment })
                    getReviewsStats(id).then(setReviewStats)
                    setShowReviewForm(false)
                    toast('Rating saved!', 'success')
                  } catch {
                    toast('Failed to save rating', 'error')
                  } finally {
                    setReviewSubmitting(false)
                  }
                }} className="space-y-3">
                  <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={24} />
                  <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2}
                    placeholder="Optional comment..."
                    className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={!reviewRating || reviewSubmitting}
                      className="px-4 py-2 rounded-xl bg-accent-blue text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
                      {reviewSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit'}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-xl bg-bg-elevated text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              {!currentUser && !myReview && (
                <p className="text-xs text-text-muted">Sign in to rate this game</p>
              )}
            </div>

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
                            {c.edited_at && <span className="text-[10px] text-text-dim">(edited)</span>}
                            {currentUser && currentUser.id === c.user_id && (
                              <div className="flex items-center gap-1 ml-auto">
                                <button
                                  onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.content) }}
                                  className="p-1 rounded hover:bg-bg-tertiary text-text-dim hover:text-accent-blue transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="p-1 rounded hover:bg-bg-tertiary text-text-dim hover:text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                          {editingCommentId === c.id ? (
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleEditComment(c.id); if (e.key === 'Escape') { setEditingCommentId(null); setEditCommentText('') } }}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-bg-elevated border border-accent-blue/50 text-text-primary text-xs focus:outline-none"
                                autoFocus
                              />
                              <button onClick={() => handleEditComment(c.id)} className="px-3 py-1.5 rounded-lg bg-accent-blue text-white text-xs font-medium hover:bg-blue-600 transition-colors">Save</button>
                              <button onClick={() => { setEditingCommentId(null); setEditCommentText('') }} className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-xs hover:text-text-primary transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <p className="text-xs text-text-secondary leading-relaxed">{c.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
              <div className="px-5 py-4 border-b border-border-primary">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Tag size={16} className="text-accent-green" /> Releases
                  {releases.length > 0 && <span className="text-[10px] text-text-muted font-normal">({releases.length})</span>}
                </h3>
              </div>
              <div className="p-4">
                {releases.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border-primary" />
                    <div className="space-y-0">
                      {releases.map((r, i) => (
                        <div key={r.id} className="relative flex gap-3 group">
                          <div className="relative z-10 shrink-0 mt-1">
                            <div className={cn('w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center text-[9px] font-bold',
                              i === 0 ? 'bg-accent-green/15 border-accent-green text-accent-green' : 'bg-bg-elevated border-border-primary text-text-muted')} />
                          </div>
                          <div className="flex-1 pb-4 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-accent-blue/15 text-accent-blue text-[10px] font-bold border border-accent-blue/20">v{r.version}</span>
                              {i === 0 && <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 text-[10px] font-bold border border-green-500/20">Latest</span>}
                              {r.is_prerelease && <span className="px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 text-[10px] font-bold border border-yellow-500/20">Pre-release</span>}
                            </div>
                            <h4 className="text-xs font-semibold text-text-primary mb-0.5">{r.title}</h4>
                            {r.body && <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap">{r.body}</p>}
                            {r.file_url && (!game.gamepass_id || gamepassVerified) ? (
                              <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-[11px] font-medium text-accent-blue hover:border-accent-blue/30 transition-all">
                                <Download size={11} /> {r.file_name || 'Download'} {r.file_size && <span className="text-text-muted">({r.file_size})</span>}
                              </a>
                            ) : r.file_url && game.gamepass_id && !gamepassVerified ? (
                              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-[11px] font-medium text-text-dim">
                                <Lock size={11} /> Purchase required
                              </span>
                            ) : null}
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-dim">
                              {r.author_username && <span>by {r.author_username}</span>}
                              <span>{timeAgo(r.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-2">No releases yet</p>
                )}
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
