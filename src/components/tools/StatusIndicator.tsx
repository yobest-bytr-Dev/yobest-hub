import { Loader2, Check, Download, Sparkles, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  isLoading: boolean
  jobStatuses: Array<{ uuid: string; status: string }>
  stage: 'submitting' | 'generating' | 'downloading' | 'splitting' | 'rendering' | null
}

const stages = [
  { id: 'submitting', label: 'Submitting', icon: Sparkles },
  { id: 'generating', label: 'Generating', icon: Loader2 },
  { id: 'downloading', label: 'Downloading', icon: Download },
  { id: 'splitting', label: 'Splitting', icon: Scissors },
  { id: 'rendering', label: 'Rendering', icon: Check },
] as const

export default function StatusIndicator({ isLoading, jobStatuses, stage }: Props) {
  if (!isLoading || !stage) return null

  const actualTasks = jobStatuses.length
  const totalTasks = actualTasks > 0 ? actualTasks + 1 : 0
  const completedJobTasks = jobStatuses.filter((j) => j.status === 'Done').length
  const initialRequestComplete = actualTasks > 0 ? 1 : 0
  const completedTasks = completedJobTasks + initialRequestComplete
  const showProgress = actualTasks > 0
  const currentStageIndex = stages.findIndex((s) => s.id === stage)
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stageMessages: Record<string, string> = {
    submitting: 'Setting up the generation task',
    generating: percentage > 0 ? `${percentage}% complete` : 'AI is crafting your model',
    downloading: 'Retrieving generated files',
    splitting: 'Splitting model into separate parts',
    rendering: 'Loading into 3D viewer',
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto w-[340px]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" />
                <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-white text-base font-medium truncate">
                  {stage === 'submitting' && 'Preparing your model'}
                  {stage === 'generating' && 'Generating your 3D model'}
                  {stage === 'downloading' && 'Downloading model files'}
                  {stage === 'splitting' && 'Splitting into separate parts'}
                  {stage === 'rendering' && 'Loading model'}
                </h3>
                <p className="text-white/50 text-sm mt-0.5 truncate">{stageMessages[stage]}</p>
              </div>
            </div>
            {showProgress && (
              <div className="mb-5">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-white/30">
                  <span>{completedTasks}/{totalTasks} jobs</span>
                  <span>{percentage}%</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-1">
              {stages.map((s, i) => {
                const isComplete = i < currentStageIndex
                const isCurrent = i === currentStageIndex
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className={cn('h-1.5 w-1.5 rounded-full transition-all duration-500',
                        isComplete ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : isCurrent ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]' : 'bg-white/15')} />
                      <span className={cn('text-[10px] uppercase font-medium transition-colors duration-300',
                        isComplete ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-white/20')}>{s.label}</span>
                    </div>
                    {i < stages.length - 1 && <div className={cn('w-full h-[1px] transition-colors duration-500', isComplete ? 'bg-emerald-400/40' : 'bg-white/10')} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
