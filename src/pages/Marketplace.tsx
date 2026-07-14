import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Search, Star, Download, Code, Box, Palette, X, Loader2, Plus, Upload } from 'lucide-react'
import { getAssets, submitAsset } from '@/lib/api'
import { toDirectImageUrl, uploadToGoogleDrive } from '@/lib/drive-upload'
import ImagePicker from '@/components/ui/ImagePicker'
import { useStore } from '@/store/useStore'
import type { Asset } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import AdBanner from '@/components/AdBanner'

const typeIcons = { script: Code, model: Box, uikit: Palette }
const typeLabels = { script: 'Script', model: 'Model', uikit: 'UI Kit' }

function AssetCard({ asset }: { asset: Asset }) {
  const Icon = typeIcons[asset.type]
  const isFree = asset.price_robux === 0
  const thumbnailSrc = asset.thumbnail_url ? toDirectImageUrl(asset.thumbnail_url) : ''

  return (
    <div className="rounded-xl bg-bg-secondary border border-border-primary overflow-hidden card-hover group">
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
        <h3 className="text-sm font-semibold text-text-primary line-clamp-1 mb-1">{asset.title}</h3>
        <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">{asset.description}</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-text-primary">{asset.rating || 0}</span>
          </div>
          <span className="text-xs text-text-muted">·</span>
          <div className="flex items-center gap-1 text-text-muted">
            <Download size={11} />
            <span className="text-xs">{asset.downloads_count || 0}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {isFree ? (
            <span className="text-sm font-bold text-green-400">Free</span>
          ) : (
            <span className="text-sm font-bold text-yellow-400">{asset.price_robux} Robux</span>
          )}
          <button className="px-3 py-1.5 rounded-lg bg-accent-blue/15 text-accent-blue text-xs font-semibold hover:bg-accent-blue/25 transition-colors">
            {isFree ? 'Download' : 'Get Asset'}
          </button>
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
  const [submitForm, setSubmitForm] = useState({ title: '', description: '', type: 'script' as 'script' | 'model' | 'uikit', price: '0', imageUrl: '', gamepassUrl: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [assetFileUrl, setAssetFileUrl] = useState('')
  const assetFileRef = useRef<HTMLInputElement>(null)
  const currentUser = useStore((s) => s.currentUser)
  const navigate = useNavigate()

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
      })
      setSubmitSuccess(true)
      setTimeout(() => {
        setShowSubmit(false)
        setSubmitSuccess(false)
        setSubmitForm({ title: '', description: '', type: 'script', price: '0', imageUrl: '', gamepassUrl: '' })
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
            <div className="flex gap-1.5">
              {(['all', 'script', 'model', 'uikit'] as const).map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                    typeFilter === t ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25' : 'bg-bg-secondary text-text-secondary border border-border-primary hover:border-border-hover')}>
                  {t === 'all' ? 'All Types' : typeLabels[t] + 's'}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
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
            {filtered.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
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
              <div className="p-12 text-center">
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
                    <input type="text" value={submitForm.gamepassUrl} onChange={(e) => setSubmitForm({ ...submitForm, gamepassUrl: e.target.value })}
                      placeholder="e.g. 12345678"
                      className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
                    <p className="text-[10px] text-text-dim mt-1">Numeric gamepass ID — buyers must own this</p>
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
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Asset File (optional)</label>
                  <p className="text-[10px] text-text-dim mb-2">Upload your script, model, or UI kit file (max 100MB)</p>
                  <input type="file" accept=".lua,.luau,.rbxm,.rbxmx,.rbxmx,.json,.xml,.zip,.rar,.7z,.txt" onChange={handleAssetFileUpload} className="hidden" ref={assetFileRef} />
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
    </div>
  )
}
