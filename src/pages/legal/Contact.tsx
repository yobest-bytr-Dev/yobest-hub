import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Send, MessageCircle, Loader2, Check, Globe, MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    }, 1500)
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-text-muted text-sm hover:text-text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent-green/15 flex items-center justify-center">
            <MessageCircle size={20} className="text-accent-green" />
          </div>
          <h1 className="text-3xl font-bold"><span className="gradient-text">Contact Us</span></h1>
        </div>
        <p className="text-text-secondary text-sm mb-8">Have a question, feedback, or need support? We would love to hear from you.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Mail, label: 'Email', value: 'support@yobest.com', color: 'text-accent-blue', bg: 'bg-accent-blue/15' },
            { icon: Globe, label: 'Discord', value: 'discord.gg/yobest', color: 'text-accent-purple', bg: 'bg-accent-purple/15' },
            { icon: Clock, label: 'Response Time', value: 'Within 24 hours', color: 'text-accent-green', bg: 'bg-accent-green/15' },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-bg-secondary border border-border-primary text-center">
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                <item.icon size={18} className={item.color} />
              </div>
              <p className="text-xs text-text-muted mb-1">{item.label}</p>
              <p className="text-sm text-text-primary font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-bg-secondary border border-border-primary p-6">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Message Sent!</h3>
              <p className="text-text-secondary text-sm mb-4">Thank you for reaching out. We will get back to you within 24 hours.</p>
              <button
                onClick={() => setSent(false)}
                className="px-4 py-2 rounded-xl bg-accent-blue/15 text-accent-blue text-sm font-medium border border-accent-blue/25 hover:bg-accent-blue/25 transition-all"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                >
                  <option value="">Select a topic...</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="dmca">DMCA / Copyright</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you need help with..."
                  rows={5}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
