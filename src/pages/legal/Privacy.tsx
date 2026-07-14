import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft, Eye, Lock, Database, Globe } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-text-muted text-sm hover:text-text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 flex items-center justify-center">
            <Shield size={20} className="text-accent-purple" />
          </div>
          <h1 className="text-3xl font-bold"><span className="gradient-text">Privacy Policy</span></h1>
        </div>
        <p className="text-text-muted text-sm mb-8">Last updated: July 2026</p>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Eye size={18} className="text-accent-blue" /> 1. Information We Collect
            </h2>
            <p>When you use Yobest, we may collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-text-primary">Account Information:</strong> Email address, Roblox username, and Roblox user ID</li>
              <li><strong className="text-text-primary">Usage Data:</strong> Pages visited, features used, AI chat history (stored locally)</li>
              <li><strong className="text-text-primary">Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong className="text-text-primary">Content:</strong> Games, scripts, and assets you submit to the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Database size={18} className="text-accent-green" /> 2. How We Use Your Information
            </h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and maintain the Platform services</li>
              <li>Authenticate your identity via Roblox</li>
              <li>Improve AI responses and platform features</li>
              <li>Send important account and security notifications</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Lock size={18} className="text-accent-purple" /> 3. Data Storage & Security
            </h2>
            <p>Your data is stored on Supabase (PostgreSQL) with industry-standard encryption. AI chat messages are stored locally in your browser via localStorage and are never sent to our servers. We implement appropriate security measures but cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Globe size={18} className="text-accent-cyan" /> 4. Third-Party Services
            </h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-text-primary">Supabase:</strong> Authentication and database hosting</li>
              <li><strong className="text-text-primary">OpenRouter:</strong> AI model API access</li>
              <li><strong className="text-text-primary">Roblox API:</strong> Username verification and avatar data</li>
            </ul>
            <p className="mt-2">Each third-party service has its own privacy policy governing data handling.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Shield size={18} className="text-accent-pink" /> 5. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of non-essential data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">6. Children's Privacy</h2>
            <p>Yobest is not directed to children under 13. We do not knowingly collect personal information from children. If you are a parent and believe your child has provided personal information, please contact us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the Platform.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border-primary text-center">
          <p className="text-text-muted text-xs">Questions about privacy? <Link to="/contact" className="text-accent-blue hover:underline">Contact us</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
