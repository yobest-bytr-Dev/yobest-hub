import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, Award, Target, Crown, Medal, TrendingUp, Gamepad2, Download, Heart, MessageSquare, Eye, Clock, Loader2, ExternalLink, ShoppingBag, Calendar } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { getPlatformStats, getLeaderboard, getChallenges, getApprovedCommunityGames, getAssets, getOfficialGames } from '@/lib/api'
import { formatNumber, cn } from '@/lib/utils'
import RobloxAvatar from '@/components/ui/RobloxAvatar'
import type { UserProfile, Challenge, Experience } from '@/lib/types'
import { experiences } from '@/data/official-games'
import AdBanner from '@/components/AdBanner'

const challengeGradients = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-amber-500',
  'from-indigo-500 to-blue-500',
]

export default function Community() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ officialGames: 13, creators: 0, assets: 0, communityGames: 0 })
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [recentGames, setRecentGames] = useState<any[]>([])
  const [assetCount, setAssetCount] = useState(0)
  const [officialGames, setOfficialGames] = useState<Experience[]>(experiences)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      getPlatformStats(),
      getLeaderboard(),
      getChallenges(),
      getApprovedCommunityGames(),
      getAssets(),
      getOfficialGames(),
    ]).then(([statsRes, leadRes, challRes, gamesRes, assetsRes, officialRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      if (leadRes.status === 'fulfilled') setLeaderboard(leadRes.value)
      if (challRes.status === 'fulfilled') setChallenges(challRes.value)
      if (gamesRes.status === 'fulfilled') setRecentGames(gamesRes.value.slice(0, 10))
      if (assetsRes.status === 'fulfilled') setAssetCount(assetsRes.value.length)
      if (officialRes.status === 'fulfilled' && officialRes.value.length > 0) setOfficialGames(officialRes.value)
      setLoading(false)
    })
  }, [])

  const totalGames = stats.officialGames + stats.communityGames
  const activeChallenges = challenges.filter((c) => c.status === 'active').length

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Community <span className="gradient-text">Hub</span>
          </h1>
          <p className="text-text-secondary text-lg">Connect, compete, and collaborate with Roblox creators</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-accent-blue" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Creators', value: String(stats.creators), icon: Users, color: 'text-accent-blue' },
                  { label: 'Challenges', value: String(activeChallenges), icon: Target, color: 'text-accent-pink' },
                  { label: 'Games Shared', value: String(totalGames), icon: Gamepad2, color: 'text-accent-green' },
                  { label: 'Assets', value: String(assetCount), icon: ShoppingBag, color: 'text-accent-purple' },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="p-4 rounded-xl bg-bg-secondary border border-border-primary">
                      <Icon size={18} className={cn(stat.color, 'mb-2')} />
                      <div className="text-xl font-bold text-text-primary">{stat.value}</div>
                      <div className="text-xs text-text-muted">{stat.label}</div>
                    </div>
                  )
                })}
              </div>

              {challenges.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Challenges</h2>
                    {activeChallenges > 0 && <span className="text-xs text-green-400 font-medium">{activeChallenges} active</span>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {challenges.slice(0, 4).map((challenge, i) => (
                      <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="rounded-xl bg-bg-secondary border border-border-primary overflow-hidden card-hover">
                        <div className={`h-1.5 bg-gradient-to-r ${challengeGradients[i % challengeGradients.length]}`} />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-md',
                              challenge.status === 'active' ? 'bg-green-500/15 text-green-400' : challenge.status === 'ended' ? 'bg-red-500/15 text-red-400' : 'bg-slate-500/15 text-slate-400')}>
                              {challenge.status}
                            </span>
                            <span className="text-[11px] text-text-muted flex items-center gap-1"><Calendar size={10} /> Ends {new Date(challenge.end_date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-text-primary mb-1">{challenge.title}</h3>
                          <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">{challenge.description}</p>
                          <div className="flex items-center justify-between">
                            {challenge.prize && (
                              <div className="flex items-center gap-1.5">
                                <Trophy size={12} className="text-yellow-400" />
                                <span className="text-xs font-medium text-yellow-400">{challenge.prize}</span>
                              </div>
                            )}
                            <span className="text-xs text-text-muted">{challenge.participants_count} joined</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {recentGames.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">Recent Community Games</h2>
                  <div className="space-y-2">
                    {recentGames.map((game, i) => (
                      <Link key={game.id} to={`/games/${game.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-elevated/50 transition-colors group cursor-pointer">
                        <div className="w-7 text-center">
                          {i < 3 ? (
                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                              i === 0 && 'bg-yellow-500/20 text-yellow-400', i === 1 && 'bg-slate-300/20 text-slate-300', i === 2 && 'bg-orange-500/20 text-orange-400')}>
                              {i === 0 ? <Crown size={14} /> : i === 1 ? <Medal size={14} /> : <Award size={14} />}
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted font-medium">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-blue transition-colors">{game.title}</div>
                          <div className="text-[11px] text-text-muted">{game.category} · {game.price || 'Free'}</div>
                        </div>
                        <span className="text-[10px] text-text-dim shrink-0">{game.created_at ? new Date(game.created_at).toLocaleDateString() : ''}</span>
                        <ExternalLink size={12} className="text-text-dim group-hover:text-accent-blue transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {officialGames.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4">Top Official Games</h2>
                  <div className="space-y-2">
                    {officialGames.sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5).map((game, i) => (
                      <Link key={game.id} to={`/games/${game.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-primary hover:bg-bg-elevated/50 transition-colors group cursor-pointer">
                        <div className="w-7 text-center">
                          {i < 3 ? (
                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                              i === 0 && 'bg-yellow-500/20 text-yellow-400', i === 1 && 'bg-slate-300/20 text-slate-300', i === 2 && 'bg-orange-500/20 text-orange-400')}>
                              {i === 0 ? <Crown size={14} /> : i === 1 ? <Medal size={14} /> : <Award size={14} />}
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted font-medium">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-blue transition-colors">{game.title}</div>
                          <div className="text-[11px] text-text-muted">{game.category}</div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <div className="flex items-center gap-1"><Eye size={11} />{formatNumber(game.views_count || 0)}</div>
                          <div className="flex items-center gap-1"><Heart size={11} />{formatNumber(game.likes_count || 0)}</div>
                        </div>
                        <ExternalLink size={12} className="text-text-dim group-hover:text-accent-blue transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
                <div className="px-5 py-4 border-b border-border-primary">
                  <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-400" />
                    Creator Leaderboard
                  </h2>
                </div>
                <div className="divide-y divide-border-primary">
                  {leaderboard.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="text-xs text-text-muted">No creators yet</p>
                    </div>
                  ) : (
                    leaderboard.map((creator, i) => (
                      <div key={creator.id} className="flex items-center gap-3 px-5 py-3 hover:bg-bg-elevated/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/profile/${creator.id}`)}>
                        <div className="w-7 text-center">
                          {i < 3 ? (
                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                              i === 0 && 'bg-yellow-500/20 text-yellow-400', i === 1 && 'bg-slate-300/20 text-slate-300', i === 2 && 'bg-orange-500/20 text-orange-400')}>
                              {i === 0 ? <Crown size={14} /> : i === 1 ? <Medal size={14} /> : <Award size={14} />}
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted font-medium">{i + 1}</span>
                          )}
                        </div>
                        <RobloxAvatar userId={creator.roblox_id} username={creator.username} avatarUrl={creator.avatar_url} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">{creator.username}</div>
                           <div className="text-[11px] text-text-muted truncate">{creator.games_count || 0} games · {creator.bio || 'Creator'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-text-primary">{formatNumber(creator.followers_count || 0)}</div>
                          <div className="text-[10px] text-text-muted">followers</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-bg-secondary border border-border-primary p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Gamepad2 size={12} className="text-green-400" /> Official Games
                    </div>
                    <span className="text-xs font-medium text-text-primary">{stats.officialGames}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Gamepad2 size={12} className="text-blue-400" /> Community Games
                    </div>
                    <span className="text-xs font-medium text-text-primary">{stats.communityGames}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Users size={12} className="text-blue-400" /> Total Creators
                    </div>
                    <span className="text-xs font-medium text-text-primary">{stats.creators}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <ShoppingBag size={12} className="text-purple-400" /> Marketplace Assets
                    </div>
                    <span className="text-xs font-medium text-text-primary">{assetCount}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-bg-secondary border border-border-primary p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Community Guidelines</h3>
                <ul className="space-y-2">
                  {['Be respectful to all creators', 'No plagiarism or stolen assets', 'Credit original authors', 'Keep submissions family-friendly', 'No exploit or cheat sharing'].map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="text-accent-green mt-0.5">•</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden lg:flex justify-center">
                <AdBanner type="skyscraper" />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
