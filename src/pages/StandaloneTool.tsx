import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Box, Palette, Loader2 } from 'lucide-react'

const ThreeDGenerator = lazy(() => import('@/components/tools/ThreeDGenerator'))
const UIGenerator = lazy(() => import('@/components/tools/UIGenerator'))

const TOOL_CONFIG: Record<string, { title: string; desc: string; icon: any; gradient: string; component: any }> = {
  '3d-generator': {
    title: '3D Model Generator',
    desc: 'Generate stunning 3D models from text descriptions using Yobest3D AI.',
    icon: Box,
    gradient: 'from-accent-blue to-accent-purple',
    component: ThreeDGenerator,
  },
  'ui-generator': {
    title: 'Roblox UI Generator',
    desc: 'Build professional Roblox game interfaces with AI.',
    icon: Palette,
    gradient: 'from-accent-purple to-accent-pink',
    component: UIGenerator,
  },
}

function ToolLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={24} className="animate-spin text-accent-blue" />
    </div>
  )
}

export default function StandaloneTool({ toolId }: { toolId: string }) {
  const navigate = useNavigate()
  const config = TOOL_CONFIG[toolId]
  if (!config) return <div className="text-center py-20 text-text-muted">Tool not found</div>
  const Icon = config.icon
  const ToolComponent = config.component

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/tools')} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-secondary border border-border-primary text-text-muted hover:text-text-primary hover:border-border-hover transition-all text-xs">
              <ArrowLeft size={14} /> Tools
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">{config.title}</h1>
                <p className="text-xs text-text-muted">{config.desc}</p>
              </div>
            </div>
          </div>

          {/* Tool */}
          <Suspense fallback={<ToolLoader />}>
            <ToolComponent />
          </Suspense>
        </motion.div>
      </div>
    </div>
  )
}
