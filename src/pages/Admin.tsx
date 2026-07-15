import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Users, Gamepad2, FileText, BarChart3, Settings, Loader2, Trash2,
  UserCheck, UserX, Search, Eye, Heart, MessageSquare, Download, CheckCircle,
  XCircle, ExternalLink, ArrowLeft, Crown, Mail, Calendar, TrendingUp, RefreshCw,
  Wrench, Plus, Clock, Sparkles, Save, Upload, Ban, ShieldOff, ImagePlus, Tag
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { supabase } from '@/config/supabase'
import { formatNumber, cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import RobloxAvatar from '@/components/ui/RobloxAvatar'
import { uploadToGoogleDrive, toDirectImageUrl } from '@/lib/drive-upload'
import ImagePicker from '@/components/ui/ImagePicker'

const ADMIN_USERNAME = 'ByocefS'

interface AdminUser {
  id: string
  email: string
  username?: string
  created_at: string
  last_sign_in_at?: string
  banned_until?: string
  profile?: any
}

type Tab = 'dashboard' | 'users' | 'submissions' | 'games' | 'tools' | 'settings'

export default function Admin() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')

  useEffect(() => {
    if (currentUser) {
      const admin = currentUser.is_admin || currentUser.username?.toLowerCase() === 'byocefs'
      setIsAdmin(admin)
      setLoading(false)
    }
  }, [currentUser])

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent-blue" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <Shield size={48} className="mx-auto text-text-dim mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in required</h2>
        <p className="text-text-secondary text-sm mb-4">You must be signed in to access the admin panel.</p>
        <button onClick={() => navigate('/auth')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity">Sign In</button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <Shield size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Access Denied</h2>
        <p className="text-text-secondary text-sm mb-4">You don't have admin privileges.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl bg-bg-elevated border border-border-primary text-text-primary font-semibold text-sm hover:border-accent-blue/30 transition-all">Go Home</button>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof Shield }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Panel</h1>
            <p className="text-xs text-text-muted">Manage your platform</p>
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

        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'submissions' && <SubmissionsTab />}
        {tab === 'games' && <GamesTab />}
        {tab === 'tools' && <ToolsTab />}
        {tab === 'settings' && <SettingsTab />}
      </motion.div>
    </div>
  )
}

function apiCall(action: string, data: Record<string, any> = {}) {
  const { data: { session } } = (supabase as any).auth?.getSession ? { data: { session: null } } : { data: { session: null } }
  return supabase.auth.getSession().then(({ data: { session } }) => {
    return fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action, ...data }),
    }).then((r) => r.json())
  })
}

function DashboardTab() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiCall('get_all_stats')
      if (!data.error) {
        setCounts(data.counts || {})
        setStats(data.stats || [])
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  const statCards = [
    { label: 'Total Users', value: counts.profiles || 0, icon: Users, color: 'text-accent-blue' },
    { label: 'Games', value: counts.experiences || 0, icon: Gamepad2, color: 'text-accent-green' },
    { label: 'Submissions', value: counts.submissions || 0, icon: FileText, color: 'text-accent-purple' },
    { label: 'Assets', value: counts.assets || 0, icon: Download, color: 'text-accent-orange' },
    { label: 'Messages', value: counts.messages || 0, icon: MessageSquare, color: 'text-accent-pink' },
    { label: 'AI Chats', value: counts.ai_chats || 0, icon: TrendingUp, color: 'text-yellow-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Overview</h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
              <Icon size={18} className={cn(s.color, 'mb-2')} />
              <div className="text-2xl font-bold text-text-primary">{formatNumber(s.value)}</div>
              <div className="text-xs text-text-muted">{s.label}</div>
            </div>
          )
        })}
      </div>

      {stats.length > 0 && (
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Site Stats</h3>
          <div className="space-y-2">
            {stats.map((s: any) => (
              <div key={s.id || s.name} className="flex justify-between text-xs">
                <span className="text-text-muted">{s.name}</span>
                <span className="text-text-primary font-medium">{formatNumber(s.value || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiCall('list_users')
      if (!data.error) {
        setUsers(data.users || [])
        setProfiles(data.profiles || [])
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    try {
      const data = await apiCall('delete_user', { userId })
      if (data.error) throw new Error(data.error)
      toast(`Deleted ${username}`, 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to delete', 'error')
    }
  }

  const handleToggleAdmin = async (userId: string, currentAdmin: boolean) => {
    try {
      const data = await apiCall('set_admin', { userId, isAdmin: !currentAdmin })
      if (data.error) throw new Error(data.error)
      toast(currentAdmin ? 'Removed admin' : 'Made admin', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const handleBan = async (userId: string, username: string, currentlyBanned: boolean) => {
    if (currentlyBanned) {
      if (!confirm(`Unban "${username}"?`)) return
      try {
        const { error } = await supabase.from('profiles').update({ is_banned: false, banned_until: null }).eq('id', userId)
        if (error) throw error
        toast(`Unbanned ${username}`, 'success')
        load()
      } catch (e: any) {
        toast(e.message || 'Failed to unban', 'error')
      }
    } else {
      const reason = prompt(`Ban reason for "${username}":`)
      if (reason === null) return
      try {
        const { error } = await supabase.from('profiles').update({ is_banned: true, ban_reason: reason || 'No reason provided' }).eq('id', userId)
        if (error) throw error
        toast(`Banned ${username}`, 'success')
        load()
      } catch (e: any) {
        toast(e.message || 'Failed to ban', 'error')
      }
    }
  }

  const merged = profiles.map((p) => {
    const auth = users.find((u) => u.id === p.id)
    return { ...p, email: auth?.email || '', last_sign_in_at: auth?.last_sign_in_at }
  }).filter((p) => !search || p.username?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Users ({merged.length})</h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
      </div>
      <div className="space-y-2">
        {merged.map((user) => (
          <div key={user.id} className={cn('flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border transition-colors', user.is_banned ? 'border-red-500/30 bg-red-500/5' : 'border-border-primary hover:bg-bg-elevated/50')}>
            <RobloxAvatar userId={user.roblox_id} username={user.username} avatarUrl={user.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary truncate">{user.username || 'Unknown'}</span>
                {user.is_admin && <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 text-[10px] font-bold border border-yellow-500/25">ADMIN</span>}
                {user.is_banned && <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px] font-bold border border-red-500/25">BANNED</span>}
              </div>
              <div className="text-[11px] text-text-muted truncate">{user.email || user.id.slice(0, 8)}</div>
              {user.is_banned && user.ban_reason && <div className="text-[10px] text-red-400/70 truncate mt-0.5">Reason: {user.ban_reason}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                className={cn('p-1.5 rounded-lg text-xs transition-colors', user.is_admin ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25' : 'bg-bg-elevated text-text-muted hover:text-yellow-400')}
                title={user.is_admin ? 'Remove admin' : 'Make admin'}>
                <Crown size={14} />
              </button>
              <button onClick={() => handleBan(user.id, user.username || 'user', !!user.is_banned)}
                className={cn('p-1.5 rounded-lg text-xs transition-colors', user.is_banned ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10')}
                title={user.is_banned ? 'Unban user' : 'Ban user'}>
                {user.is_banned ? <ShieldOff size={14} /> : <Ban size={14} />}
              </button>
              <button onClick={() => handleDelete(user.id, user.username || 'user')}
                className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete user">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {merged.length === 0 && <p className="text-sm text-text-muted text-center py-8">No users found</p>}
      </div>
    </div>
  )
}

function SubmissionsTab() {
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [expanded, setExpanded] = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('submissions').select('*').order('created_at', { ascending: false }).limit(100)
      setSubs(data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id: string) => {
    try {
      const data = await apiCall('approve_submission', { id })
      if (data.error) throw new Error(data.error)
      toast('Submission approved!', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason (optional):')
    try {
      const data = await apiCall('reject_submission', { id, reason })
      if (data.error) throw new Error(data.error)
      toast('Submission rejected', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return
    try {
      const data = await apiCall('delete_submission', { id })
      if (data.error) throw new Error(data.error)
      toast('Deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const filtered = filter === 'all' ? subs : subs.filter((s) => s.status === filter)

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Submissions</h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-lg border border-border-primary">
        {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              filter === f ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-primary')}>
            {f} {f === 'pending' && subs.filter((s) => s.status === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">{subs.filter((s) => s.status === 'pending').length}</span>
            )}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((sub) => (
          <div key={sub.id} className="rounded-xl bg-bg-secondary border border-border-primary overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setExpanded(expanded === sub.id ? null : sub.id)} className="text-sm font-semibold text-text-primary truncate hover:text-accent-blue transition-colors text-left">
                      {sub.title}
                    </button>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold',
                      sub.status === 'pending' && 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
                      sub.status === 'approved' && 'bg-green-500/15 text-green-400 border border-green-500/25',
                      sub.status === 'rejected' && 'bg-red-500/15 text-red-400 border border-red-500/25'
                    )}>{sub.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-dim">
                    <span>{sub.category}</span>
                    <span>·</span>
                    <span>{sub.price || 'Free'}</span>
                    <span>·</span>
                    <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {sub.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(sub.id)} className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-[10px] font-bold" title="Approve">
                        <CheckCircle size={14} />
                      </button>
                      <button onClick={() => handleReject(sub.id)} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-[10px] font-bold" title="Reject">
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            {expanded === sub.id && (
              <div className="px-4 pb-4 border-t border-border-primary pt-3 space-y-3">
                {sub.thumbnail_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Thumbnail</p>
                    <img src={sub.thumbnail_url} alt="" className="w-full max-w-sm h-auto rounded-lg object-cover bg-bg-tertiary" />
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-text-muted mb-1">Description</p>
                  <p className="text-xs text-text-primary whitespace-pre-wrap">{sub.description || 'No description'}</p>
                </div>
                {sub.video_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Video</p>
                    <a href={sub.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline break-all">{sub.video_url}</a>
                  </div>
                )}
                {sub.game_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Game URL</p>
                    <a href={sub.game_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline break-all">{sub.game_url}</a>
                  </div>
                )}
                {sub.drive_file_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Download File</p>
                    <a href={sub.drive_file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline break-all">{sub.drive_file_url}</a>
                  </div>
                )}
                {sub.gamepass_url && (
                  <div>
                    <p className="text-[10px] text-text-muted mb-1">Gamepass ID</p>
                    <p className="text-xs text-text-primary">{sub.gamepass_url}</p>
                  </div>
                )}
                <div className="flex gap-4 text-[10px] text-text-dim">
                  <span>Submitted: {new Date(sub.created_at).toLocaleString()}</span>
                  {sub.reviewed_at && <span>Reviewed: {new Date(sub.reviewed_at).toLocaleString()}</span>}
                </div>
                {sub.rejection_reason && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-[10px] text-red-400 font-medium mb-0.5">Rejection Reason</p>
                    <p className="text-xs text-red-300">{sub.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-text-muted text-center py-8">No submissions</p>}
      </div>
    </div>
  )
}

const GAME_CATEGORIES = ['Uncopylocked', 'Minigame', 'Anime', 'Paid', 'Tower Defense', 'Script Kit', 'Template', 'UI Kit', 'Core API']

interface GameForm {
  title: string
  description: string
  category: string
  video_url: string
  game_url: string
  download_url: string
  thumbnail_url: string
  images: string[]
  gamepass_id: string
  price: string
  is_official: boolean
  game_play: boolean
  download_enabled: boolean
}

const emptyGame: GameForm = {
  title: '', description: '', category: 'Uncopylocked', video_url: '', game_url: '',
  download_url: '', thumbnail_url: '', images: [], gamepass_id: '', price: 'Free',
  is_official: true, game_play: false, download_enabled: true,
}

function GamesTab() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<GameForm>(emptyGame)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'official' | 'community'>('all')
  const [releaseGame, setReleaseGame] = useState<any>(null)
  const [releases, setReleases] = useState<any[]>([])
  const [releaseForm, setReleaseForm] = useState({ version: '', title: '', description: '' })
  const [releaseLoading, setReleaseLoading] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('experiences').select('*').order('created_at', { ascending: false })
      setGames(data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Title is required', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        title: form.title, description: form.description, category: form.category,
        video_url: form.video_url, game_url: form.game_url, download_url: form.download_url,
        thumbnail_url: form.thumbnail_url, images: form.images || [], gamepass_id: form.gamepass_id,
        price: form.price, is_official: form.is_official, game_play: form.game_play,
        download_enabled: form.download_enabled,
      }
      if (editing) {
        const { error } = await supabase.from('experiences').update(payload).eq('id', editing)
        if (error) throw error
        toast('Game updated!', 'success')
      } else {
        const { error } = await supabase.from('experiences').insert({ ...payload, views_count: 0, likes_count: 0 })
        if (error) throw error
        toast('Game created!', 'success')
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyGame)
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to save game', 'error')
    }
    setSaving(false)
  }

  const handleEdit = (game: any) => {
    setForm({
      title: game.title, description: game.description || '', category: game.category || 'Uncopylocked',
      video_url: game.video_url || '', game_url: game.game_url || '', download_url: game.download_url || '',
      thumbnail_url: game.thumbnail_url || '', images: game.images || [], gamepass_id: game.gamepass_id || '',
      price: game.price || 'Free', is_official: game.is_official ?? true,
      game_play: game.game_play ?? false, download_enabled: game.download_enabled ?? true,
    })
    setEditing(game.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this game permanently?')) return
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', id)
      if (error) throw error
      toast('Game deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const openReleases = async (game: any) => {
    setReleaseGame(game)
    const { data } = await supabase.from('releases').select('*').eq('target_type', 'game').eq('target_id', game.id).order('created_at', { ascending: false })
    setReleases(data || [])
    setReleaseForm({ version: '', title: '', description: '' })
  }

  const addReleaseHandler = async () => {
    if (!releaseForm.version.trim() || !releaseForm.title.trim()) { toast('Version and title required', 'error'); return }
    setReleaseLoading(true)
    try {
      const { error } = await supabase.from('releases').insert({
        target_type: 'game', target_id: releaseGame.id,
        version: releaseForm.version, title: releaseForm.title, description: releaseForm.description,
      })
      if (error) throw error
      toast('Release added!', 'success')
      const { data } = await supabase.from('releases').select('*').eq('target_type', 'game').eq('target_id', releaseGame.id).order('created_at', { ascending: false })
      setReleases(data || [])
      setReleaseForm({ version: '', title: '', description: '' })
    } catch (e: any) { toast(e.message || 'Failed', 'error') }
    setReleaseLoading(false)
  }

  const deleteReleaseHandler = async (id: string) => {
    const { error } = await supabase.from('releases').delete().eq('id', id)
    if (!error) setReleases(prev => prev.filter(r => r.id !== id))
  }

  const filtered = games.filter((g) => {
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || (g.category || '').toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || (filterType === 'official' && g.is_official) || (filterType === 'community' && !g.is_official)
    return matchSearch && matchType
  })

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Games ({games.length})</h2>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyGame) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/25 text-xs font-medium hover:bg-accent-blue/25 transition-colors">
            <Plus size={12} /> Add Game
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50" />
        </div>
        <div className="flex gap-1.5 p-1 bg-bg-secondary rounded-lg border border-border-primary">
          {(['all', 'official', 'community'] as const).map((f) => (
            <button key={f} onClick={() => setFilterType(f)}
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all',
                filterType === f ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-primary')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-bg-secondary border border-border-primary p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">{editing ? 'Edit Game' : 'Add New Game'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Game title"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Game description" rows={2}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50">
                {GAME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Price</label>
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Free"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">YouTube Video URL</label>
              <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Roblox Game URL</label>
              <input value={form.game_url} onChange={e => setForm(f => ({ ...f, game_url: e.target.value }))} placeholder="https://www.roblox.com/games/..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Download URL</label>
              <input value={form.download_url} onChange={e => setForm(f => ({ ...f, download_url: e.target.value }))} placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">GamePass ID</label>
              <input value={form.gamepass_id} onChange={e => setForm(f => ({ ...f, gamepass_id: e.target.value }))} placeholder="e.g. 12345678"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
              <p className="text-[9px] text-text-dim mt-1">Users must own this GamePass to download</p>
            </div>
            <div>
              <ImagePicker value={form.thumbnail_url} onChange={(url) => setForm(f => ({ ...f, thumbnail_url: url }))} folder="yobest/thumbnails" label="Thumbnail Image" />
            </div>
            <div className="sm:col-span-2">
              <ImagePicker value="" onChange={() => {}} folder="yobest/thumbnails" label="Gallery Images" multiple values={form.images}
                onMultipleChange={(urls) => setForm(f => ({ ...f, images: urls }))} maxImages={12} />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={form.is_official} onChange={e => setForm(f => ({ ...f, is_official: e.target.checked }))} className="rounded" /> Official Game
              </label>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={form.game_play} onChange={e => setForm(f => ({ ...f, game_play: e.target.checked }))} className="rounded" /> Playable
              </label>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={form.download_enabled} onChange={e => setForm(f => ({ ...f, download_enabled: e.target.checked }))} className="rounded" /> Download Enabled
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {editing ? 'Update' : 'Create'} Game
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyGame) }} className="px-4 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-xs font-medium hover:text-text-primary transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {filtered.map((game) => (
          <div key={game.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-elevated/50 transition-colors">
            <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center shrink-0 border border-accent-blue/10 overflow-hidden">
              {game.thumbnail_url ? <img src={toDirectImageUrl(game.thumbnail_url)} alt="" className="w-full h-full object-cover" /> :
                game.video_url?.includes('youtube') ? <img src={`https://img.youtube.com/vi/${game.video_url.match(/v=([^&]+)/)?.[1] || ''}/default.jpg`} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement && ((e.target as HTMLImageElement).parentElement as HTMLElement).appendChild(Object.assign(document.createElement('div'), { className: 'text-accent-blue/60' })) }} /> :
                <Gamepad2 size={18} className="text-accent-blue/60" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary truncate">{game.title}</span>
                {game.is_official && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 font-bold">OFFICIAL</span>}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-dim font-mono">{game.category}</span>
                {game.gamepass_id && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 font-bold">GAMEPASS</span>}
                {game.images && game.images.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 font-bold">{game.images.length} imgs</span>}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-text-muted mt-0.5">
                <span>{game.price || 'Free'}</span>
                <span>{formatNumber(game.views_count || 0)} views</span>
                <span>{formatNumber(game.likes_count || 0)} likes</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {game.game_url && <a href={game.game_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue transition-colors" title="Play"><ExternalLink size={14} /></a>}
              <button onClick={() => openReleases(game)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-green transition-colors" title="Releases"><Tag size={14} /></button>
              <button onClick={() => handleEdit(game)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue transition-colors" title="Edit"><Eye size={14} /></button>
              <button onClick={() => handleDelete(game.id)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-text-muted text-center py-8">No games found</p>}
      </div>

      {releaseGame && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-bg-secondary border border-accent-green/25 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Tag size={14} className="text-accent-green" /> Releases for: {releaseGame.title}
            </h3>
            <button onClick={() => setReleaseGame(null)} className="text-xs text-text-muted hover:text-text-primary">Close</button>
          </div>
          <div className="flex gap-2">
            <input value={releaseForm.version} onChange={e => setReleaseForm(f => ({ ...f, version: e.target.value }))} placeholder="v1.0"
              className="w-24 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            <input value={releaseForm.title} onChange={e => setReleaseForm(f => ({ ...f, title: e.target.value }))} placeholder="Release title"
              className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            <input value={releaseForm.description} onChange={e => setReleaseForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)"
              className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50" />
            <button onClick={addReleaseHandler} disabled={releaseLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-green/15 text-accent-green border border-accent-green/25 text-xs font-semibold hover:bg-accent-green/25 disabled:opacity-50 transition-all">
              {releaseLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {releases.length > 0 ? releases.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-border-primary/50">
                <span className="px-2 py-0.5 rounded bg-accent-blue/15 text-accent-blue text-[10px] font-bold shrink-0">v{r.version}</span>
                <span className="text-xs font-semibold text-text-primary flex-1">{r.title}</span>
                {r.description && <span className="text-[10px] text-text-muted flex-1 truncate">{r.description}</span>}
                <span className="text-[10px] text-text-dim shrink-0">{new Date(r.created_at).toLocaleDateString()}</span>
                <button onClick={() => deleteReleaseHandler(r.id)} className="p-1 rounded hover:bg-red-500/10 text-text-dim hover:text-red-400 transition-colors shrink-0"><Trash2 size={12} /></button>
              </div>
            )) : <p className="text-xs text-text-muted text-center py-4">No releases yet</p>}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SettingsTab() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    supabase.from('site_stats').select('*').then(({ data }) => {
      setStats(data || [])
      setLoading(false)
    })
  }, [])

  const handleSave = async (name: string, value: number) => {
    setSaving(true)
    try {
      const data = await apiCall('update_site_stats', { statName: name, value })
      if (data.error) throw new Error(data.error)
      setStats((prev) => {
        const existing = prev.find((s: any) => (s.key || s.name) === name)
        if (existing) return prev.map((s: any) => (s.key || s.name) === name ? { ...s, value, key: name } : s)
        return [...prev, { key: name, value }]
      })
      toast('Saved!', 'success')
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  const knownStats = ['visits', 'downloads', 'ai_sessions']

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">Site Settings</h2>
      <div className="rounded-xl bg-bg-secondary border border-border-primary p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Site Statistics</h3>
        <div className="space-y-3">
          {knownStats.map((name) => {
            const stat = stats.find((s: any) => (s.key || s.name) === name)
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-28 capitalize">{name.replace('_', ' ')}</span>
                <input type="number" defaultValue={stat?.value || 0}
                  onBlur={(e) => handleSave(name, parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all"
                />
              </div>
            )
          })}
        </div>
        {stats.filter((s: any) => !knownStats.includes(s.key || s.name)).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border-primary space-y-3">
            <h4 className="text-xs text-text-muted font-medium uppercase tracking-wider">Other Stats</h4>
            {stats.filter((s: any) => !knownStats.includes(s.key || s.name)).map((s: any) => (
              <div key={s.key || s.name} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-28">{s.key || s.name}</span>
                <input type="number" defaultValue={s.value || 0}
                  onBlur={(e) => handleSave(s.key || s.name, parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ToolForm {
  name: string
  description: string
  image_url: string
  images: string[]
  status: 'ready' | 'soon' | 'beta' | 'deprecated'
  download_url: string
  version: string
}

const emptyTool: ToolForm = { name: '', description: '', image_url: '', images: [], status: 'ready', download_url: '', version: '' }

function ToolsTab() {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<ToolForm>(emptyTool)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('yobest_tools' as any).select('*').order('created_at', { ascending: false })
      setTools(data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Tool name is required', 'error'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('yobest_tools' as any).update({ ...form, images: form.images || [] }).eq('id', editing)
        if (error) throw error
        toast('Tool updated!', 'success')
      } else {
        const { error } = await supabase.from('yobest_tools' as any).insert({ ...form, images: form.images || [], downloads_count: 0 })
        if (error) throw error
        toast('Tool created!', 'success')
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyTool)
      setImagePreview('')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed to save tool', 'error')
    }
    setSaving(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast('Image must be under 10MB', 'error'); return }
    setUploadingImage(true)
    try {
      const result = await uploadToGoogleDrive(file, 'yobest-tools')
      const directUrl = toDirectImageUrl(result.directLink || result.fileUrl)
      setForm(f => ({ ...f, image_url: directUrl }))
      setImagePreview(directUrl)
      toast('Image uploaded!', 'success')
    } catch (e: any) {
      toast(e.message || 'Upload failed', 'error')
    }
    setUploadingImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingGallery(true)
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { toast(`${file.name} is over 10MB, skipped`, 'error'); continue }
      try {
        const result = await uploadToGoogleDrive(file, 'yobest-tools')
        const directUrl = toDirectImageUrl(result.directLink || result.fileUrl)
        setForm(f => ({ ...f, images: [...(f.images || []), directUrl] }))
        toast(`${file.name} uploaded!`, 'success')
      } catch (err: any) {
        toast(err.message || `Failed to upload ${file.name}`, 'error')
      }
    }
    setUploadingGallery(false)
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const removeGalleryImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const handleEdit = (tool: any) => {
    setForm({ name: tool.name, description: tool.description, image_url: tool.image_url || '', images: tool.images || [], status: tool.status, download_url: tool.download_url || '', version: tool.version || '' })
    setImagePreview(tool.image_url || '')
    setEditing(tool.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tool?')) return
    try {
      const { error } = await supabase.from('yobest_tools' as any).delete().eq('id', id)
      if (error) throw error
      toast('Tool deleted', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Failed', 'error')
    }
  }

  const statusOpts = [
    { value: 'ready', label: 'Ready', color: 'text-green-400' },
    { value: 'beta', label: 'Beta', color: 'text-yellow-400' },
    { value: 'soon', label: 'Coming Soon', color: 'text-blue-400' },
    { value: 'deprecated', label: 'Deprecated', color: 'text-red-400' },
  ]

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-accent-blue" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Tools ({tools.length})</h2>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary text-xs text-text-secondary hover:text-text-primary transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyTool, images: [] }) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/25 text-xs font-medium hover:bg-accent-blue/25 transition-colors">
            <Plus size={12} /> Add Tool
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-xl bg-bg-secondary border border-border-primary p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">{editing ? 'Edit Tool' : 'Add New Tool'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Tool Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Yobest Studio Plugin"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Version</label>
              <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="e.g. v1.0"
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this tool do?" rows={3}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Image Preview</label>
              <div className="flex gap-2">
                <input value={form.image_url} onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value) }} placeholder="Paste image URL..."
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-purple/15 border border-accent-purple/25 text-accent-purple text-xs font-medium hover:bg-accent-purple/25 transition-colors disabled:opacity-50 shrink-0">
                  {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {(imagePreview || form.image_url) && (
                <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-border-primary bg-bg-tertiary">
                  <img src={imagePreview || form.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <button onClick={() => { setForm(f => ({ ...f, image_url: '' })); setImagePreview('') }} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[8px] hover:bg-red-500 transition-colors">X</button>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Gallery Images</label>
              <div className="flex items-center gap-2 mb-2">
                <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                <button onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-purple/15 border border-accent-purple/25 text-accent-purple text-xs font-medium hover:bg-accent-purple/25 transition-colors disabled:opacity-50">
                  {uploadingGallery ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                  {uploadingGallery ? 'Uploading...' : 'Add Images'}
                </button>
                <span className="text-[10px] text-text-dim">{form.images?.length || 0} images</span>
              </div>
              {form.images && form.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border-primary bg-bg-tertiary group/img">
                      <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <button onClick={() => removeGalleryImage(i)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[8px] hover:bg-red-500 transition-colors opacity-0 group-hover/img:opacity-100">X</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Download URL</label>
              <input value={form.download_url} onChange={e => setForm(f => ({ ...f, download_url: e.target.value }))} placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all" />
            </div>
            <div>
              <label className="text-[10px] text-text-dim font-semibold uppercase tracking-wider block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 transition-all">
                {statusOpts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {editing ? 'Update' : 'Create'} Tool
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm({ ...emptyTool, images: [] }) }} className="px-4 py-2 rounded-lg bg-bg-elevated border border-border-primary text-text-secondary text-xs font-medium hover:text-text-primary transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Tools List */}
      <div className="space-y-2">
        {tools.map((tool) => {
          const sConf = statusOpts.find(s => s.value === tool.status) || statusOpts[1]
          return (
            <div key={tool.id} className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-elevated/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center shrink-0 border border-accent-blue/10 overflow-hidden">
                {tool.image_url ? <img src={tool.image_url} alt="" className="w-full h-full object-cover" /> : <Wrench size={18} className="text-accent-blue/60" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary truncate">{tool.name}</span>
                  {tool.version && <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-dim font-mono">{tool.version}</span>}
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', sConf.color, `${sConf.value === 'ready' ? 'bg-green-500/10 border-green-500/20' : sConf.value === 'beta' ? 'bg-yellow-500/10 border-yellow-500/20' : sConf.value === 'soon' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'}`)}>
                    {sConf.label}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">{tool.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleEdit(tool)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors" title="Edit">
                  <Eye size={14} />
                </button>
                <button onClick={() => handleDelete(tool.id)} className="p-1.5 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
        {tools.length === 0 && (
          <div className="text-center py-12">
            <Wrench size={36} className="mx-auto text-text-dim mb-3" />
            <p className="text-sm text-text-muted">No tools yet. Click "Add Tool" to create one.</p>
          </div>
        )}
      </div>
    </div>
  )
}
