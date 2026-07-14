import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl max-w-sm',
                t.type === 'success' && 'bg-green-500/10 border-green-500/25 text-green-400',
                t.type === 'error' && 'bg-red-500/10 border-red-500/25 text-red-400',
                t.type === 'info' && 'bg-accent-blue/10 border-accent-blue/25 text-accent-blue',
              )}>
                {t.type === 'success' && <CheckCircle size={16} className="shrink-0" />}
                {t.type === 'error' && <XCircle size={16} className="shrink-0" />}
                {t.type === 'info' && <Info size={16} className="shrink-0" />}
                <span className="text-sm font-medium flex-1">{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="shrink-0 p-0.5 hover:opacity-70 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
