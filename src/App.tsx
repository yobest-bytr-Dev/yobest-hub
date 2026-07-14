import { HashRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Games from '@/pages/Games'
import GameDetail from '@/pages/GameDetail'
import AI from '@/pages/AI'
import Community from '@/pages/Community'
import Marketplace from '@/pages/Marketplace'
import Auth from '@/pages/Auth'
import Profile from '@/pages/Profile'
import PublicProfile from '@/pages/PublicProfile'
import Creators from '@/pages/Creators'
import Messages from '@/pages/Messages'
import Terms from '@/pages/legal/Terms'
import Privacy from '@/pages/legal/Privacy'
import DMCA from '@/pages/legal/DMCA'
import Contact from '@/pages/legal/Contact'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/community" element={<Community />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:participantId" element={<Messages />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  )
}
