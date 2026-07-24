import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Gamepad2, Package, FileText, Loader2, Trash2, Pencil,
  Save, X, Eye, Heart, ExternalLink, Search, RefreshCw, CheckCircle,
  XCircle, Clock, AlertTriangle, Plus, Tag, Download, Upload
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import {
  getOwnerExperiences, getOwnerSubmissions, getAssets,
  updateExperience, deleteExperience, updateAsset, deleteAsset,
  updateSubmission, deleteSubmission, getReleases, addRelease, deleteRelease,
  fetchGamepassInfo
} from '@/lib/api'
import { supabase } from '@/config/supabase'
import { formatNumber, cn } from '@/lib/utils'
import { toDirectImageUrl, uploadToGoogleDrive } from '@/lib/drive-upload'
import { useToast } from '@/components/ui/Toast'
import ImagePicker from '@/components/ui/ImagePicker'
import type { Experience, Submission, Asset, Release } from '@/lib/types'

type Tab = 'games' | 'submissions' | 'assets' | 'releases'

export default function Dashboard() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('games')
  const [loading, setLoading] = useState(true)

  if (!currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <LayoutDashboard size={48} className="mx-auto text-text-dim mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in required</h2>
        <p className="text-text-secondary text-sm mb-4">Sign in to manage your content.</p>
        <button onClick={() => navigate('/auth')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm">Sign In</button>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof Gamepad2 }[] = [
    { id: 'games', label: 'My Games', icon: Gamepad2 },
    { id: 'submissions', label: 'My Submissions', icon: FileText },
    { id: 'assets', label: 'My Assets', icon: Package },
    { id: 'releases', label: 'Releases', icon: Tag },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Dashboard</h1>
            <p className="text-xs text-text-muted">Manage your games, submissions & assets</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 p-1 bg-bg-secondary rounded-xl border border-border-primary overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  tab === t.id ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50')}>
                <Icon size={16} />{t.label}
              </button>
            )
          })}
        </div>

        {tab === 'games' && <GamesTab />}
        {tab === 'submissions' && <SubmissionsTab />}
        {tab === 'assets' && <AssetsTab />}
        {tab === 'releases' && <ReleasesTab />}
      </motion.div>
    </div>
  )
}

function GamesTab() {
  const { toast } = useToast()
  const [games, setGames] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Experience>>({})
  const [search, setSearch] = useState('')
  const [gpLoading, setGpLoading] = useState(false)
  const [gpStatus, setGpStatus] = useState<'idle' | 'ok' | 'warn'>('idle')

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getOwnerExperiences()
    setGames(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleEdit = (game: Experience) => {
    setEditing(game.id)
    setEditForm({ ...game })
  }

  const handleSave = async (id: string) => {
    try {
      const result = await updateExperience(id, editForm)
      if (result.partial) {
        toast('Saved! Run the SQL migration to save gamepass/images data.', 'success')
      } else {
        toast('Game updated!', 'success')
      }
      setEditing(null)
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to update', 'error')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deleteExperience(id)
      toast('Game deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to delete', 'error')
    }
  }

  const filtered = games.filter((g) => !search || g.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">My Games ({filtered.length})</h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your games..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
      </div>
      <div className="space-y-2">
        {filtered.map((game) => (
          <div key={game.id} className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
            {editing === game.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-accent-blue font-semibold">Editing</span>
                  <button onClick={() => setEditing(null)} className="p-1 rounded text-text-muted hover:text-text-primary"><X size={14} /></button>
                </div>
                <input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" placeholder="Title" />
                <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 resize-none" rows={2} placeholder="Description" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={editForm.video_url || ''} onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Video URL" />
                  <input value={editForm.game_url || ''} onChange={(e) => setEditForm({ ...editForm, game_url: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Game URL" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={editForm.download_url || ''} onChange={(e) => setEditForm({ ...editForm, download_url: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Download URL" />
                  <input value={editForm.price || 'Free'} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Price" />
                </div>
                <ImagePicker value={editForm.thumbnail_url || ''} onChange={(url) => setEditForm({ ...editForm, thumbnail_url: url })} folder="yobest/thumbnails" label="Thumbnail" />
                <div>
                  <input value={(editForm as any).gamepass_id || ''} onChange={(e) => {
                    const gpId = e.target.value
                    const updates: any = { ...editForm, gamepass_id: gpId }
                    if (gpId && (!editForm.price || editForm.price === 'Free')) {
                      updates.price = 'Gamepass Required'
                    } else if (!gpId && editForm.price === 'Gamepass Required') {
                      updates.price = 'Free'
                    }
                    setEditForm(updates)
                    setGpStatus('idle')
                  }} onBlur={async (e) => {
                    const gpId = (e.target as HTMLInputElement).value.trim()
                    if (!gpId) { setGpStatus('idle'); return }
                    setGpLoading(true)
                    setGpStatus('idle')
                    try {
                      const info = await fetchGamepassInfo(gpId)
                      if (info.exists && info.price != null && info.price > 0) {
                        setEditForm(prev => ({ ...prev, gamepass_id: gpId, price: `${info.price} Robux` }))
                        setGpStatus('ok')
                      } else if (info.exists && info.name) {
                        setEditForm(prev => ({ ...prev, gamepass_id: gpId, price: 'Gamepass Required' }))
                        setGpStatus('ok')
                      } else {
                        setEditForm(prev => ({ ...prev, gamepass_id: gpId, price: prev.price === 'Free' ? 'Gamepass Required' : prev.price || 'Gamepass Required' }))
                        setGpStatus('warn')
                      }
                    } catch {
                      setEditForm(prev => ({ ...prev, gamepass_id: gpId, price: prev.price === 'Free' ? 'Gamepass Required' : prev.price || 'Gamepass Required' }))
                      setGpStatus('warn')
                    }
                    setGpLoading(false)
                  }}
                    className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="GamePass ID (e.g. 12345678 or URL)" />
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
                <ImagePicker value="" onChange={() => {}} folder="yobest/thumbnails" label="Gallery Images" multiple values={(editForm as any).gallery_images || (editForm as any).images || []}
                  onMultipleChange={(urls) => setEditForm({ ...editForm, gallery_images: urls } as any)} maxImages={12} />
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-text-muted">
                    <input type="checkbox" checked={!!editForm.game_play} onChange={(e) => setEditForm({ ...editForm, game_play: e.target.checked })} className="rounded" /> Playable
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-text-muted">
                    <input type="checkbox" checked={!!editForm.download_enabled} onChange={(e) => setEditForm({ ...editForm, download_enabled: e.target.checked })} className="rounded" /> Download
                  </label>
                </div>
                <button onClick={() => handleSave(game.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                  <Save size={12} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-bg-tertiary shrink-0">
                  {game.thumbnail_url ? (
                    <img src={toDirectImageUrl(game.thumbnail_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Gamepad2 size={16} className="text-text-dim" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary truncate">{game.title}</div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span>{game.category}</span>
                    <span>{game.price}</span>
                    <span>{formatNumber(game.views_count || 0)} views</span>
                    <span>{formatNumber(game.likes_count || 0)} likes</span>
                    {game.created_at && <span className="text-text-dim">{new Date(game.created_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {game.game_url && <a href={game.game_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue transition-colors" title="Play"><ExternalLink size={14} /></a>}
                  <button onClick={() => handleEdit(game)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue transition-colors" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(game.id, game.title)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-text-muted text-center py-8">No games yet. Go to Games → Community to submit one!</p>}
      </div>
    </div>
  )
}

function SubmissionsTab() {
  const { toast } = useToast()
  const [subs, setSubs] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Submission>>({})
  const [subStats, setSubStats] = useState<Record<string, { likes: number; views: number }>>({})
  const [gpLoading, setGpLoading] = useState(false)
  const [gpStatus, setGpStatus] = useState<'idle' | 'ok' | 'warn'>('idle')

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getOwnerSubmissions()
    setSubs(data)
    // Fetch live stats for submissions
    if (data.length > 0) {
      try {
        const ids = data.map(s => s.id)
        const [likesRes, viewsRes] = await Promise.all([
          supabase.from('game_likes').select('game_id').in('game_id', ids),
          supabase.from('game_views').select('game_id').in('game_id', ids)
        ])
        const likeMap: Record<string, number> = {}
        const viewMap: Record<string, number> = {}
        ;(likesRes.data || []).forEach((l: any) => {
          likeMap[l.game_id] = (likeMap[l.game_id] || 0) + 1
        })
        ;(viewsRes.data || []).forEach((v: any) => {
          viewMap[v.game_id] = (viewMap[v.game_id] || 0) + 1
        })
        const stats: Record<string, { likes: number; views: number }> = {}
        ids.forEach(id => {
          stats[id] = { likes: likeMap[id] || 0, views: viewMap[id] || 0 }
        })
        setSubStats(stats)
      } catch {}
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleEdit = (sub: Submission) => {
    setEditing(sub.id)
    setEditForm({ ...sub })
  }

  const handleSave = async (id: string) => {
    try {
      const result = await updateSubmission(id, editForm)
      if (result.partial) {
        toast('Saved! Run the SQL migration to save gamepass/gallery data.', 'success')
      } else {
        toast('Submission updated!', 'success')
      }
      setEditing(null)
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to update', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return
    try {
      await deleteSubmission(id)
      toast('Deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to delete', 'error')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">My Submissions ({subs.length})</h2>
      <div className="space-y-2">
        {subs.map((sub) => (
          <div key={sub.id} className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
            {editing === sub.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-accent-blue font-semibold">Editing</span>
                  <button onClick={() => setEditing(null)} className="p-1 rounded text-text-muted hover:text-text-primary"><X size={14} /></button>
                </div>
                <input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" placeholder="Title" />
                <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 resize-none" rows={2} placeholder="Description" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={editForm.video_url || ''} onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Video URL" />
                  <input value={editForm.game_url || ''} onChange={(e) => setEditForm({ ...editForm, game_url: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Game URL" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={(editForm as any).price || 'Free'} onChange={(e) => setEditForm({ ...editForm, price: e.target.value } as any)}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Price" />
                  <div>
                    <input value={(editForm as any).gamepass_url || ''} onChange={(e) => {
                      const gpUrl = e.target.value
                      const updates: any = { ...editForm, gamepass_url: gpUrl }
                      if (gpUrl && (!editForm.price || editForm.price === 'Free')) {
                        updates.price = 'Gamepass Required'
                      } else if (!gpUrl && editForm.price === 'Gamepass Required') {
                        updates.price = 'Free'
                      }
                      setEditForm(updates)
                      setGpStatus('idle')
                    }} onBlur={async (e) => {
                      const gpUrl = (e.target as HTMLInputElement).value.trim()
                      if (!gpUrl) { setGpStatus('idle'); return }
                      setGpLoading(true)
                      setGpStatus('idle')
                      try {
                        const info = await fetchGamepassInfo(gpUrl)
                        if (info.exists && info.price != null && info.price > 0) {
                          setEditForm(prev => ({ ...prev, gamepass_url: gpUrl, price: `${info.price} Robux` }))
                          setGpStatus('ok')
                        } else if (info.exists && info.name) {
                          setEditForm(prev => ({ ...prev, gamepass_url: gpUrl, price: 'Gamepass Required' }))
                          setGpStatus('ok')
                        } else {
                          setEditForm(prev => ({ ...prev, gamepass_url: gpUrl, price: prev.price === 'Free' ? 'Gamepass Required' : prev.price || 'Gamepass Required' }))
                          setGpStatus('warn')
                        }
                      } catch {
                        setEditForm(prev => ({ ...prev, gamepass_url: gpUrl, price: prev.price === 'Free' ? 'Gamepass Required' : prev.price || 'Gamepass Required' }))
                        setGpStatus('warn')
                      }
                      setGpLoading(false)
                    }}
                      className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="GamePass ID (if paid)" />
                  </div>
                </div>
                {gpLoading && (
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <Loader2 size={10} className="animate-spin text-accent-blue" /> Verifying gamepass on Roblox...
                  </div>
                )}
                {!gpLoading && gpStatus === 'ok' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                    <CheckCircle size={10} /> Gamepass found! Price auto-filled.
                  </div>
                )}
                {!gpLoading && gpStatus === 'warn' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-yellow-400">
                    <AlertTriangle size={10} /> Could not verify — ID saved as-is.
                  </div>
                )}
                <ImagePicker value={editForm.thumbnail_url || ''} onChange={(url) => setEditForm({ ...editForm, thumbnail_url: url })} folder="yobest/thumbnails" label="Thumbnail" />
                <ImagePicker value="" onChange={() => {}} folder="yobest/thumbnails" label="Gallery Images" multiple values={(editForm as any).gallery_images || []}
                  onMultipleChange={(urls) => setEditForm({ ...editForm, gallery_images: urls } as any)} maxImages={8} />
                <button onClick={() => handleSave(sub.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                  <Save size={12} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-bg-tertiary shrink-0">
                  {sub.thumbnail_url ? (
                    <img src={toDirectImageUrl(sub.thumbnail_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FileText size={16} className="text-text-dim" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary truncate">{sub.title}</span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold',
                      sub.status === 'pending' && 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
                      sub.status === 'approved' && 'bg-green-500/15 text-green-400 border border-green-500/25',
                      sub.status === 'rejected' && 'bg-red-500/15 text-red-400 border border-red-500/25'
                    )}>{sub.status}</span>
                  </div>
                  {sub.rejection_reason && <p className="text-[10px] text-red-400 mt-0.5">Reason: {sub.rejection_reason}</p>}
                  <div className="text-[10px] text-text-muted">{sub.category} · {sub.price || 'Free'} · {formatNumber(subStats[sub.id]?.views || 0)} views · {formatNumber(subStats[sub.id]?.likes || 0)} likes</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(sub)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue transition-colors" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {subs.length === 0 && <p className="text-sm text-text-muted text-center py-8">No submissions yet.</p>}
      </div>
    </div>
  )
}

function AssetsTab() {
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Asset>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const user = await supabase.auth.getUser()
    if (user.data.user) {
      const { data } = await supabase.from('assets').select('*').eq('creator_id', user.data.user.id).order('created_at', { ascending: false })
      setAssets((data || []) as Asset[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleEdit = (asset: Asset) => {
    setEditing(asset.id)
    setEditForm({ ...asset })
  }

  const handleSave = async (id: string) => {
    try {
      await updateAsset(id, editForm)
      toast('Asset updated!', 'success')
      setEditing(null)
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to update', 'error')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deleteAsset(id)
      toast('Asset deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to delete', 'error')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">My Assets ({assets.length})</h2>
      <div className="space-y-2">
        {assets.map((asset) => (
          <div key={asset.id} className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
            {editing === asset.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-accent-blue font-semibold">Editing</span>
                  <button onClick={() => setEditing(null)} className="p-1 rounded text-text-muted hover:text-text-primary"><X size={14} /></button>
                </div>
                <input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" placeholder="Title" />
                <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 resize-none" rows={2} placeholder="Description" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={editForm.type || 'script'} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50">
                    <option value="script">Script</option>
                    <option value="model">Model</option>
                    <option value="uikit">UI Kit</option>
                  </select>
                  <input type="number" value={editForm.price_robux || 0} onChange={(e) => setEditForm({ ...editForm, price_robux: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Price (Robux)" />
                </div>
                <input value={editForm.drive_file_url || ''} onChange={(e) => setEditForm({ ...editForm, drive_file_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="Download URL" />
                <ImagePicker value={editForm.thumbnail_url || ''} onChange={(url) => setEditForm({ ...editForm, thumbnail_url: url })} folder="yobest/assets" label="Thumbnail" />
                <button onClick={() => handleSave(asset.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                  <Save size={12} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-bg-tertiary shrink-0">
                  {asset.thumbnail_url ? (
                    <img src={toDirectImageUrl(asset.thumbnail_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-text-dim" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary truncate">{asset.title}</div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span className="uppercase">{asset.type}</span>
                    <span>{asset.price_robux === 0 ? 'Free' : `${asset.price_robux} R$`}</span>
                    <span>{formatNumber(asset.downloads_count)} downloads</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(asset)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue transition-colors" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(asset.id, asset.title)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {assets.length === 0 && <p className="text-sm text-text-muted text-center py-8">No assets yet. Go to Marketplace to submit one!</p>}
      </div>
    </div>
  )
}

function ReleasesTab() {
  const { toast } = useToast()
  const currentUser = useStore((s) => s.currentUser)
  const [games, setGames] = useState<Experience[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTarget, setSelectedTarget] = useState<{ type: 'game' | 'asset'; id: string; title: string } | null>(null)
  const [releaseForm, setReleaseForm] = useState({ version: '', title: '', body: '', file_url: '', file_name: '', file_size: '', is_prerelease: false })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [ownerGames, ownerAssets] = await Promise.all([
      getOwnerExperiences(),
      supabase.from('assets').select('*').eq('creator_id', currentUser?.id || '').order('created_at', { ascending: false }).then(r => (r.data || []) as Asset[]),
    ])
    setGames(ownerGames)
    setAssets(ownerAssets)

    const allReleases: Release[] = []
    for (const g of ownerGames) {
      const r = await getReleases('game', g.id)
      allReleases.push(...r)
    }
    for (const a of ownerAssets) {
      const r = await getReleases('asset', a.id)
      allReleases.push(...r)
    }
    allReleases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setReleases(allReleases)
    setLoading(false)
  }, [currentUser])

  useEffect(() => { load() }, [load])

  const openCreateRelease = (type: 'game' | 'asset', id: string, title: string) => {
    setSelectedTarget({ type, id, title })
    setReleaseForm({ version: '', title: '', body: '', file_url: '', file_name: '', file_size: '', is_prerelease: false })
  }

  const handlePublishRelease = async () => {
    if (!selectedTarget || !releaseForm.version.trim() || !releaseForm.title.trim()) {
      toast('Version and title are required', 'error')
      return
    }
    setSaving(true)
    try {
      await addRelease({
        target_type: selectedTarget.type,
        target_id: selectedTarget.id,
        version: releaseForm.version,
        title: releaseForm.title,
        body: releaseForm.body,
        file_url: releaseForm.file_url,
        file_name: releaseForm.file_name,
        file_size: releaseForm.file_size,
        is_prerelease: releaseForm.is_prerelease,
      })
      toast('Release published!', 'success')
      setSelectedTarget(null)
      setReleaseForm({ version: '', title: '', body: '', file_url: '', file_name: '', file_size: '', is_prerelease: false })
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to publish release', 'error')
    }
    setSaving(false)
  }

  const handleDeleteRelease = async (id: string) => {
    if (!confirm('Delete this release?')) return
    try {
      await deleteRelease(id)
      toast('Release deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to delete', 'error')
    }
  }

  const getTargetTitle = (r: Release) => {
    if (r.target_type === 'game') {
      const g = games.find(g => g.id === r.target_id)
      return g?.title || 'Unknown Game'
    }
    const a = assets.find(a => a.id === r.target_id)
    return a?.title || 'Unknown Asset'
  }

  const allTargets = [
    ...games.map(g => ({ type: 'game' as const, id: g.id, title: g.title })),
    ...assets.map(a => ({ type: 'asset' as const, id: a.id, title: a.title })),
  ]

  const filteredTargets = allTargets.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
  const filteredReleases = releases.filter(r => {
    if (!search) return true
    const targetTitle = getTargetTitle(r).toLowerCase()
    return targetTitle.includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()) || r.version.toLowerCase().includes(search.toLowerCase())
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 100 * 1024 * 1024) { toast('File too large. Max 100MB.', 'error'); return }
    setUploadingFile(true)
    try {
      const result = await uploadToGoogleDrive(file, 'yobest/releases')
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setReleaseForm(f => ({ ...f, file_url: result.directLink, file_name: result.fileName, file_size: `${sizeMB} MB` }))
      toast('File uploaded!', 'success')
    } catch (err: any) {
      toast('Upload failed: ' + (err.message || 'Unknown error'), 'error')
    }
    setUploadingFile(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Releases ({filteredReleases.length})</h2>
          <p className="text-xs text-text-muted">Create and manage releases for your games and assets</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games, assets, or releases..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
      </div>

      {selectedTarget && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-bg-secondary border border-accent-green/25 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Tag size={14} className="text-accent-green" /> New Release for: <span className="text-accent-blue">{selectedTarget.title}</span>
            </h3>
            <button onClick={() => setSelectedTarget(null)} className="text-xs text-text-muted hover:text-text-primary"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-text-dim font-semibold uppercase tracking-wider block mb-1">Version *</label>
              <input value={releaseForm.version} onChange={e => setReleaseForm(f => ({ ...f, version: e.target.value }))} placeholder="v1.0.0"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[9px] text-text-dim font-semibold uppercase tracking-wider block mb-1">Title *</label>
              <input value={releaseForm.title} onChange={e => setReleaseForm(f => ({ ...f, title: e.target.value }))} placeholder="What's new in this release"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
          </div>
          <div>
            <label className="text-[9px] text-text-dim font-semibold uppercase tracking-wider block mb-1">Release Notes</label>
            <textarea value={releaseForm.body} onChange={e => setReleaseForm(f => ({ ...f, body: e.target.value }))} rows={4}
              placeholder="- Added new feature&#10;- Fixed bug in X&#10;- Improved performance"
              className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 resize-none font-mono text-xs" />
          </div>
          <div>
            <label className="text-[9px] text-text-dim font-semibold uppercase tracking-wider block mb-1">Attachment</label>
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden"
                accept=".lua,.luau,.txt,.rbxm,.rbxmx,.obj,.fbx,.json,.xml,.png,.jpg,.jpeg,.gif,.zip,.rar,.7z,.mp3,.wav,.mp4" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-border-primary hover:border-accent-green/50 hover:bg-accent-green/5 transition-all text-text-secondary hover:text-accent-green text-xs disabled:opacity-50">
                {uploadingFile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {releaseForm.file_name ? releaseForm.file_name : 'Upload File'}
              </button>
              {releaseForm.file_url && (
                <button onClick={() => setReleaseForm(f => ({ ...f, file_url: '', file_name: '', file_size: '' }))}
                  className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            {releaseForm.file_url && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="truncate">{releaseForm.file_name}</span>
                {releaseForm.file_size && <span className="text-green-400/60 shrink-0">({releaseForm.file_size})</span>}
              </div>
            )}
            <div className="mt-2">
              <p className="text-[9px] text-text-dim mb-1">Or paste a download link</p>
              <input value={releaseForm.file_url} onChange={e => setReleaseForm(f => ({ ...f, file_url: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-text-muted">
              <input type="checkbox" checked={releaseForm.is_prerelease} onChange={e => setReleaseForm(f => ({ ...f, is_prerelease: e.target.checked }))} className="rounded" /> Pre-release
            </label>
            <button onClick={handlePublishRelease} disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-accent-green text-white text-xs font-bold hover:bg-green-600 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Tag size={12} />} Publish Release
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider">Your Games & Assets — Create a Release</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredTargets.map(t => (
            <div key={`${t.type}-${t.id}`} className="flex items-center gap-2 p-3 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-elevated/50 transition-colors">
              <div className="shrink-0">
                {t.type === 'game' ? <Gamepad2 size={14} className="text-accent-blue" /> : <Package size={14} className="text-accent-purple" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">{t.title}</div>
                <div className="text-[10px] text-text-muted capitalize">{t.type}</div>
              </div>
              <button onClick={() => openCreateRelease(t.type, t.id, t.title)}
                className="px-2.5 py-1 rounded-lg bg-accent-green/15 text-accent-green text-[10px] font-bold border border-accent-green/25 hover:bg-accent-green/25 transition-colors shrink-0 flex items-center gap-1">
                <Plus size={10} /> Release
              </button>
            </div>
          ))}
          {filteredTargets.length === 0 && <p className="text-xs text-text-muted text-center py-4 col-span-full">No games or assets found</p>}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider">All Releases</h3>
        {filteredReleases.length > 0 ? (
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border-primary" />
            <div className="space-y-0">
              {filteredReleases.map((r, i) => (
                <div key={r.id} className="relative flex gap-3 group">
                  <div className="relative z-10 shrink-0 mt-1">
                    <div className={cn('w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center text-[9px] font-bold',
                      i === 0 ? 'bg-accent-green/15 border-accent-green text-accent-green' : 'bg-bg-elevated border-border-primary text-text-muted')}>
                      {r.target_type === 'game' ? <Gamepad2 size={12} /> : <Package size={12} />}
                    </div>
                  </div>
                  <div className="flex-1 pb-4 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-accent-blue/15 text-accent-blue text-[10px] font-bold border border-accent-blue/20">v{r.version}</span>
                      {i === 0 && <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 text-[10px] font-bold border border-green-500/20">Latest</span>}
                      {r.is_prerelease && <span className="px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 text-[10px] font-bold border border-yellow-500/20">Pre</span>}
                      <span className="text-[9px] text-text-dim capitalize px-1.5 py-0.5 rounded bg-bg-elevated border border-border-primary">{r.target_type}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-text-primary">{r.title}</h4>
                    <p className="text-[10px] text-accent-blue/70 font-medium">{getTargetTitle(r)}</p>
                    {r.body && <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap mt-1">{r.body}</p>}
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-primary text-[10px] font-medium text-accent-blue hover:border-accent-blue/30 transition-all">
                        <Download size={10} /> {r.file_name || 'Download'} {r.file_size && <span className="text-text-dim">({r.file_size})</span>}
                      </a>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-dim">
                      {r.author_username && <span>by {r.author_username}</span>}
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      <button onClick={() => handleDeleteRelease(r.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-text-dim hover:text-red-400 transition-all"><Trash2 size={11} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center py-8">No releases yet. Create one above!</p>
        )}
      </div>
    </div>
  )
}
