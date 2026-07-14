import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copyright, ArrowLeft, AlertTriangle, Send, Clock } from 'lucide-react'

export default function DMCA() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-text-muted text-sm hover:text-text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
            <Copyright size={20} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-bold"><span className="gradient-text">DMCA Policy</span></h1>
        </div>
        <p className="text-text-muted text-sm mb-8">Last updated: July 2026</p>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Copyright size={18} className="text-accent-blue" /> Copyright Infringement Policy
            </h2>
            <p>Yobest respects the intellectual property rights of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond promptly to claims of copyright infringement reported to our designated copyright agent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-400" /> Filing a DMCA Notice
            </h2>
            <p>If you believe that content on Yobest infringes your copyright, please submit a written DMCA notice containing the following:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>A physical or electronic signature of the copyright owner or authorized agent</li>
              <li>Identification of the copyrighted work claimed to be infringed</li>
              <li>Identification of the infringing material and its location on Yobest (URL or description)</li>
              <li>Your contact information (name, address, phone number, email)</li>
              <li>A statement that you have a good faith belief that the use is not authorized</li>
              <li>A statement, under penalty of perjury, that the information is accurate and you are authorized to act</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Send size={18} className="text-accent-blue" /> How to Submit
            </h2>
            <p>Send your DMCA notice to our designated agent via email at:</p>
            <div className="mt-2 p-4 rounded-xl bg-bg-elevated border border-border-primary">
              <p className="text-text-primary font-medium">dmca@yobest.com</p>
            </div>
            <p className="mt-2">Alternatively, you may contact us through our <Link to="/contact" className="text-accent-blue hover:underline">Contact page</Link>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Clock size={18} className="text-accent-green" /> Counter-Notification
            </h2>
            <p>If your content was removed and you believe it was removed in error, you may file a counter-notification containing:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your physical or electronic signature</li>
              <li>Identification of the removed material and its former location</li>
              <li>A statement under penalty of perjury that the removal was a mistake</li>
              <li>Your consent to the jurisdiction of the federal court in your district</li>
              <li>Your contact information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">Repeat Infringers</h2>
            <p>We may terminate the accounts of users who are found to be repeat infringers. We reserve the right to remove content without prior notice.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border-primary text-center">
          <p className="text-text-muted text-xs">Need to file a DMCA notice? <Link to="/contact" className="text-accent-blue hover:underline">Contact us</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
