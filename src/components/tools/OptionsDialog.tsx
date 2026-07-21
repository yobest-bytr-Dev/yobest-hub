import { useState, useEffect, useCallback } from 'react'
import { Settings, Zap, FileBox, Palette, PersonStanding, Sparkles, Layers, RotateCcw, Scissors, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Options {
  quality: 'ultra' | 'high' | 'medium' | 'low' | 'extra-low'
  geometry_file_format: 'glb' | 'usdz' | 'fbx' | 'obj' | 'stl'
  tier: 'Gen-2'
  TAPose: boolean
  material: 'PBR' | 'Shaded'
  generation_method: 'single' | 'multiple'
  texture_quality: 'standard' | '4k'
  seed: number | null
}

interface Props {
  open: boolean
  onClose: () => void
  options: Options
  onApply: (options: Options) => void
}

type TabId = 'quality' | 'output' | 'style' | 'advanced'
const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'quality', label: 'Quality', icon: Zap },
  { id: 'output', label: 'Output', icon: FileBox },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'advanced', label: 'Advanced', icon: Settings },
]

const qualityPresets = [
  { value: 'ultra' as const, label: 'Ultra', desc: '~200k faces', badge: 'Ultimate', color: 'text-rose-400' },
  { value: 'high' as const, label: 'High', desc: '~50k faces', badge: 'Best', color: 'text-emerald-400' },
  { value: 'medium' as const, label: 'Medium', desc: '~18k faces', badge: 'Balanced', color: 'text-violet-400' },
  { value: 'low' as const, label: 'Low', desc: '~8k faces', badge: 'Fast', color: 'text-amber-400' },
  { value: 'extra-low' as const, label: 'Extra Low', desc: '~4k faces', badge: 'Light', color: 'text-orange-400' },
]

const formatOptions = [
  { value: 'glb', label: 'GLB', desc: 'Universal, recommended' },
  { value: 'usdz', label: 'USDZ', desc: 'Apple AR / Quick Look' },
  { value: 'fbx', label: 'FBX', desc: 'Game engines' },
  { value: 'obj', label: 'OBJ', desc: 'Classic interchange' },
  { value: 'stl', label: 'STL', desc: '3D printing' },
]

const materialOptions = [
  { value: 'PBR' as const, label: 'PBR', desc: 'Physically Based Rendering — realistic lighting', icon: '🎨' },
  { value: 'Shaded' as const, label: 'Shaded', desc: 'Stylized flat shading — cartoon look', icon: '✨' },
]

export default function OptionsDialog({ open, onClose, options, onApply }: Props) {
  const [local, setLocal] = useState(options)
  const [activeTab, setActiveTab] = useState<TabId>('quality')

  useEffect(() => { if (open) { setLocal(options); setActiveTab('quality') } }, [open, options])

  const handleApply = useCallback(() => { onApply(local); onClose() }, [local, onApply, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-violet-400" />
            </div>
            <h2 className="text-lg text-text-primary font-semibold">Generation Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"><X size={20} /></button>
        </div>

        <div className="flex gap-1 px-5 pt-3 pb-2 border-b border-border-primary">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                  activeTab === tab.id ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated')}>
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeTab === 'quality' && (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">Higher quality = more faces = longer generation time</p>
              <div className="grid grid-cols-2 gap-2">
                {qualityPresets.map((p) => (
                  <button key={p.value} onClick={() => setLocal({ ...local, quality: p.value })}
                    className={cn('relative px-4 py-3 rounded-xl text-left transition-all',
                      local.quality === p.value ? 'bg-accent-blue/15 border border-accent-blue/25' : 'bg-bg-elevated border border-border-primary hover:border-border-hover')}>
                    {local.quality === p.value && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-blue" />}
                    <span className="text-text-primary text-sm font-medium block">{p.label}</span>
                    <span className={cn('text-[11px]', p.color)}>{p.badge}</span>
                    <p className="text-text-dim text-[11px] mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted mb-3">Choose the format for your downloaded model</p>
                <div className="space-y-1.5">
                  {formatOptions.map((fmt) => (
                    <button key={fmt.value} onClick={() => setLocal({ ...local, geometry_file_format: fmt.value as any })}
                      className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                        local.geometry_file_format === fmt.value ? 'bg-accent-blue/15 border border-accent-blue/25' : 'bg-bg-elevated border border-border-primary hover:border-border-hover')}>
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                        local.geometry_file_format === fmt.value ? 'bg-accent-blue/20 text-accent-blue' : 'bg-bg-tertiary text-text-dim')}>{fmt.value.toUpperCase()}</div>
                      <div><span className="text-text-primary text-sm font-medium block">{fmt.label}</span><span className="text-text-muted text-[11px]">{fmt.desc}</span></div>
                      {local.geometry_file_format === fmt.value && <div className="ml-auto h-2 w-2 rounded-full bg-accent-blue" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-border-primary pt-4">
                <p className="text-xs text-text-muted mb-3">Single mesh vs separate parts for editing</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setLocal({ ...local, generation_method: 'single' })}
                    className={cn('px-4 py-3 rounded-xl text-left transition-all',
                      local.generation_method === 'single' ? 'bg-accent-blue/15 border border-accent-blue/25' : 'bg-bg-elevated border border-border-primary hover:border-border-hover')}>
                    <span className="text-text-primary text-sm font-medium block">Single Object</span>
                    <p className="text-text-dim text-[11px]">Merged mesh</p>
                  </button>
                  <button onClick={() => setLocal({ ...local, generation_method: 'multiple' })}
                    className={cn('px-4 py-3 rounded-xl text-left transition-all',
                      local.generation_method === 'multiple' ? 'bg-accent-blue/15 border border-accent-blue/25' : 'bg-bg-elevated border border-border-primary hover:border-border-hover')}>
                    <span className="text-text-primary text-sm font-medium block">Multiple Parts</span>
                    <p className="text-text-dim text-[11px]">Separate objects</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted mb-3">How light interacts with the model surface</p>
                <div className="space-y-2">
                  {materialOptions.map((mat) => (
                    <button key={mat.value} onClick={() => setLocal({ ...local, material: mat.value })}
                      className={cn('w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all',
                        local.material === mat.value ? 'bg-accent-blue/15 border border-accent-blue/25' : 'bg-bg-elevated border border-border-primary hover:border-border-hover')}>
                      <span className="text-2xl">{mat.icon}</span>
                      <div className="flex-1"><span className="text-text-primary text-sm font-medium block">{mat.label}</span><span className="text-text-muted text-[11px] leading-relaxed">{mat.desc}</span></div>
                      {local.material === mat.value && <div className="h-2 w-2 rounded-full bg-accent-blue flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border-primary bg-bg-elevated p-3.5">
                <div className="flex items-center gap-3">
                  <PersonStanding className="h-4 w-4 text-amber-400" />
                  <div><span className="text-text-primary text-sm font-medium">T/A Pose</span><p className="text-text-dim text-[11px]">Force human-like models into T-pose</p></div>
                </div>
                <button onClick={() => setLocal({ ...local, TAPose: !local.TAPose })}
                  className={cn('w-10 h-6 rounded-full transition-colors relative', local.TAPose ? 'bg-accent-blue' : 'bg-bg-tertiary')}>
                  <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all', local.TAPose ? 'left-5' : 'left-1')} />
                </button>
              </div>
              <div className="border-t border-border-primary pt-4">
                <p className="text-xs text-text-muted mb-3">Texture Resolution</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setLocal({ ...local, texture_quality: 'standard' })}
                    className={cn('px-4 py-3 rounded-xl text-left transition-all',
                      local.texture_quality === 'standard' ? 'bg-accent-blue/15 border border-accent-blue/25' : 'bg-bg-elevated border border-border-primary hover:border-border-hover')}>
                    <span className="text-text-primary text-sm font-medium block">Standard 2K</span>
                    <p className="text-text-dim text-[11px]">Default, faster</p>
                  </button>
                  <button onClick={() => setLocal({ ...local, texture_quality: '4k' })}
                    className={cn('px-4 py-3 rounded-xl text-left transition-all',
                      local.texture_quality === '4k' ? 'bg-accent-blue/15 border border-accent-blue/25' : 'bg-bg-elevated border border-border-primary hover:border-border-hover')}>
                    <span className="text-text-primary text-sm font-medium block">4K High</span>
                    <p className="text-text-dim text-[11px]">Sharper, longer</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border-primary bg-bg-elevated p-4">
                <div className="flex items-center gap-2 mb-3"><Info className="h-4 w-4 text-accent-blue" /><span className="text-text-primary text-sm font-medium">About Generation</span></div>
                <div className="space-y-2 text-text-muted text-xs leading-relaxed">
                  <p><span className="text-text-secondary font-medium">Tier Gen-2</span> — Latest Hyper3D Rodin model with improved geometry.</p>
                  <p><span className="text-text-secondary font-medium">Quad Mesh</span> — Models generated with quad topology.</p>
                  <p><span className="text-text-secondary font-medium">Generation Time</span> — Typically 30-120 seconds.</p>
                </div>
              </div>
              <div className="rounded-xl border border-border-primary bg-bg-elevated p-4">
                <div className="flex items-center gap-2 mb-2"><RotateCcw className="h-4 w-4 text-accent-blue" /><span className="text-text-primary text-sm font-medium">Seed (optional)</span></div>
                <p className="text-text-dim text-xs mb-3">Set a seed for reproducible generation (0-65535). Leave empty for random.</p>
                <input type="number" min={0} max={65535} placeholder="Random" value={local.seed ?? ''} onChange={(e) => setLocal({ ...local, seed: e.target.value === '' ? null : Math.min(65535, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full bg-bg-tertiary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-colors" />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-2 border-t border-border-primary">
          <button onClick={handleApply} className="w-full py-2.5 rounded-xl bg-accent-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors">Apply Settings</button>
        </div>
      </div>
    </div>
  )
}
