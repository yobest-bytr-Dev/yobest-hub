import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wrench, Download, ExternalLink, Clock, CheckCircle, Hammer,
  Loader2, Search, Filter, Sparkles, ArrowRight
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { cn } from '@/lib/utils'
import AdBanner from '@/components/AdBanner'

interface YobestTool {
  id: string
  name: string
  description: string
  image_url: string
  status: 'ready' | 'soon' | 'beta' | 'deprecated'
  download_url: string
  version: string
  downloads_count: number
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  ready: { label: 'Ready', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/25', icon: CheckCircle },
  beta: { label: 'Beta', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25', icon: Sparkles },
  soon: { label: 'Coming Soon', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25', icon: Clock },
  deprecated: { label: 'Deprecated', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/25', icon: Wrench },
}

const hardcodedTools: YobestTool[] = [
  {
    id: 'plugin-v3',
    name: 'Yobest Studio Plugin',
    description: 'Auto-inject scripts from Yobest AI directly into Roblox Studio. One-click deploy, token pairing, and live sync.',
    image_url: '',
    status: 'ready',
    download_url: '#plugin',
    version: 'v3.2',
    downloads_count: 1240,
    created_at: '2025-01-01',
  },
  {
    id: 'script-runner',
    name: 'Script Runner',
    description: 'Execute and test Luau snippets instantly in Studio without creating new Script instances. Great for debugging.',
    image_url: '',
    status: 'ready',
    download_url: '',
    version: 'v1.0',
    downloads_count: 856,
    created_at: '2025-02-15',
  },
  {
    id: 'data-viewer',
    name: 'DataStore Viewer',
    description: 'Visual browser for your game DataStores. View, edit, and debug saved data in real-time from Studio.',
    image_url: '',
    status: 'soon',
    download_url: '',
    version: '',
    downloads_count: 0,
    created_at: '2025-06-01',
  },
  {
    id: 'optimizer',
    name: 'Performance Optimizer',
    description: 'Scans your game for memory leaks, slow loops, and rendering bottlenecks. Generates a detailed report with fixes.',
    image_url: '',
    status: 'soon',
    download_url: '',
    version: '',
    downloads_count: 0,
    created_at: '2025-07-01',
  },
]

export default function Tools() {
  const [tools, setTools] = useState<YobestTool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('yobest_tools' as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        setTools(hardcodedTools)
      } else {
        setTools([...data as YobestTool[], ...hardcodedTools.filter(h => !data.find((d: any) => d.id === h.id))])
      }
    } catch {
      setTools(hardcodedTools)
    }
    setLoading(false)
  }

  const filtered = tools.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/25">
              <Wrench size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Yobest Tools</h1>
              <p className="text-sm text-text-muted">Official tools and utilities for Roblox developers</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-dim">
            <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
              {tools.filter(t => t.status === 'ready').length} Ready
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {tools.filter(t => t.status === 'soon').length} Coming Soon
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
            />
          </div>
          <div className="flex gap-1.5 p-1 bg-bg-secondary rounded-xl border border-border-primary">
            {['all', 'ready', 'beta', 'soon'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                  statusFilter === f ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {f === 'all' ? 'All' : statusConfig[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent-blue" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Wrench size={48} className="mx-auto text-text-dim mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No tools found</h3>
            <p className="text-sm text-text-muted">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((tool, i) => {
              const status = statusConfig[tool.status] || statusConfig.soon
              const StatusIcon = status.icon
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="group rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden hover:border-accent-blue/30 transition-all hover:shadow-lg hover:shadow-accent-blue/5"
                >
                  {/* Image Preview */}
                  <div className="relative h-40 bg-gradient-to-br from-bg-tertiary to-bg-secondary overflow-hidden">
                    {tool.image_url ? (
                      <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center border border-accent-blue/10 group-hover:scale-110 transition-transform duration-500">
                            <Wrench size={28} className="text-accent-blue/60" />
                          </div>
                          <div className="absolute -inset-4 rounded-full bg-accent-blue/5 blur-xl" />
                        </div>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className={cn('absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-sm', status.bg)}>
                      <StatusIcon size={10} className={status.color} />
                      <span className={status.color}>{status.label}</span>
                    </div>
                    {tool.version && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] text-white/80 font-mono">
                        {tool.version}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-text-primary mb-1.5 group-hover:text-accent-blue transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-2">
                      {tool.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-text-dim">
                        {tool.downloads_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Download size={10} />
                            {tool.downloads_count.toLocaleString()} downloads
                          </span>
                        )}
                      </div>

                      {tool.status === 'ready' && tool.download_url ? (
                        <a
                          href={tool.download_url}
                          target={tool.download_url.startsWith('http') ? '_blank' : undefined}
                          rel={tool.download_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-md shadow-accent-blue/20"
                        >
                          <Download size={12} />
                          Download
                          <ArrowRight size={10} />
                        </a>
                      ) : tool.status === 'soon' ? (
                        <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-dim text-xs font-medium">
                          <Clock size={12} />
                          Coming Soon
                        </span>
                      ) : tool.status === 'beta' ? (
                        <a
                          href={tool.download_url}
                          target={tool.download_url.startsWith('http') ? '_blank' : undefined}
                          rel={tool.download_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/25 transition-colors"
                        >
                          <Sparkles size={12} />
                          Try Beta
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-dim text-xs font-medium">
                          <Wrench size={12} />
                          Deprecated
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Ad */}
        <div className="mt-8 flex justify-center">
          <AdBanner type="leaderboard" />
        </div>
      </motion.div>
    </div>
  )
}
