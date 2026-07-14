import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-xl bg-bg-secondary border border-border-primary', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            activeTab === tab.id
              ? 'bg-accent-blue/15 text-accent-blue shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="text-xs text-text-muted">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}
