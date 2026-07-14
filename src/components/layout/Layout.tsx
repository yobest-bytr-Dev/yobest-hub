import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import NotificationPrompt from '@/components/ui/NotificationPrompt'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { trackVisit, getSiteAnalytics } from '@/lib/analytics'

export default function Layout() {
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const location = useLocation()
  const setSiteAnalytics = useStore((s) => s.setSiteAnalytics)

  useEffect(() => {
    trackVisit().then(() => getSiteAnalytics()).then(setSiteAnalytics)
  }, [setSiteAnalytics])

  return (
    <div className="min-h-screen bg-bg-primary relative z-10">
      <Navbar />
      <Sidebar />
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          sidebarOpen ? 'lg:pl-[220px]' : 'lg:pl-[68px]'
        )}
      >
        <div className="min-h-[calc(100vh-4rem)]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        <Footer />
      </main>
      <NotificationPrompt />
    </div>
  )
}
