import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, Download, Code, Box, Palette, X, Loader2, Plus, Upload, ExternalLink, Calendar, Tag, ShieldCheck, ShoppingCart, Lock, CheckCircle, AlertTriangle } from 'lucide-react'
import { getAssets, submitAsset, submitAssetReview, getUserAssetReview, getAssetReviewsStats, getReleases, verifyGamepassOwnership, isGamepassVerified, fetchGamepassInfo } from '@/lib/api'
import { toDirectImageUrl, uploadToGoogleDrive } from '@/lib/drive-upload'
import { trackAssetDownload } from '@/lib/analytics'
import ImagePicker from '@/components/ui/ImagePicker'
import StarRating from '@/components/ui/StarRating'
import { useStore } from '@/store/useStore'
import type { Asset, Release } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import AdBanner from '@/components/AdBanner'

const typeIcons = { script: Code, model: Box, uikit: Palette }
const typeLabels = { script: 'Script', model: 'Model', uikit: 'UI Kit' }

function AssetDetailModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const Icon = typeIcons[asset.type]
  const isFree = asset.price_robux === 0
  const thumbnailSrc = asset.thumbnail_url ? toDirectImageUrl(asset.thumbnail_url) : ''
  const currentUser = useStore((s) => s.currentUser)
  const navigate = useNavigate()

  const [reviewStats, setReviewStats] = useState({ avg: asset.rating || 0, count: asset.rating_count || 0 })
  const [myReview, setMyReview] = useState<{ rating: number; comment: string } | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [localDownloads, setLocalDownloads] = useState(asset.downloads_count || 0)
  const [releases, setReleases] = useState<Release[]>([])
  const [gamepassVerified, setGamepassVerified] = useState(false)
  const [verifyingPurchase, setVerifyingPurchase] = useState(false)

  useEffect(() => {
    getAssetReviewsStats(asset.id).then(setReviewStats)
    getUserAssetReview(asset.id).then(setMyReview)
    getReleases('asset', asset.id).then(setReleases)
    if (asset.gamepass_id && currentUser) {
      isGamepassVerified(asset.gamepass_id).then(setGamepassVerified)
    }
  }, [asset.id, currentUser])

  const handleDownload = async () => {
    setLocalDownloads(prev => prev + 1)
    trackAssetDownload(asset.id)
  }

  const handleVerifyPurchase = async () => {
    if (!currentUser) { navigate('/auth'); return }
    if (!asset.gamepass_id) return
    setVerifyingPurchase(true)
    try {
      const result = await verifyGamepassOwnership(asset.gamepass_id)
      if (result.verified) {
        setGamepassVerified(true)
      } else {
        alert(result.error || 'Could not verify purchase')
      }
    } catch { alert('Verification failed.') }
    setVerifyingPurchase(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="relative aspect-video bg-gradient-to-br from-bg-tertiary to-bg-elevated shrink-0">
          {thumbnailSrc ? (
            <img src={thumbnailSrc} alt={asset.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Icon size={48} className="text-text-dim" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <X size={16} />
          </button>
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-bg-elevated/90 border border-border-primary text-[11px] font-medium text-text-secondary backdrop-blur-sm">{typeLabels[asset.type]}</span>
            {isFree && <span className="px-2 py-1 rounded-md bg-green-500/90 text-white text-xs font-bold">FREE</span>}
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-lg font-bold text-white mb-1">{asset.title}</h2>
          </div>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <p className="text-sm text-text-secondary leading-relaxed">{asset.description || 'No description provided.'}</p>

          {(() => {
            const gallery = asset.gallery_images || []
            return gallery.length > 0 ? (
              <div>
                <h4 className="text-[11px] font-semibold text-text-muted mb-2 uppercase tracking-wide">Gallery</h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {gallery.map((img, i) => (
                    <a key={i} href={toDirectImageUrl(img)} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-bg-tertiary border border-border-primary hover:border-accent-blue/30 transition-all group">
                      <img src={toDirectImageUrl(img)} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null
          })()}

          <div className="flex items-center gap-4 text-xs text-text-muted">
            <StarRating rating={reviewStats.avg} count={reviewStats.count} size={12} />
            <span className="flex items-center gap-1"><Download size={12} /> {localDownloads} downloads</span>
            {asset.created_at && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(asset.created_at).toLocaleDateString()}</span>}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border-primary">
            {isFree ? (
              <span className="text-lg font-bold text-green-400">Free</span>
            ) : (
              <span className="text-lg font-bold text-yellow-400">{asset.price_robux} Robux</span>
            )}
            <div className="flex-1" />
            {asset.drive_file_url && (!asset.gamepass_id || gamepassVerified) ? (
              <a href={asset.drive_file_url} target="_blank" rel="noopener noreferrer" onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-accent-blue/20">
                <Download size={14} /> {isFree ? 'Download' : 'Get Asset'} <ExternalLink size={11} />
              </a>
            ) : asset.gamepass_id && !gamepassVerified ? (
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-sm font-medium">
                <Lock size={14} /> Purchase required to download
              </span>
            ) : (
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-dim text-sm font-medium">
                <Download size={14} /> No file available
              </span>
            )}
          </div>

          {asset.gamepass_id && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-purple-400 font-medium">GamePass Required</p>
                {gamepassVerified && <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium"><ShieldCheck size={10} /> Verified</span>}
              </div>
              <p className="text-xs text-text-secondary mb-2">You must own GamePass #{asset.gamepass_id} to download</p>
              <div className="flex items-center gap-2 flex-wrap">
                <a href={`https://www.roblox.com/game-pass/${asset.gamepass_id}/`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 text-black text-[11px] font-bold hover:bg-yellow-400 transition-colors">
                  <ShoppingCart size={12} /> Buy Gamepass
                </a>
                {currentUser ? (
                  gamepassVerified ? null : (
                    <button onClick={handleVerifyPurchase} disabled={verifyingPurchase}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-[11px] font-semibold hover:border-accent-blue/30 disabled:opacity-50 transition-all">
                      {verifyingPurchase ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Verify
                    </button>
                  )
                ) : (
                  <button onClick={() => navigate('/auth')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-[11px] font-semibold hover:border-accent-blue/30 transition-all">
                    <Lock size={12} /> Sign in
                  </button>
                )}
              </div>
            </div>
          )}

          {releases.length > 0 && (
            <div className="p-3 rounded-lg bg-bg-elevated border border-border-primary">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={12} className="text-accent-green" />
                <p className="text-[11px] text-accent-green font-semibold">Releases ({releases.length})</p>
              </div>
              <div className="relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border-primary" />
                <div className="space-y-0">
                  {releases.slice(0, 5).map((r, i) => (
                    <div key={r.id} className="relative flex gap-2.5 group">
                      <div className="relative z-10 shrink-0 mt-0.5">
                        <div className={cn('w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-[8px] font-bold',
                          i === 0 ? 'bg-accent-green/15 border-accent-green text-accent-green' : 'bg-bg-secondary border-border-primary text-text-muted')} />
                      </div>
                      <div className="flex-1 pb-3 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-accent-blue/15 text-accent-blue text-[9px] font-bold">v{r.version}</span>
                          {i === 0 && <span className="px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 text-[9px] font-bold">Latest</span>}
                        </div>
                        <p className="text-[11px] font-semibold text-text-primary">{r.title}</p>
                        {r.body && <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5 whitespace-pre-wrap">{r.body}</p>}
                        {r.file_url && (!asset.gamepass_id || gamepassVerified) ? (
                          <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded bg-bg-elevated border border-border-primary text-[9px] font-medium text-accent-blue hover:border-accent-blue/30 transition-all">
                            <Download size={9} /> {r.file_name || 'Download'} {r.file_size && <span className="text-text-dim">({r.file_size})</span>}
                          </a>
                        ) : r.file_url && asset.gamepass_id && !gamepassVerified ? (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded bg-bg-elevated border border-border-primary text-[9px] font-medium text-text-dim">
                            <Lock size={9} /> Purchase required
                          </span>
                        ) : null}
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-text-dim">
                          {r.author_username && <span>by {r.author_username}</span>}
                          <span>{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-border-primary">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-text-primary">{myReview ? 'Your Rating' : 'Rate this Asset'}</h4>
              {!showReviewForm && !myReview && currentUser && (
                <button onClick={() => { setShowReviewForm(true); setReviewRating(0); setReviewComment('') }}
                  className="text-xs text-accent-blue hover:underline">Rate it</button>
              )}
            </div>
            {myReview && !showReviewForm && (
              <div>
                <StarRating rating={myReview.rating} size={18} />
                {myReview.comment && <p className="text-xs text-text-secondary mt-2">{myReview.comment}</p>}
                {currentUser && (
                  <button onClick={() => { setShowReviewForm(true); setReviewRating(myReview.rating); setReviewComment(myReview.comment || '') }}
                    className="text-[11px] text-text-muted hover:text-accent-blue mt-2">Edit your rating</button>
                )}
              </div>
            )}
            {showReviewForm && (
              <form onSubmit={async (e) => {
                e.preventDefault()
                if (!reviewRating) return
                setReviewSubmitting(true)
                try {
                  await submitAssetReview(asset.id, reviewRating, reviewComment)
                  setMyReview({ rating: reviewRating, comment: reviewComment })
                  getAssetReviewsStats(asset.id).then(setReviewStats)
                  setShowReviewForm(false)
                } catch { alert('Failed to save rating. Make sure you are signed in.') }
                finally { setReviewSubmitting(false) }
              }} className="space-y-3">
                <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={24} />
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2}
                  placeholder="Optional comment..."
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none" />
                <div className="flex gap-2">
                  <button type="submit" disabled={!reviewRating || reviewSubmitting}
                    className="px-4 py-2 rounded-xl bg-accent-blue text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2">
                    {reviewSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit'}
                  </button>
                  <button type="button" onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 rounded-xl bg-bg-elevated text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors">Cancel</button>
                </div>
              </form>
            )}
            {!currentUser && !myReview && (
              <button onClick={() => navigate('/auth')} className="text-xs text-accent-blue hover:underline">Sign in to rate</button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function AssetCard({ asset, onClick }: { asset: Asset; onClick: () => void }) {
  const Icon = typeIcons[asset.type]
  const isFree = asset.price_robux === 0
  const thumbnailSrc = asset.thumbnail_url ? toDirectImageUrl(asset.thumbnail_url) : ''

  return (
    <div className="rounded-xl bg-bg-secondary border border-border-primary overflow-hidden card-hover group cursor-pointer" onClick={onClick}>
      <div className="aspect-[4/3] bg-gradient-to-br from-bg-tertiary to-bg-elevated flex items-center justify-center relative">
        {thumbnailSrc ? (
          <img src={thumbnailSrc} alt={asset.title} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <Icon size={40} className="text-text-dim" />
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-md bg-bg-elevated/90 border border-border-primary text-[11px] font-medium text-text-secondary backdrop-blur-sm">
            {typeLabels[asset.type]}
          </span>
        </div>
        {isFree && <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-green-500/90 text-white text-xs font-bold">FREE</div>}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-1 mb-1 group-hover:text-accent-blue transition-colors">{asset.title}</h3>
        <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">{asset.description}</p>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={asset.rating || 0} count={asset.rating_count || 0} size={12} />
          <span className="text-xs text-text-muted flex items-center gap-1"><Download size={11} /> {asset.downloads_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          {isFree ? (
            <span className="text-sm font-bold text-green-400">Free</span>
          ) : (
            <span className="text-sm font-bold text-yellow-400">{asset.price_robux} Robux</span>
          )}
          {asset.drive_file_url && isFree ? (
            <a href={asset.drive_file_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg bg-accent-blue/15 text-accent-blue text-xs font-semibold hover:bg-accent-blue/25 transition-colors flex items-center gap-1">
              <Download size={12} /> Download
            </a>
          ) : asset.drive_file_url && !isFree ? (
            <button onClick={e => { e.stopPropagation(); onClick() }}
              className="px-3 py-1.5 rounded-lg bg-yellow-500/15 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/25 transition-colors flex items-center gap-1">
              <ShoppingCart size={12} /> Buy to Download
            </button>
          ) : (
            <button onClick={e => { e.stopPropagation(); onClick() }}
              className="px-3 py-1.5 rounded-lg bg-accent-blue/15 text-accent-blue text-xs font-semibold hover:bg-accent-blue/25 transition-colors">
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Marketplace() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'script' | 'model' | 'uikit'>('all')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitForm, setSubmitForm] = useState({ title: '', description: '', type: 'script' as 'script' | 'model' | 'uikit', price: '0', imageUrl: '', gamepassUrl: '', galleryImages: [] as string[] })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [assetFileUrl, setAssetFileUrl] = useState('')
  const [gpLoading, setGpLoading] = useState(false)
  const [gpStatus, setGpStatus] = useState<'idle' | 'ok' | 'warn'>('idle')
  const assetFileRef = useRef<HTMLInputElement>(null)
  const currentUser = useStore((s) => s.currentUser)
  const navigate = useNavigate()
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  useEffect(() => {
    getAssets().then((data) => {
      setAssets(data)
      setLoading(false)
    })
  }, [])

  const filtered = assets.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && a.type !== typeFilter) return false
    if (priceFilter === 'free' && a.price_robux !== 0) return false
    if (priceFilter === 'paid' && a.price_robux === 0) return false
    return true
  })

  const handleAssetFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 100 * 1024 * 1024) { alert('File too large. Maximum 100MB.'); return }
    setUploadingFile(true)
    try {
      const result = await uploadToGoogleDrive(file, 'yobest/assets')
      setAssetFileUrl(result.directLink)
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'))
    }
    setUploadingFile(false)
    if (assetFileRef.current) assetFileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { navigate('/auth'); return }
    setSubmitting(true)
    try {
      await submitAsset({
        title: submitForm.title,
        description: submitForm.description,
        type: submitForm.type,
        price_robux: parseInt(submitForm.price) || 0,
        thumbnail_url: submitForm.imageUrl || undefined,
        gamepass_id: submitForm.gamepassUrl || undefined,
        drive_file_url: assetFileUrl || undefined,
        gallery_images: submitForm.galleryImages.length > 0 ? submitForm.galleryImages : undefined,
      })
      setSubmitSuccess(true)
      setTimeout(() => {
        setShowSubmit(false)
        setSubmitSuccess(false)
        setSubmitForm({ title: '', description: '', type: 'script', price: '0', imageUrl: '', gamepassUrl: '', galleryImages: [] })
        setAssetFileUrl('')
        getAssets().then(setAssets)
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
            Asset <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-text-secondary text-lg">Scripts, models, and UI kits for your Roblox games</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X size={14} /></button>
            )}
          </div>
          <button onClick={() => { if (!currentUser) { navigate('/auth'); return } setShowSubmit(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors shrink-0">
            <Plus size={16} /> Submit Asset
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'script', 'model', 'uikit'] as const).map((t) => {
                const count = t === 'all' ? assets.length : assets.filter(a => a.type === t).length
                return (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                      typeFilter === t ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25' : 'bg-bg-secondary text-text-secondary border border-border-primary hover:border-border-hover')}>
                    {t === 'all' ? 'All Types' : typeLabels[t] + 's'} <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'free', 'paid'] as const).map((p) => (
                <button key={p} onClick={() => setPriceFilter(p)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    priceFilter === p ? 'bg-accent-green/15 text-accent-green border border-accent-green/25' : 'bg-bg-secondary text-text-secondary border border-border-primary hover:border-border-hover')}>
                  {p === 'all' ? 'All Prices' : p === 'free' ? 'Free' : 'Paid'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-sm text-text-muted mb-4">Showing {filtered.length} assets</div>

        <div className="flex justify-center mb-6">
          <AdBanner type="leaderboard" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-accent-blue" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((asset) => <AssetCard key={asset.id} asset={asset} onClick={() => setSelectedAsset(asset)} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto mb-4 text-text-dim" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No assets found</h3>
            <p className="text-text-secondary text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <AdBanner type="fluid" />
        </div>
      </motion.div>

      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !submitting && setShowSubmit(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
              <h2 className="text-lg font-bold text-text-primary">Submit Asset</h2>
              <button onClick={() => !submitting && setShowSubmit(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
                  <Download size={24} className="text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Asset Submitted!</h3>
                <p className="text-sm text-text-secondary">Your asset is being checked by our team. Track status in My Dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Asset Title *</label>
                  <input type="text" required value={submitForm.title} onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    placeholder="My Awesome Script" className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Description *</label>
                  <textarea required rows={3} value={submitForm.description} onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                    placeholder="Describe your asset, what it does, how to use it..." className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Asset Type *</label>
                  <div className="flex gap-2">
                    {(['script', 'model', 'uikit'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setSubmitForm({ ...submitForm, type: t })}
                        className={cn('flex-1 px-3 py-2 rounded-xl border text-xs font-medium transition-all capitalize',
                          submitForm.type === t ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/25' : 'bg-bg-elevated text-text-secondary border-border-primary hover:border-border-hover')}>
                        {typeLabels[t]}
                      </button>
                    ))}
                  </div>
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
                    <div>
                      <input type="text" value={submitForm.gamepassUrl} onChange={(e) => {
                        const gpUrl = e.target.value
                        const updates = { ...submitForm, gamepassUrl: gpUrl }
                        if (gpUrl && (!submitForm.price || submitForm.price === '0')) {
                          updates.price = '1'
                        } else if (!gpUrl && submitForm.price !== '0') {
                          updates.price = '0'
                        }
                        setSubmitForm(updates)
                        setGpStatus('idle')
                      }} onBlur={async (e) => {
                        const gpUrl = e.target.value.trim()
                        if (!gpUrl) { setGpStatus('idle'); return }
                        setGpLoading(true)
                        setGpStatus('idle')
                        try {
                          const info = await fetchGamepassInfo(gpUrl)
                          if (info.exists && info.price != null && info.price > 0) {
                            setSubmitForm(prev => ({ ...prev, gamepassUrl: gpUrl, price: String(info.price) }))
                            setGpStatus('ok')
                          } else if (info.exists && info.name) {
                            setSubmitForm(prev => ({ ...prev, gamepassUrl: gpUrl, price: prev.price === '0' ? '1' : prev.price }))
                            setGpStatus('ok')
                          } else {
                            setSubmitForm(prev => ({ ...prev, gamepassUrl: gpUrl }))
                            setGpStatus('warn')
                          }
                        } catch {
                          setSubmitForm(prev => ({ ...prev, gamepassUrl: gpUrl }))
                          setGpStatus('warn')
                        }
                        setGpLoading(false)
                      }}
                        placeholder="e.g. 12345678"
                        className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
                    </div>
                    <p className="text-[10px] text-text-dim mt-1">Numeric gamepass ID — buyers must own this</p>
                    {gpLoading && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-text-muted">
                        <Loader2 size={10} className="animate-spin text-accent-blue" /> Verifying gamepass on Roblox...
                      </div>
                    )}
                    {!gpLoading && gpStatus === 'ok' && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-green-400">
                        <CheckCircle size={10} /> Gamepass found! Price auto-filled.
                      </div>
                    )}
                    {!gpLoading && gpStatus === 'warn' && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-yellow-400">
                        <AlertTriangle size={10} /> Could not verify — ID saved as-is.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <ImagePicker
                    value={submitForm.imageUrl}
                    onChange={(url) => setSubmitForm({ ...submitForm, imageUrl: url })}
                    folder="yobest/assets"
                    label="Thumbnail Image"
                  />
                </div>
                <div>
                  <ImagePicker value="" onChange={() => {}} folder="yobest/assets" label="Gallery Images (optional)" multiple values={submitForm.galleryImages}
                    onMultipleChange={(urls) => setSubmitForm({ ...submitForm, galleryImages: urls })} maxImages={8} />
                </div>
                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Asset File (optional)</label>
                  <p className="text-[10px] text-text-dim mb-2">Upload your script, model, or UI kit file (max 100MB)</p>
                  <input type="file" accept={
                    submitForm.type === 'script' ? '.lua,.luau,.txt' :
                    submitForm.type === 'model' ? '.rbxm,.rbxmx,.obj,.fbx' :
                    '.json,.xml,.lua,.luau,.png,.jpg'
                  } onChange={handleAssetFileUpload} className="hidden" ref={assetFileRef} />
                  <button type="button" onClick={() => assetFileRef.current?.click()} disabled={uploadingFile}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border-primary hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all text-text-secondary hover:text-accent-blue text-sm">
                    {uploadingFile ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {assetFileUrl ? 'File uploaded - click to change' : 'Upload Asset File'}
                  </button>
                  {assetFileUrl && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      File uploaded successfully
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-[10px] text-text-dim mb-1.5">Or paste a download link</p>
                    <input type="url" value={assetFileUrl} onChange={(e) => setAssetFileUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or https://mega.nz/..."
                      className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Asset'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {selectedAsset && <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
      </AnimatePresence>
    </div>
  )
}
