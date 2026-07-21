import { useState, useRef, useEffect } from 'react'
import { Send, Wand2, X, Loader2, Copy, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseUrl } from '@/config/supabase'

const CHAT_API = `${supabaseUrl}/functions/v1/rodin-api?action=ui-generate`

const suggestedPrompts = [
  'A modern inventory UI with rounded frames',
  'A sleek health bar with gradient fill',
  'A shop GUI with grid layout and buy buttons',
  'A main menu with play, settings, and credits',
  'A quest tracker sidebar with progress bars',
]

interface Message { role: 'user' | 'assistant'; content: string }

export default function UIGenerator() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || isLoading) return
    const userMsg: Message = { role: 'user', content: msg }
    setMessages((p) => [...p, userMsg])
    setInput(''); setIsLoading(true)
    try {
      const resp = await fetch(CHAT_API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await resp.json()
      setMessages((p) => [...p, { role: 'assistant', content: data.content }])
    } catch {
      setMessages((p) => [...p, { role: 'assistant', content: 'Error getting response. Please try again.' }])
    }
    setIsLoading(false)
  }

  const copyCode = (content: string, idx: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const formatMessage = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^lua\n/i, '')
        return (
          <div key={i} className="relative my-2 rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
              <span className="text-[10px] text-white/30 font-mono">Lua</span>
              <button onClick={() => navigator.clipboard.writeText(code)}
                className="text-[10px] text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
                <Copy className="h-2.5 w-2.5" /> Copy
              </button>
            </div>
            <pre className="p-3 text-xs text-white/80 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">{code}</pre>
          </div>
        )
      }
      return <p key={i} className="whitespace-pre-wrap break-words leading-relaxed">{part}</p>
    })
  }

  return (
    <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden flex flex-col" style={{ height: 600 }}>
      <div className="px-5 py-4 border-b border-border-primary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-accent-purple/25">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Roblox UI Generator</h3>
            <p className="text-xs text-text-muted">AI-powered UI code generator</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); setInput('') }}
            className="text-xs text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-primary hover:border-border-hover transition-all">
            New Chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 border border-accent-purple/10 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-accent-purple/60" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Create Roblox UIs with AI</h3>
            <p className="text-sm text-text-muted mb-6 max-w-md leading-relaxed">
              Describe the UI you want and AI will generate ready-to-use Roblox Studio Lua code.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {suggestedPrompts.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)}
                  className="px-4 py-2 rounded-xl text-xs text-text-secondary bg-bg-elevated border border-border-primary hover:border-accent-purple/30 hover:text-accent-purple transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[85%] px-4 py-3 rounded-2xl text-sm',
              msg.role === 'user' ? 'bg-accent-blue text-white rounded-br-md' : 'bg-bg-elevated text-text-primary rounded-bl-md border border-border-primary')}>
              {msg.role === 'assistant' ? formatMessage(msg.content) : <p className="whitespace-pre-wrap">{msg.content}</p>}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-bg-elevated border border-border-primary rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 pb-4 pt-2 border-t border-border-primary">
        <div className="flex items-end gap-2 bg-bg-elevated rounded-xl px-4 py-3 border border-border-primary focus-within:border-accent-purple/50 transition-colors">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Describe your UI (e.g., 'A inventory GUI with 6 slots and a close button')"
            rows={1} className="flex-1 bg-transparent text-text-primary text-sm resize-none focus:outline-none placeholder:text-text-dim max-h-24" />
          <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
            className={cn('h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
              input.trim() && !isLoading ? 'bg-accent-purple text-white hover:bg-purple-600' : 'bg-bg-tertiary text-text-dim')}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
