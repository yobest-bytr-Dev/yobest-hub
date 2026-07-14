import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, ArrowLeft, Shield, Scale, Mail, MessageCircle } from 'lucide-react'

export default function Terms() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-text-muted text-sm hover:text-text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center">
            <FileText size={20} className="text-accent-blue" />
          </div>
          <h1 className="text-3xl font-bold"><span className="gradient-text">Terms of Service</span></h1>
        </div>
        <p className="text-text-muted text-sm mb-8">Last updated: July 2026</p>

        <div className="prose-custom space-y-8 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Scale size={18} className="text-accent-blue" /> 1. Acceptance of Terms
            </h2>
            <p>By accessing or using Yobest ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. Yobest is an independent platform and is <strong className="text-text-primary">not affiliated with, endorsed by, or connected to Roblox Corporation</strong> in any way.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Shield size={18} className="text-accent-purple" /> 2. Account & Identity
            </h2>
            <p>To use certain features, you must create an account using your Roblox username. You are responsible for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Maintaining the confidentiality of your Yobest password</li>
              <li>All activity that occurs under your account</li>
              <li>Ensuring your Roblox username information is accurate and current</li>
            </ul>
            <p className="mt-2">You may not share your account credentials with others or create multiple accounts.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FileText size={18} className="text-accent-green" /> 3. Content & Ownership
            </h2>
            <p>You retain full ownership of all games, scripts, assets, and other content you submit to Yobest. By submitting content, you grant Yobest a non-exclusive, worldwide license to display, distribute, and promote your content on the Platform.</p>
            <p className="mt-2">You may not submit content that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains malware, viruses, or harmful code</li>
              <li>Violates Roblox Community Standards</li>
              <li>Is illegal, harmful, or otherwise objectionable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <MessageCircle size={18} className="text-accent-pink" /> 4. AI Services
            </h2>
            <p>The Yobest AI Architect generates code and suggestions using third-party AI models. Generated code is provided "as is" and you are responsible for reviewing and testing it before use in production. Yobest does not guarantee the correctness or安全性 of AI-generated code.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Mail size={18} className="text-accent-orange" /> 5. Termination
            </h2>
            <p>We reserve the right to suspend or terminate your account at any time for violations of these Terms, fraudulent activity, or behavior that harms the community. You may also delete your account at any time through your profile settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Shield size={18} className="text-accent-cyan" /> 6. Disclaimer
            </h2>
            <p>Yobest is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Platform. We do not guarantee uninterrupted or error-free service.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border-primary text-center">
          <p className="text-text-muted text-xs">Questions about these terms? <Link to="/contact" className="text-accent-blue hover:underline">Contact us</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
