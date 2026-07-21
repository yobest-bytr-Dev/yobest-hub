import { useState, useEffect, useRef, useCallback } from 'react'
import { Download, ArrowLeft, Upload, Settings, Wand2, Send, X, Loader2, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseUrl } from '@/config/supabase'
import ModelViewer from './ModelViewer'
import ModelControls from './ModelControls'
import StatusIndicator from './StatusIndicator'
import OptionsDialog from './OptionsDialog'
import type { ModelStats, AnimationInfo, DetectedMesh, MeshAssignment } from './ModelComponent'

const RODIN_API = `${supabaseUrl}/functions/v1/rodin-api`

export default function ThreeDGenerator() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [jobStatuses, setJobStatuses] = useState<Array<{ uuid: string; status: string }>>([])
  const [stage, setStage] = useState<'submitting' | 'generating' | 'downloading' | 'splitting' | 'rendering' | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showPrompt, setShowPrompt] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)
  const [modelStats, setModelStats] = useState<ModelStats | null>(null)
  const [wireframe, setWireframe] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [materialColor, setMaterialColor] = useState('#ffffff')
  const [animations, setAnimations] = useState<AnimationInfo[]>([])
  const [animIndex, setAnimIndex] = useState(0)
  const [animPlaying, setAnimPlaying] = useState(false)
  const [animSpeed, setAnimSpeed] = useState(1)
  const [animTime, setAnimTime] = useState(0)
  const [meshAssignments, setMeshAssignments] = useState<MeshAssignment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [options, setOptions] = useState({
    quality: 'medium' as 'ultra' | 'high' | 'medium' | 'low' | 'extra-low',
    geometry_file_format: 'glb' as 'glb' | 'usdz' | 'fbx' | 'obj' | 'stl',
    tier: 'Gen-2' as const,
    TAPose: false,
    material: 'PBR' as 'PBR' | 'Shaded',
    generation_method: 'single' as 'single' | 'multiple',
    texture_quality: 'standard' as 'standard' | '4k',
    seed: null as number | null,
  })

  // Smart Assistant
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: string; content: string }>>([])
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)
  const assistantEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current) } }, [])
  useEffect(() => { assistantEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [assistantMessages])

  const handleStatusCheck = useCallback(async (subscriptionKey: string, taskUuid: string) => {
    if (!isMountedRef.current) return
    try {
      setStage('generating')
      const resp = await fetch(`${RODIN_API}?action=status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_key: subscriptionKey }),
      })
      const data = await resp.json()
      if (!isMountedRef.current) return
      if (!data.jobs || !Array.isArray(data.jobs) || data.jobs.length === 0) throw new Error('No jobs found')
      setJobStatuses(data.jobs)
      const allDone = data.jobs.every((j: any) => j.status === 'Done')
      const anyFailed = data.jobs.some((j: any) => j.status === 'Failed')
      if (allDone) {
        setStage('downloading')
        const dlResp = await fetch(`${RODIN_API}?action=download`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task_uuid: taskUuid }),
        })
        const dlData = await dlResp.json()
        if (!isMountedRef.current) return
        if (dlData.list && dlData.list.length > 0) {
          const glb = dlData.list.find((f: any) => f.name.toLowerCase().endsWith('.glb'))
          if (glb) {
            setStage('rendering')
            const proxyUrl = `${RODIN_API}?action=proxy&url=${encodeURIComponent(glb.url)}`
            setModelUrl(proxyUrl)
            setDownloadUrl(glb.url)
            setShowPrompt(false)
          } else { setError('No GLB file found'); setIsLoading(false); setStage(null) }
        } else { setError('No files available'); setIsLoading(false); setStage(null) }
      } else if (anyFailed) {
        setError('Generation failed'); setIsLoading(false); setStage(null)
      } else {
        pollingTimerRef.current = setTimeout(() => handleStatusCheck(subscriptionKey, taskUuid), 3000)
      }
    } catch (err) {
      if (!isMountedRef.current) return
      setError(err instanceof Error ? err.message : 'Status check failed')
      setIsLoading(false); setStage(null)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() && previewImages.length === 0) return
    setIsLoading(true); setError(null); setModelUrl(null); setDownloadUrl(null); setStage('submitting')
    setModelStats(null); setWireframe(false); setMaterialColor('#ffffff'); setAnimations([]); setMeshAssignments([])
    if (pollingTimerRef.current) { clearTimeout(pollingTimerRef.current); pollingTimerRef.current = null }
    try {
      const formData = new FormData()
      if (prompt.trim()) formData.append('prompt', prompt.trim())
      formData.append('tier', options.tier)
      formData.append('geometry_file_format', options.geometry_file_format)
      formData.append('material', options.material)
      if (options.quality === 'ultra') formData.append('quality_override', '200000')
      else formData.append('quality', options.quality)
      formData.append('mesh_mode', 'Quad')
      if (options.TAPose) formData.append('TAPose', 'true')
      if (options.texture_quality === '4k') formData.append('addons', '["HighPack"]')
      if (options.seed !== null) formData.append('seed', String(options.seed))
      const resp = await fetch(`${RODIN_API}?action=submit`, { method: 'POST', body: formData })
      const data = await resp.json()
      if (data.jobs && data.jobs.subscription_key && data.uuid) {
        handleStatusCheck(data.jobs.subscription_key, data.uuid)
      } else { setError('Missing data for status checking'); setIsLoading(false); setStage(null) }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false); setStage(null)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + previewImages.length > 5) { setError('Max 5 images'); return }
    const newUrls = files.map((f) => URL.createObjectURL(f))
    setPreviewImages([...previewImages, ...newUrls])
  }

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previewImages[idx])
    setPreviewImages(previewImages.filter((_, i) => i !== idx))
  }

  const handleDownload = useCallback(() => {
    if (downloadUrl) { const a = document.createElement('a'); a.href = downloadUrl; a.download = `${prompt || 'model'}.glb`; a.click() }
  }, [downloadUrl, prompt])

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) { const a = document.createElement('a'); a.download = `${prompt || 'screenshot'}.png`; a.href = canvas.toDataURL('image/png'); a.click() }
  }, [prompt])

  const handleBack = useCallback(() => {
    setShowPrompt(true); setModelUrl(null); setDownloadUrl(null); setStage(null); setModelStats(null); setAnimations([]); setMeshAssignments([])
    if (pollingTimerRef.current) { clearTimeout(pollingTimerRef.current); pollingTimerRef.current = null }
  }, [])

  const handleModelLoaded = useCallback(() => { setIsLoading(false); setStage(null); setShowPrompt(false) }, [])

  const sendAssistantMessage = async (text?: string) => {
    const msg = (text || assistantInput).trim()
    if (!msg || assistantLoading) return
    const userMsg = { role: 'user', content: msg }
    setAssistantMessages((p) => [...p, userMsg])
    setAssistantInput(''); setAssistantLoading(true)
    try {
      const resp = await fetch(`${RODIN_API}?action=chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...assistantMessages, userMsg] }),
      })
      const data = await resp.json()
      setAssistantMessages((p) => [...p, { role: 'assistant', content: data.content }])
    } catch { setAssistantMessages((p) => [...p, { role: 'assistant', content: 'Error getting response' }]) }
    setAssistantLoading(false)
  }

  const suggestedPrompts = ['A futuristic sci-fi helmet', 'Medieval fantasy sword', 'Cute cartoon cat character', 'Modern minimalist lamp', 'Ancient Greek statue']

  const modelControlsVisible = !isLoading && !!modelUrl && !showPrompt

  return (
    <div className="relative rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden" style={{ height: '70vh', minHeight: 500 }}>
      <div className="absolute inset-0 z-0">
        <ModelViewer
          modelUrl={modelUrl} onModelLoaded={handleModelLoaded} onStats={setModelStats} onAnimations={setAnimations}
          wireframe={wireframe} autoRotate={autoRotate} materialColor={materialColor}
          animIndex={animIndex} animPlaying={animPlaying} animSpeed={animSpeed} meshAssignments={meshAssignments}
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 pointer-events-auto">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <div className="relative px-4 pt-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">3D Model Generator</h1>
              <p className="text-white/40 text-xs mt-0.5">Powered by <span className="text-white/60 font-medium">Yobest Bytr</span></p>
            </div>
            <div className="flex items-center gap-2">
              <label className="bg-white/10 hover:bg-white/15 text-white backdrop-blur-sm border border-white/10 rounded-xl h-9 w-9 flex items-center justify-center transition-all cursor-pointer" title="Upload Model">
                <Upload className="h-4 w-4" />
                <input type="file" accept=".glb,.gltf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setModelUrl(URL.createObjectURL(f)); setShowPrompt(false); setIsLoading(false); setStage(null) } }} />
              </label>
            </div>
          </div>
        </div>

        <StatusIndicator isLoading={isLoading} jobStatuses={jobStatuses} stage={stage} />

        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto max-w-md w-full px-4">
            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-300 text-xs">Dismiss</button>
            </div>
          </div>
        )}

        {modelControlsVisible && (
          <ModelControls
            stats={modelStats} wireframe={wireframe} autoRotate={autoRotate}
            onToggleWireframe={() => setWireframe(!wireframe)} onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
            onDownload={handleDownload} onScreenshot={handleScreenshot} onBack={handleBack}
            materialColor={materialColor} onColorChange={setMaterialColor}
            animations={animations} animIndex={animIndex} animPlaying={animPlaying} animSpeed={animSpeed} animTime={animTime}
            onSelectAnimation={setAnimIndex} onToggleAnimation={() => setAnimPlaying(!animPlaying)}
            onAnimSpeedChange={setAnimSpeed} onAnimSeek={setAnimTime}
          />
        )}

        {showPrompt && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            <div className="relative px-4 pb-4 max-w-3xl mx-auto">
              <form onSubmit={handleSubmit}
                className="relative rounded-2xl overflow-hidden bg-black/50 backdrop-blur-xl border border-white/10">
                {previewImages.length > 0 && (
                  <div className="flex gap-2 px-3 pt-3 overflow-x-auto">
                    {previewImages.map((url, i) => (
                      <div key={i} className="relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border border-white/10">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center text-white text-[10px]"><X className="h-2.5 w-2.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-3 py-2 flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white/30 hover:text-white/70 rounded-xl h-9 w-9 flex items-center justify-center hover:bg-white/5 transition-all">
                      <ImageIcon className="h-[18px] w-[18px]" />
                    </button>
                    <button type="button" onClick={() => setShowOptions(true)} className="text-white/30 hover:text-white/70 rounded-xl h-9 w-9 flex items-center justify-center hover:bg-white/5 transition-all">
                      <Settings className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                  <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your 3D model..."
                    className="flex-1 bg-transparent text-white placeholder:text-white/25 py-1.5 px-2 text-[15px] focus:outline-none" disabled={isLoading} />
                  <button type="submit" disabled={isLoading || (!prompt.trim() && previewImages.length === 0)}
                    className={cn('rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all', isLoading ? 'bg-white/10 text-white/40' : 'bg-white text-black hover:bg-gray-200')}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant FAB + Panel */}
      <button onClick={() => setShowAssistant(!showAssistant)}
        className={cn('absolute z-40 rounded-full shadow-2xl flex items-center gap-2.5 px-5 py-3 transition-all duration-300 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white border-0 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 pointer-events-auto',
          modelControlsVisible ? 'bottom-28 right-6' : 'bottom-6 right-6')}>
        <Wand2 className="h-4 w-4" /><span className="text-sm font-semibold">AI Assistant</span>
      </button>

      {showAssistant && (
        <div className="absolute bottom-20 right-6 w-[400px] h-[500px] z-50 flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl pointer-events-auto" style={{ background: 'rgba(8,8,10,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center"><Wand2 className="h-4 w-4 text-white" /></div>
              <div><span className="text-white font-semibold text-sm">AI Prompt Assistant</span><p className="text-white/30 text-[11px]">Powered by AI</p></div>
            </div>
            <button onClick={() => setShowAssistant(false)} className="h-7 w-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {assistantMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/10 flex items-center justify-center mb-4"><Wand2 className="h-6 w-6 text-violet-400" /></div>
                <h3 className="text-white font-medium text-sm mb-1">What do you want to create?</h3>
                <p className="text-white/30 text-xs mb-5 leading-relaxed">Describe your idea and I'll help you write the perfect prompt.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedPrompts.map((p, i) => (
                    <button key={i} onClick={() => sendAssistantMessage(p)} className="px-3 py-1.5 text-xs text-white/50 bg-white/5 hover:bg-white/10 hover:text-white/80 border border-white/10 rounded-full transition-all">{p}</button>
                  ))}
                </div>
              </div>
            )}
            {assistantMessages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed', msg.role === 'user' ? 'bg-white text-black rounded-2xl rounded-br-md' : 'bg-white/5 text-white/90 rounded-2xl rounded-bl-md border border-white/10')}>
                  <p className="whitespace-pre-wrap break-words">{msg.content.replace(/\[PROMPT\]([\s\S]*?)\[\/PROMPT\]/g, '$1')}</p>
                  {msg.role === 'assistant' && msg.content.includes('[PROMPT]') && (
                    <button onClick={() => { const m = msg.content.match(/\[PROMPT\](.*?)\[\/PROMPT\]/s); if (m) { setPrompt(m[1].trim()); setShowAssistant(false) } }}
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-lg transition-colors">
                      <Wand2 className="h-3 w-3" /> Use this prompt
                    </button>
                  )}
                </div>
              </div>
            ))}
            {assistantLoading && <div className="flex justify-start"><div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3"><div className="flex gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>}
            <div ref={assistantEndRef} />
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-white/10">
            <div className="flex items-end gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10 focus-within:border-violet-500/30 transition-colors">
              <textarea value={assistantInput} onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAssistantMessage() } }}
                placeholder="Describe what you want to create..." rows={1}
                className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none placeholder:text-white/25 max-h-24" />
              <button onClick={() => sendAssistantMessage()} disabled={!assistantInput.trim() || assistantLoading}
                className={cn('h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-all', assistantInput.trim() && !assistantLoading ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-white/5 text-white/20')}>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <OptionsDialog open={showOptions} onClose={() => setShowOptions(false)} options={options} onApply={setOptions} />
    </div>
  )
}

function ImageIcon(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
}
