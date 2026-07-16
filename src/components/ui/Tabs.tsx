import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  count?: number
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-2xl bg-bg-secondary/80 border border-border-primary backdrop-blur-sm', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/25'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/60'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold tabular-nums min-w-[24px] text-center',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-bg-elevated text-text-muted'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
