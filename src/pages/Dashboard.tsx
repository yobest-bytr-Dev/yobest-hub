import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Gamepad2, Package, FileText, Loader2, Trash2, Pencil,
  Save, X, Eye, Heart, ExternalLink, Search, RefreshCw, CheckCircle,
  XCircle, Clock, AlertTriangle, Plus
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import {
  getOwnerExperiences, getOwnerSubmissions, getAssets,
  updateExperience, deleteExperience, updateAsset, deleteAsset,
  updateSubmission, deleteSubmission
} from '@/lib/api'
import { supabase } from '@/config/supabase'
import { formatNumber, cn } from '@/lib/utils'
import { toDirectImageUrl } from '@/lib/drive-upload'
import { useToast } from '@/components/ui/Toast'
import ImagePicker from '@/components/ui/ImagePicker'
import type { Experience, Submission, Asset } from '@/lib/types'

type Tab = 'games' | 'submissions' | 'assets'

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
      await updateExperience(id, editForm)
      toast('Game updated!', 'success')
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
                <input value={(editForm as any).gamepass_id || ''} onChange={(e) => setEditForm({ ...editForm, gamepass_id: e.target.value } as any)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="GamePass ID (if paid)" />
                <ImagePicker value="" onChange={() => {}} folder="yobest/thumbnails" label="Gallery Images" multiple values={(editForm as any).images || []}
                  onMultipleChange={(urls) => setEditForm({ ...editForm, images: urls } as any)} maxImages={12} />
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

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getOwnerSubmissions()
    setSubs(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleEdit = (sub: Submission) => {
    setEditing(sub.id)
    setEditForm({ ...sub })
  }

  const handleSave = async (id: string) => {
    try {
      await updateSubmission(id, editForm)
      toast('Submission updated!', 'success')
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
                <input value={(editForm as any).gamepass_url || ''} onChange={(e) => setEditForm({ ...editForm, gamepass_url: e.target.value } as any)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-xs focus:outline-none focus:border-accent-blue/50" placeholder="GamePass ID (if paid)" />
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
                  <div className="text-[10px] text-text-muted">{sub.category} · {sub.price || 'Free'}</div>
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
