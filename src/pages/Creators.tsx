import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Users, UserPlus, UserMinus, MessageCircle, Gamepad2,
  Heart, X, Loader2, UserCheck
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/config/supabase'
import { cn, formatNumber } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import RobloxAvatar from '@/components/ui/RobloxAvatar'
import type { UserProfile } from '@/lib/types'

export default function Creators() {
  const currentUser = useStore((s) => s.currentUser)
  const toggleFollow = useStore((s) => s.toggleFollow)
  const isFollowing = useStore((s) => s.isFollowing)
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'games' | 'followers'>('newest')

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      let all: UserProfile[] = []

      if (!error && data && data.length > 0) {
        all = data as UserProfile[]
      }

      if (currentUser) {
        const alreadyInList = all.some((p) => p.id === currentUser.id)
        if (!alreadyInList) {
          all.unshift(currentUser)
        }
      }

      setProfiles(all)
      setLoading(false)
    }
    load()
  }, [currentUser])

  const filtered = useMemo(() => {
    let result = [...profiles]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.username.toLowerCase().includes(q) ||
          (p.display_name || '').toLowerCase().includes(q) ||
          (p.bio || '').toLowerCase().includes(q)
      )
    }
    if (sortBy === 'games') result.sort((a, b) => (b.games_count || 0) - (a.games_count || 0))
    else if (sortBy === 'followers') result.sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return result
  }, [profiles, search, sortBy])

  const handleMessage = (user: UserProfile) => {
    if (!currentUser) { navigate('/auth'); return }
    navigate(`/messages/${user.id}`, { state: { user } })
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            🌟 <span className="gradient-text">Creators</span>
          </h1>
          <p className="text-text-secondary text-lg">Discover and connect with Roblox creators on Yobest</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search creators by name or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary border border-border-primary overflow-x-auto shrink-0">
            {(['newest', 'games', 'followers'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  sortBy === s
                    ? 'bg-accent-blue/15 text-accent-blue shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                )}
              >
                {s === 'newest' ? 'Newest' : s === 'games' ? 'Top Creators' : 'Most Followed'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-muted mb-5">
          <div className="w-2 h-2 rounded-full bg-accent-blue" />
          Showing {filtered.length} creator{filtered.length !== 1 ? 's' : ''}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-accent-blue" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((profile) => {
              const following = isFollowing(profile.id)
              const isYou = currentUser?.id === profile.id
              return (
                <motion.div
                  key={profile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden card-hover group"
                >
                  <div className="h-24 bg-gradient-to-br from-accent-blue/25 via-accent-purple/20 to-accent-pink/25 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />
                    {isYou && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-accent-blue/90 text-white text-[10px] font-bold shadow-lg shadow-accent-blue/30">You</div>
                    )}
                  </div>

                  <div className="px-5 pb-5 -mt-8 relative">
                    <div className="flex items-end gap-3.5 mb-3">
                      <div className="relative">
                        <RobloxAvatar
                          userId={profile.roblox_id}
                          username={profile.username}
                          avatarUrl={profile.avatar_url}
                          size="lg"
                          decoration={profile.avatar_decoration}
                          className="!w-16 !h-16 ring-4 ring-bg-secondary"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-bg-secondary" />
                      </div>
                      <div className="min-w-0 pb-1.5">
                        <h3 className="text-sm font-bold text-text-primary truncate">
                          {profile.display_name || profile.username}
                        </h3>
                        <p className="text-xs text-text-muted truncate">@{profile.username}</p>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-xs text-text-secondary mb-3 line-clamp-2 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent-blue/10 text-accent-blue font-medium">
                        <Gamepad2 size={11} />
                        {profile.games_count || 0}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent-purple/10 text-accent-purple font-medium">
                        <Users size={11} />
                        {formatNumber(profile.followers_count || 0)}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent-pink/10 text-accent-pink font-medium">
                        <Heart size={11} />
                        {formatNumber(profile.following_count || 0)}
                      </span>
                    </div>

                    {!isYou && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/profile/${profile.id}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-bg-elevated border border-border-primary text-text-secondary hover:text-accent-blue hover:border-accent-blue/30 transition-all"
                        >
                          <UserCheck size={13} /> View Profile
                        </button>
                        <button
                          onClick={async () => {
  if (!currentUser) { navigate('/auth'); return }
  const wasFollowing = isFollowing(profile.id)
  await toggleFollow(profile.id)
  toast(wasFollowing ? `Unfollowed ${profile.username}` : `Following ${profile.username}`, 'success')
}}
                          className={cn(
                            'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                            following
                              ? 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 hover:border-red-500/40'
                              : 'bg-accent-blue text-white hover:bg-accent-blue/80 shadow-md shadow-accent-blue/20'
                          )}
                        >
                          {following ? <UserMinus size={13} /> : <UserPlus size={13} />}
                        </button>
                        <button
                          onClick={() => handleMessage(profile)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-bg-elevated border border-border-primary text-text-secondary hover:text-accent-blue hover:border-accent-blue/30 transition-all"
                        >
                          <MessageCircle size={13} />
                        </button>
                      </div>
                    )}
                    {isYou && (
                      <button
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-accent-blue/15 text-accent-blue border border-accent-blue/25 hover:bg-accent-blue/25 transition-all"
                      >
                        <UserCheck size={13} /> View Profile
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto mb-4 text-text-dim" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No creators yet</h3>
            <p className="text-text-secondary text-sm mb-4">Be the first to join Yobest and appear here</p>
            {!currentUser && (
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
