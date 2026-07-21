import { Download, Eye, EyeOff, RotateCw, Palette, Maximize2, Send, ChevronDown, Box, Monitor, Copy, Play, Pause, SkipBack, SkipForward, ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModelStats, AnimationInfo } from './ModelComponent'
import { useState, useRef, useEffect, useCallback } from 'react'

interface Props {
  stats: ModelStats | null
  wireframe: boolean
  autoRotate: boolean
  onToggleWireframe: () => void
  onToggleAutoRotate: () => void
  onDownload: () => void
  onScreenshot: () => void
  onBack: () => void
  materialColor?: string
  onColorChange?: (c: string) => void
  animations?: AnimationInfo[]
  animIndex?: number
  animPlaying?: boolean
  animSpeed?: number
  animTime?: number
  onSelectAnimation?: (i: number) => void
  onToggleAnimation?: () => void
  onAnimSpeedChange?: (s: number) => void
  onAnimSeek?: (t: number) => void
}

const presetColors = ['#ffffff', '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#20c997', '#868e96']

export default function ModelControls({
  stats, wireframe, autoRotate, onToggleWireframe, onToggleAutoRotate,
  onDownload, onScreenshot, onBack, materialColor, onColorChange,
  animations, animIndex, animPlaying, animSpeed, animTime,
  onSelectAnimation, onToggleAnimation, onAnimSpeedChange, onAnimSeek,
}: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showAnimPanel, setShowAnimPanel] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false)
    }
    if (showExportMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showExportMenu])

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !animations || !animations[animIndex ?? 0]) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    onAnimSeek?.(Math.max(0, Math.min(1, x)) * animations[animIndex ?? 0].duration)
  }, [animations, animIndex, onAnimSeek])

  const hasAnimations = animations && animations.length > 0
  const currentAnim = animations?.[animIndex ?? 0]
  const animDuration = currentAnim?.duration ?? 0
  const animProgress = animDuration > 0 ? ((animTime ?? 0) / animDuration) * 100 : 0

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-auto z-20">
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
      <div className="relative px-4 pb-4 sm:px-6 sm:pb-5 space-y-2.5">
        {showColorPicker && (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2">
              {presetColors.map((color) => (
                <button key={color} onClick={() => onColorChange?.(color)}
                  className={cn('w-6 h-6 rounded-md border-2 transition-all hover:scale-110 flex-shrink-0', materialColor === color ? 'border-white shadow-lg shadow-white/20' : 'border-white/10')}
                  style={{ backgroundColor: color }} />
              ))}
              <div className="w-px h-5 bg-white/10 mx-1 flex-shrink-0" />
              <input type="color" value={materialColor || '#ffffff'} onChange={(e) => onColorChange?.(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0 flex-shrink-0" />
            </div>
          </div>
        )}

        {showAnimPanel && hasAnimations && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 w-full max-w-md">
              <button onClick={() => onSelectAnimation?.(Math.max(0, (animIndex ?? 0) - 1))}
                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0">
                <SkipBack className="h-3.5 w-3.5" />
              </button>
              <button onClick={onToggleAnimation}
                className={cn('h-9 w-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0', animPlaying ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-white/10 hover:bg-white/15 text-white')}>
                {animPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button onClick={() => onSelectAnimation?.(Math.min((animations?.length ?? 1) - 1, (animIndex ?? 0) + 1))}
                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0">
                <SkipForward className="h-3.5 w-3.5" />
              </button>
              <select value={animIndex ?? 0} onChange={(e) => onSelectAnimation?.(Number(e.target.value))}
                className="flex-1 bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none">
                {animations.map((a) => <option key={a.index} value={a.index} className="bg-black text-white">{a.name} ({a.duration.toFixed(1)}s)</option>)}
              </select>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <button key={speed} onClick={() => onAnimSpeedChange?.(speed)}
                    className={cn('px-1.5 py-1 rounded text-[10px] font-medium transition-all', animSpeed === speed ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/5')}>
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full max-w-md">
              <div ref={timelineRef} onClick={handleTimelineClick}
                className="relative h-6 bg-black/50 rounded-lg border border-white/10 cursor-pointer overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600/40 to-indigo-600/40 rounded-lg transition-all duration-75" style={{ width: `${animProgress}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/30 transition-all duration-75" style={{ left: `${animProgress}%` }} />
                <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                  <span className="text-[10px] text-white/30 font-mono">{(animTime ?? 0).toFixed(1)}s</span>
                  <span className="text-[10px] text-white/30 font-mono">{animDuration.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAnimPanel && !hasAnimations && (
          <div className="flex items-center justify-center">
            <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-white/40 text-xs">No animations found in this model</p>
            </div>
          </div>
        )}

        {stats && (stats.vertices > 0 || stats.faces > 0) && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {stats.vertices > 0 && (
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-0.5">
                <Box className="h-3 w-3 text-violet-400" />
                <span className="text-white/50 text-[11px]">{stats.vertices.toLocaleString()} verts</span>
              </div>
            )}
            {stats.faces > 0 && (
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-0.5">
                <Monitor className="h-3 w-3 text-indigo-400" />
                <span className="text-white/50 text-[11px]">{stats.faces.toLocaleString()} faces</span>
              </div>
            )}
            {stats.meshes > 0 && (
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-0.5">
                <Copy className="h-3 w-3 text-emerald-400" />
                <span className="text-white/50 text-[11px]">{stats.meshes} meshes</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <button onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-all flex-shrink-0">
              New
            </button>
            <div className="h-5 w-px bg-white/10 flex-shrink-0" />
            <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-0.5 flex-shrink-0">
              <ToolBtn icon={wireframe ? Eye : EyeOff} active={wireframe} onClick={onToggleWireframe} title="Wireframe" />
              <ToolBtn icon={RotateCw} active={autoRotate} onClick={onToggleAutoRotate} title="Auto Rotate" />
              <ToolBtn icon={Palette} active={showColorPicker} onClick={() => { setShowColorPicker(!showColorPicker); setShowAnimPanel(false) }} title="Color" />
              {hasAnimations && (
                <ToolBtn icon={animPlaying ? Pause : Play} active={showAnimPanel} onClick={() => { setShowAnimPanel(!showAnimPanel); setShowColorPicker(false) }} title="Animations" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={onScreenshot} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all" title="Screenshot">
              <Maximize2 className="h-4 w-4" />
            </button>
            <div className="relative" ref={exportMenuRef}>
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 rounded-xl px-3 h-9 flex items-center gap-1.5 text-xs font-medium transition-all">
                <Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span> <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
              {showExportMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="p-1">
                    <button onClick={() => { onDownload(); setShowExportMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all text-left">
                      <div className="h-7 w-7 rounded-lg bg-[#E87D0D]/10 flex items-center justify-center flex-shrink-0"><ExternalLink className="h-3.5 w-3.5 text-[#E87D0D]" /></div>
                      <div><p className="text-white text-xs font-medium">Open in Blender</p><p className="text-white/30 text-[10px]">Download .glb for Blender 3.0+</p></div>
                    </button>
                    <button onClick={() => { onDownload(); setShowExportMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all text-left">
                      <div className="h-7 w-7 rounded-lg bg-[#E2231A]/10 flex items-center justify-center flex-shrink-0"><ExternalLink className="h-3.5 w-3.5 text-[#E2231A]" /></div>
                      <div><p className="text-white text-xs font-medium">Import to Roblox Studio</p><p className="text-white/30 text-[10px]">Upload via Asset Manager</p></div>
                    </button>
                    <button onClick={() => { onDownload(); setShowExportMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all text-left">
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><Download className="h-3.5 w-3.5 text-white/40" /></div>
                      <div><p className="text-white text-xs font-medium">Download .glb</p><p className="text-white/30 text-[10px]">Universal 3D format</p></div>
                    </button>
                  </div>
                  <div className="border-t border-white/10 px-3 py-2">
                    <p className="text-white/20 text-[10px] leading-relaxed">Blender: File &gt; Import &gt; glTF. Roblox: Avatar &gt; Import 3D.</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={onDownload} className="bg-white hover:bg-gray-100 text-black rounded-xl px-4 h-9 flex items-center gap-1.5 text-xs font-semibold shadow-lg shadow-white/10 transition-all">
              <Download className="h-3.5 w-3.5" /> <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolBtn({ icon: Icon, active, onClick, title }: { icon: any; active: boolean; onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} title={title}
      className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-all', active ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/5')}>
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}
