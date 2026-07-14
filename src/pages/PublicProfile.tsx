import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Gamepad2, Users, Heart, ExternalLink, Loader2, MessageCircle,
  UserPlus, UserMinus, ArrowLeft
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { useStore } from '@/store/useStore'
import { cn, formatNumber } from '@/lib/utils'
import RobloxAvatar from '@/components/ui/RobloxAvatar'
import type { UserProfile } from '@/lib/types'

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const toggleFollow = useStore((s) => s.toggleFollow)
  const isFollowing = useStore((s) => s.isFollowing)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setNotFound(false)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setProfile(data as UserProfile)
        }
        setLoading(false)
      })
  }, [userId])

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-blue" />
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-text-primary mb-2">Creator not found</h2>
          <p className="text-text-secondary text-sm mb-4">This profile doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/creators')}
            className="px-4 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold hover:bg-accent-blue/80 transition-opacity"
          >
            Back to Creators
          </button>
        </div>
      </div>
    )
  }

  const isYou = currentUser?.id === profile.id
  const following = isFollowing(profile.id)
  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown'

  const handleMessage = () => {
    if (!currentUser) { navigate('/auth'); return }
    navigate(`/messages/${profile.id}`, { state: { user: profile } })
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button
          onClick={() => navigate('/creators')}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Creators
        </button>

        {/* Profile Header */}
        <div className="relative rounded-2xl overflow-hidden mb-6">
          <div className="h-48 sm:h-56 bg-gradient-to-br from-accent-blue/30 via-accent-purple/20 to-accent-pink/30 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
          </div>

          <div className="px-6 sm:px-8 pb-6 -mt-16 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative group">
                <RobloxAvatar
                  userId={profile.roblox_id}
                  username={profile.username}
                  avatarUrl={profile.avatar_url}
                  size="xl"
                  decoration={profile.avatar_decoration}
                  className="rounded-2xl !w-28 !h-28 shadow-2xl group-hover:shadow-accent-blue/20 transition-shadow"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-3 border-bg-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-text-primary truncate">{profile.display_name || profile.username}</h1>
                  {profile.is_admin && (
                    <span className="px-2 py-0.5 rounded-md bg-accent-blue/15 text-accent-blue text-xs font-semibold border border-accent-blue/25">Admin</span>
                  )}
                  {isYou && (
                    <span className="px-2 py-0.5 rounded-md bg-accent-purple/15 text-accent-purple text-xs font-semibold border border-accent-purple/25">You</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-text-muted text-sm">
                  <Gamepad2 size={14} />
                  <span>@{profile.username}</span>
                </div>
                {profile.bio && (
                  <p className="text-text-secondary text-sm mt-2 leading-relaxed max-w-lg">{profile.bio}</p>
                )}
              </div>

              <div className="flex gap-2">
                {profile.roblox_id && (
                  <a
                    href={`https://www.roblox.com/users/${profile.roblox_id}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-secondary border border-border-primary text-text-secondary text-xs font-medium hover:border-border-hover hover:text-text-primary transition-all"
                  >
                    <ExternalLink size={12} /> Roblox Profile
                  </a>
                )}
                {!isYou && (
                  <>
                    <button
                      onClick={() => { if (!currentUser) { navigate('/auth'); return } toggleFollow(profile.id) }}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                        following
                          ? 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 hover:border-red-500/40'
                          : 'bg-accent-blue text-white hover:bg-accent-blue/80 shadow-md shadow-accent-blue/20'
                      )}
                    >
                      {following ? <UserMinus size={13} /> : <UserPlus size={13} />}
                      {following ? 'Unfollow' : 'Follow'}
                    </button>
                    <button
                      onClick={handleMessage}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-bg-elevated border border-border-primary text-text-secondary hover:text-accent-blue hover:border-accent-blue/30 transition-all"
                    >
                      <MessageCircle size={13} /> Chat
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary text-center">
            <Gamepad2 size={18} className="mx-auto mb-2 text-accent-blue" />
            <div className="text-2xl font-bold text-text-primary">{profile.games_count || 0}</div>
            <div className="text-xs text-text-muted">Games</div>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary text-center">
            <Users size={18} className="mx-auto mb-2 text-accent-purple" />
            <div className="text-2xl font-bold text-text-primary">{formatNumber(profile.followers_count || 0)}</div>
            <div className="text-xs text-text-muted">Followers</div>
          </div>
          <div className="p-4 rounded-xl bg-bg-secondary border border-border-primary text-center">
            <Heart size={18} className="mx-auto mb-2 text-accent-pink" />
            <div className="text-2xl font-bold text-text-primary">{formatNumber(profile.following_count || 0)}</div>
            <div className="text-xs text-text-muted">Following</div>
          </div>
        </div>

        {/* Member Since */}
        <div className="p-5 rounded-xl bg-bg-secondary border border-border-primary">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Member since</span>
            <span className="text-text-primary text-sm font-medium">{joinDate}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
