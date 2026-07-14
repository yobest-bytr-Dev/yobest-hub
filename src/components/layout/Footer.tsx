import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border-primary bg-bg-secondary/60 backdrop-blur-lg relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="gradient-text">YO</span>
                <span className="text-text-primary">BEST</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              The ultimate Roblox creator platform. Build, share, and monetize your games.
            </p>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold text-sm mb-4">Platform</h3>
            <ul className="space-y-2.5">
              <li><Link to="/games" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Games</Link></li>
              <li><Link to="/ai" className="text-text-muted text-sm hover:text-accent-blue transition-colors">AI Architect</Link></li>
              <li><Link to="/community" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Community</Link></li>
              <li><Link to="/marketplace" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Marketplace</Link></li>
              <li><Link to="/creators" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Creators</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-2.5">
              <li><Link to="/ai" className="text-text-muted text-sm hover:text-accent-blue transition-colors">AI Assistant</Link></li>
              <li><Link to="/games" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Game Registry</Link></li>
              <li><Link to="/marketplace" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Asset Store</Link></li>
              <li><Link to="/profile" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Your Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2.5">
              <li><Link to="/terms" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Privacy Policy</Link></li>
              <li><Link to="/dmca" className="text-text-muted text-sm hover:text-accent-blue transition-colors">DMCA Policy</Link></li>
              <li><Link to="/contact" className="text-text-muted text-sm hover:text-accent-blue transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border-primary flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            &copy; {new Date().getFullYear()} Yobest. Not affiliated with Roblox Corporation.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-text-muted text-xs hover:text-red-400 transition-colors">YouTube</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-text-muted text-xs hover:text-accent-purple transition-colors">Discord</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-text-muted text-xs hover:text-accent-cyan transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
