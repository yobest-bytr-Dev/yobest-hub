import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  Wrench, Download, Clock, CheckCircle, Loader2, Search, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Image as ImageIcon, Box, Palette, Layers
} from 'lucide-react'
import { supabase } from '@/config/supabase'
import { cn } from '@/lib/utils'
import AdBanner from '@/components/AdBanner'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/Toast'

const ThreeDGenerator = lazy(() => import('@/components/tools/ThreeDGenerator'))
const UIGenerator = lazy(() => import('@/components/tools/UIGenerator'))

interface YobestTool {
  id: string; name: string; description: string; image_url: string; images: string[]
  status: 'ready' | 'soon' | 'beta' | 'deprecated'; download_url: string; version: string
  downloads_count: number; created_at: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  ready: { label: 'Ready', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle },
  beta: { label: 'Beta', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Sparkles },
  soon: { label: 'Coming Soon', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock },
  deprecated: { label: 'Deprecated', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Wrench },
}

type TabId = 'all' | '3d-generator' | 'ui-generator'
const toolTabs: { id: TabId; label: string; icon: any; desc: string }[] = [
  { id: 'all', label: 'All Tools', icon: Layers, desc: 'Browse all available tools' },
  { id: '3d-generator', label: '3D Model Generator', icon: Box, desc: 'Generate 3D models from text prompts' },
  { id: 'ui-generator', label: 'UI Generator', icon: Palette, desc: 'Generate Roblox UI code with AI' },
]

function getAllImages(tool: YobestTool): string[] {
  const imgs: string[] = []
  if (tool.image_url) imgs.push(tool.image_url)
  if (tool.images && Array.isArray(tool.images)) {
    for (const img of tool.images) { if (img && !imgs.includes(img)) imgs.push(img) }
  }
  return imgs
}

function ToolCard({ tool }: { tool: YobestTool }) {
  const [imgIdx, setImgIdx] = useState(0)
  const allImages = getAllImages(tool)
  const status = statusConfig[tool.status] || statusConfig.soon
  const StatusIcon = status.icon

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden hover:border-accent-blue/30 transition-all hover:shadow-lg hover:shadow-accent-blue/5">
      <div className="relative h-48 bg-gradient-to-br from-bg-tertiary to-bg-secondary overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <img src={allImages[imgIdx]} alt={tool.name} className="w-full h-full object-cover" />
            {allImages.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-all z-10"><ChevronLeft size={14} /></button>
                <button onClick={() => setImgIdx((i) => (i + 1) % allImages.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-all z-10"><ChevronRight size={14} /></button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {allImages.map((_, i) => <button key={i} onClick={() => setImgIdx(i)} className={cn('w-1.5 h-1.5 rounded-full transition-all', i === imgIdx ? 'bg-white w-3' : 'bg-white/40')} />)}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center border border-accent-blue/10 group-hover:scale-110 transition-transform duration-500"><Wrench size={28} className="text-accent-blue/60" /></div>
            </div>
          </div>
        )}
        <div className={cn('absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-sm z-10', status.bg, status.border)}>
          <StatusIcon size={10} className={status.color} /><span className={status.color}>{status.label}</span>
        </div>
        {tool.version && <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] text-white/80 font-mono z-10">{tool.version}</div>}
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-text-primary mb-1.5 group-hover:text-accent-blue transition-colors">{tool.name}</h3>
        <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-2">{tool.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-text-dim">
            {tool.downloads_count > 0 && <span className="flex items-center gap-1"><Download size={10} />{tool.downloads_count.toLocaleString()} downloads</span>}
          </div>
          {tool.status === 'ready' && tool.download_url ? (
            <a href={tool.download_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-md shadow-accent-blue/20">
              <Download size={12} /> Download <ArrowRight size={10} />
            </a>
          ) : tool.status === 'beta' && tool.download_url ? (
            <a href={tool.download_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/25 transition-colors">
              <Sparkles size={12} /> Try Beta
            </a>
          ) : (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-dim text-xs font-medium"><Clock size={12} /> Coming Soon</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ToolLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-accent-blue" />
    </div>
  )
}

export default function Tools() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tools, setTools] = useState<YobestTool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<TabId>('all')

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('yobest_tools' as any).select('*').order('created_at', { ascending: false })
      if (!error && data) setTools(data as YobestTool[])
      else setTools([])
    } catch { setTools([]) }
    setLoading(false)
  }

  const filtered = tools.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
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
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          {toolTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap border',
                  activeTab === tab.id
                    ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/25 shadow-lg shadow-accent-blue/5'
                    : 'bg-bg-secondary text-text-secondary border-border-primary hover:border-border-hover hover:text-text-primary')}>
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {activeTab === 'all' && (
          <>
            {loading ? (
              <ToolLoader />
            ) : tools.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative mx-auto mb-6 w-20 h-20">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 blur-xl" />
                  <div className="relative w-20 h-20 rounded-2xl bg-bg-secondary border border-border-primary flex items-center justify-center"><Wrench size={32} className="text-text-dim" /></div>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">No tools yet</h3>
                <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">Tools will appear here once added. Try our built-in generators instead!</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setActiveTab('3d-generator')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-accent-blue/20"><Box size={14} /> 3D Generator</button>
                  <button onClick={() => setActiveTab('ui-generator')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-accent-purple/20"><Palette size={14} /> UI Generator</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tools..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all" />
                  </div>
                  <div className="flex gap-1.5 p-1 bg-bg-secondary rounded-xl border border-border-primary">
                    {['all', 'ready', 'beta', 'soon'].map((f) => (
                      <button key={f} onClick={() => setStatusFilter(f)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                          statusFilter === f ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-primary')}>
                        {f === 'all' ? 'All' : statusConfig[f]?.label || f}
                      </button>
                    ))}
                  </div>
                </div>
                {filtered.length === 0 ? (
                  <div className="text-center py-16"><Wrench size={40} className="mx-auto text-text-dim mb-3" /><h3 className="text-lg font-semibold text-text-primary mb-1">No tools match your filter</h3><p className="text-sm text-text-muted">Try adjusting your search or filter</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filtered.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
                )}
              </>
            )}
            <div className="mt-8 flex justify-center"><AdBanner type="leaderboard" /></div>
          </>
        )}

        {activeTab === '3d-generator' && (
          <div>
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/15">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-blue/20 flex items-center justify-center shrink-0"><Box size={24} className="text-accent-blue" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-text-primary">3D Model Generator</h2>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/tools/3d-generator`); toast('Link copied!', 'success') }}
                      className="text-[10px] text-text-dim hover:text-accent-blue px-2 py-0.5 rounded-md bg-bg-secondary border border-border-primary hover:border-accent-blue/30 transition-all">
                      📋 Copy Share Link
                    </button>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">Generate 3D models from text descriptions using Yobest3D AI. Describe your model, choose quality settings, and generate in seconds. Download as GLB for Blender, Roblox Studio, or other 3D software.</p>
                </div>
              </div>
            </div>
            <Suspense fallback={<ToolLoader />}>
              <ThreeDGenerator />
            </Suspense>
          </div>
        )}

        {activeTab === 'ui-generator' && (
          <div>
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 border border-accent-purple/15">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center shrink-0"><Palette size={24} className="text-accent-purple" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-text-primary">Roblox UI Generator</h2>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/tools/ui-generator`); toast('Link copied!', 'success') }}
                      className="text-[10px] text-text-dim hover:text-accent-purple px-2 py-0.5 rounded-md bg-bg-secondary border border-border-primary hover:border-accent-purple/30 transition-all">
                      📋 Copy Share Link
                    </button>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">Describe the UI you want and AI will generate ready-to-use Roblox Studio Lua code. Includes Frames, TextLabels, Buttons, UICorner, UIStroke, UIGradient, and more. Copy and paste directly into Roblox Studio.</p>
                </div>
              </div>
            </div>
            <Suspense fallback={<ToolLoader />}>
              <UIGenerator />
            </Suspense>
          </div>
        )}
      </motion.div>
    </div>
  )
}
