import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const SB_URL = 'https://pohslivolczprxacroje.supabase.co'
const SB_KEY = 'sb_publishable_zg1KBuWhnqVm8GM8q4siIA_M1BC1vyG'
const supabase = createClient(SB_URL, SB_KEY)

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'yobest.bytr47@gmail.com',
    pass: 'rwnjbedwmqqrysrj',
  },
})

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function buildEmailHtml(code: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#07070d;font-family:Inter,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:#0d0d14;border:1px solid #1e1e2e;border-radius:16px;padding:40px 32px;text-align:center;">
  <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#3b82f6,#a855f7);display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;">
    <span style="font-size:28px;">&#128274;</span>
  </div>
  <h1 style="color:#f1f5f9;font-size:22px;margin:0 0 8px;">Password Reset Code</h1>
  <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Enter this 6-digit code to reset your password</p>
  <div style="background:#1a1a2e;border:2px solid #3b82f6;border-radius:12px;padding:20px;margin:0 0 24px;">
    <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#f1f5f9;">${code}</span>
  </div>
  <p style="color:#64748b;font-size:12px;margin:0 0 8px;">This code expires in 15 minutes.</p>
  <p style="color:#64748b;font-size:12px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
</div>
</body>
</html>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body || {}
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email is required' })

  const normalizedEmail = email.trim().toLowerCase()

  try {
    await supabase.from('password_reset_codes').delete().eq('email', normalizedEmail).eq('verified', false)

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase.from('password_reset_codes').insert({
      email: normalizedEmail,
      code,
      verified: false,
      attempts: 0,
      expires_at: expiresAt,
    })
    if (insertError) throw insertError

    await transporter.sendMail({
      from: '"Yobest" <yobest.bytr47@gmail.com>',
      to: normalizedEmail,
      subject: 'Your Yobest Password Reset Code',
      html: buildEmailHtml(code),
    })

    return res.status(200).json({ ok: true, message: 'Code sent to your email.' })
  } catch (err: any) {
    console.error('send-reset-code error:', err)
    return res.status(500).json({ error: 'Failed to send code. Please try again.' })
  }
}
