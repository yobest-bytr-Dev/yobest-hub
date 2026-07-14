import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Check, X, Gamepad2, ShieldCheck } from 'lucide-react'
import { signIn, signUp, getCurrentProfile } from '@/lib/api'
import { useStore } from '@/store/useStore'
import { verifyRobloxUsername, type RobloxUser } from '@/lib/roblox'
import { saveAccount } from '@/lib/accounts'
import { cn } from '@/lib/utils'

type AuthMode = 'signin' | 'signup'

export default function Auth() {
  const navigate = useNavigate()
  const { setCurrentUser } = useStore()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [robloxUsername, setRobloxUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [robloxUser, setRobloxUser] = useState<RobloxUser | null>(null)
  const [robloxVerified, setRobloxVerified] = useState(false)
  const [robloxError, setRobloxError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verifyTimeout, setVerifyTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleVerifyRoblox = useCallback(async (username: string) => {
    if (username.length < 3) {
      setRobloxUser(null)
      setRobloxVerified(false)
      setRobloxError('')
      return
    }

    setVerifying(true)
    setRobloxError('')

    const user = await verifyRobloxUsername(username)

    if (user) {
      setRobloxUser(user)
      setRobloxVerified(true)
      setRobloxError('')
    } else {
      setRobloxUser(null)
      setRobloxVerified(false)
      setRobloxError('Roblox user not found. Check the username and try again.')
    }
    setVerifying(false)
  }, [])

  const handleUsernameChange = (value: string) => {
    setRobloxUsername(value)
    setRobloxVerified(false)
    setRobloxUser(null)
    setRobloxError('')

    if (verifyTimeout) clearTimeout(verifyTimeout)

    const timeout = setTimeout(() => {
      handleVerifyRoblox(value)
    }, 800)
    setVerifyTimeout(timeout)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        if (!robloxVerified || !robloxUser) {
          setError('Please verify your Roblox username first')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        await signUp(email, password, robloxUsername, robloxUser.userId, robloxUser.avatarUrl)
        setSuccess(true)
      } else {
        await signIn(email, password)
        const profile = await getCurrentProfile()
        if (profile) {
          setCurrentUser(profile)
          saveAccount({
            id: profile.id,
            email: email,
            username: profile.username,
            avatar_url: profile.avatar_url,
            roblox_id: profile.roblox_id,
          })
        }
        navigate('/')
      }
    } catch (err: unknown) {
      let msg = 'Something went wrong. Please try again.'
      if (err instanceof Error && err.message) {
        msg = err.message
      } else if (typeof err === 'string' && err) {
        msg = err
      }
      if (msg.includes('Database error') || msg.includes('database error')) {
        msg = 'A database trigger is blocking signup. Go to Supabase SQL Editor, paste the contents of supabase/fix-signup.sql, and click Run. Then try again.'
      }
      console.error('Auth error:', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError('')
    setSuccess(false)
    setRobloxUser(null)
    setRobloxVerified(false)
    setRobloxUsername('')
    setEmail('')
    setPassword('')
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-green-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent-blue/8 rounded-full blur-[120px]" />
        </div>
        <motion.div
          className="w-full max-w-md relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-2xl bg-bg-secondary border border-border-primary p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck size={32} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Account Created!</h2>
            <p className="text-text-secondary text-sm mb-2">
              Welcome to Yobest, <span className="text-text-primary font-medium">{robloxUsername}</span>!
            </p>
            <p className="text-text-muted text-xs mb-6">
              Check your email <span className="text-text-secondary font-medium">{email}</span> to confirm your account, then sign in.
            </p>
            <button
              onClick={() => { setSuccess(false); setMode('signin'); setEmail(''); setPassword('') }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <ArrowRight size={16} /> Go to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
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
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Join Yobest'}
          </h1>
          <p className="text-text-secondary text-sm">
            {mode === 'signin'
              ? 'Sign in to access the platform'
              : 'Create your account with your Roblox identity'}
          </p>
        </div>

        <div className="rounded-2xl bg-bg-secondary border border-border-primary p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-text-muted font-medium mb-1.5 block">Roblox Username</label>
                <div className="relative">
                  <Gamepad2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={robloxUsername}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="e.g. ByocefS"
                    required
                    className={cn(
                      'w-full pl-9 pr-10 py-2.5 rounded-xl bg-bg-elevated border text-text-primary text-sm placeholder:text-text-dim focus:outline-none transition-all',
                      robloxVerified
                        ? 'border-green-500/50 focus:ring-1 focus:ring-green-500/25'
                        : robloxError
                          ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/25'
                          : 'border-border-primary focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25'
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {verifying && <Loader2 size={16} className="animate-spin text-text-muted" />}
                    {!verifying && robloxVerified && <Check size={16} className="text-green-400" />}
                    {!verifying && robloxError && <X size={16} className="text-red-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {robloxVerified && robloxUser && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="mt-2.5 flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                    >
                      <img
                        src={robloxUser.avatarUrl}
                        alt={robloxUser.username}
                        className="w-11 h-11 rounded-full border-2 border-green-500/30"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(robloxUser.username[0])}&background=10b981&color=fff&bold=true&size=44`
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-green-300">{robloxUser.displayName || robloxUser.username}</div>
                        <div className="text-xs text-green-400/70">@{robloxUser.username} on Roblox</div>
                      </div>
                      <Check size={18} className="text-green-400" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {robloxError && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <X size={12} className="shrink-0" />
                    {robloxError}
                  </div>
                )}

                {!robloxVerified && !robloxError && !verifying && robloxUsername.length >= 3 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                    <Loader2 size={12} className="animate-spin" />
                    Verifying with Roblox...
                  </div>
                )}

                <p className="mt-2 text-[11px] text-text-dim">
                  We verify this username exists on Roblox and use your avatar
                </p>
              </div>
            )}

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
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-border-primary text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-muted font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
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
              {mode === 'signup' && (
                <p className="mt-1.5 text-[11px] text-text-dim flex items-center gap-1">
                  <ShieldCheck size={10} /> This is NOT your Roblox password — it's for Yobest only
                </p>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2"
                >
                  <X size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && !robloxVerified)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-blue/20"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <span className="text-text-muted text-xs">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={resetForm}
              className="text-accent-blue text-xs font-medium hover:underline"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
