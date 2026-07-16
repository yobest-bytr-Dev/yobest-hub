import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, Check, Zap, AlertTriangle, ShieldCheck, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SB_URL = 'https://pohslivolczprxacroje.supabase.co'
const SB_KEY = 'sb_publishable_zg1KBuWhnqVm8GM8q4siIA_M1BC1vyG'

type Step = 'email' | 'code' | 'password' | 'done'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SB_URL}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SB_KEY,
        },
        body: JSON.stringify({ email: email.trim(), action: 'send-code' }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to send code')
      setStep('code')
    } catch (err: any) {
      setError(err.message || 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || code.trim().length !== 6) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SB_URL}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SB_KEY,
        },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), action: 'verify' }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        const msg = data.error || 'Invalid code'
        if (msg.includes('Incorrect code')) {
          const match = msg.match(/(\d+) attempt/)
          if (match) setAttemptsLeft(parseInt(match[1]))
        }
        throw new Error(msg)
      }
      setStep('password')
    } catch (err: any) {
      if (err.message.includes('not found') || err.message.includes('expired') || err.message.includes('Incorrect') || err.message.includes('attempts')) {
        setError(err.message)
      } else {
        setError('Could not verify code. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SB_URL}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SB_KEY,
        },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to reset password')
      setStep('done')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-blue/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-purple/8 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-blue/20">
            {step === 'email' && <Zap size={28} className="text-white" />}
            {step === 'code' && <ShieldCheck size={28} className="text-white" />}
            {step === 'password' && <Lock size={28} className="text-white" />}
            {step === 'done' && <Check size={28} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {step === 'email' && 'Forgot Password?'}
            {step === 'code' && 'Enter Verification Code'}
            {step === 'password' && 'Set New Password'}
            {step === 'done' && 'Password Reset!'}
          </h1>
          <p className="text-text-secondary text-sm">
            {step === 'email' && "Enter your email and we'll send you a verification code"}
            {step === 'code' && `We sent a 6-digit code to ${email}`}
            {step === 'password' && 'Enter your new password below'}
            {step === 'done' && 'Your password has been updated successfully'}
          </p>
        </div>

        <div className="rounded-2xl bg-bg-secondary border border-border-primary p-5 sm:p-6">

          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto">
                <Check size={32} className="text-green-400" />
              </div>
              <p className="text-text-secondary text-sm">You can now sign in with your new password.</p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <ArrowRight size={16} /> Go to Sign In
              </button>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-blue/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Mail size={16} /> Send Verification Code</>}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">6-Digit Code</label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
                    placeholder="000000"
                    required
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm text-center tracking-[0.5em] font-mono placeholder:text-text-dim placeholder:tracking-normal focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-blue/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ShieldCheck size={16} /> Verify Code</>}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(''); setAttemptsLeft(null) }}
                className="w-full text-center text-accent-blue text-xs font-medium hover:underline"
              >
                Back to email
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoFocus
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    minLength={6}
                    className={cn(
                      'w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-elevated border text-text-primary text-sm placeholder:text-text-dim focus:outline-none transition-all',
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/25'
                        : 'border-border-primary focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25'
                    )}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-400">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || password !== confirmPassword || password.length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-blue/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Lock size={16} /> Reset Password</>}
              </button>
            </form>
          )}

          {step !== 'done' && (
            <div className="mt-5 text-center">
              <Link
                to="/auth"
                className="text-accent-blue text-xs font-medium hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft size={12} /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
