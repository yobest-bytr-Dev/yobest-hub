const tls = require('tls')

const SB_URL = 'https://pohslivolczprxacroje.supabase.co'
const SB_KEY = 'sb_publishable_zg1KBuWhnqVm8GM8q4siIA_M1BC1vyG'
const SMTP_HOST = 'smtp.gmail.com'
const SMTP_PORT = 465
const SMTP_USER = 'yobest.bytr47@gmail.com'
const SMTP_PASS = 'rwnjbedwmqqrysrj'

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function buildEmailHtml(code) {
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

function sendSmtpEmail(to, subject, htmlBody) {
  return new Promise((resolve, reject) => {
    const sock = tls.connect({ host: SMTP_HOST, port: SMTP_PORT, rejectUnauthorized: true })
    let step = 0
    let buffer = ''

    const send = (data) => sock.write(data + '\r\n')

    const next = () => {
      switch (step++) {
        case 0: send('EHLO yobest.app'); break
        case 1: send('AUTH LOGIN'); break
        case 2: send(Buffer.from(SMTP_USER).toString('base64')); break
        case 3: send(Buffer.from(SMTP_PASS).toString('base64')); break
        case 4: send('MAIL FROM:<' + SMTP_USER + '>'); break
        case 5: send('RCPT TO:<' + to + '>'); break
        case 6: send('DATA'); break
        case 7:
          send(
            'From: Yobest <' + SMTP_USER + '>\r\n' +
            'To: <' + to + '>\r\n' +
            'Subject: ' + subject + '\r\n' +
            'MIME-Version: 1.0\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            'Content-Transfer-Encoding: 7bit\r\n' +
            '\r\n' +
            htmlBody + '\r\n' +
            '.'
          )
          break
        case 8:
          send('QUIT')
          sock.destroy()
          resolve()
          break
      }
    }

    sock.on('data', (data) => {
      buffer += data.toString()
      if (buffer.includes('\n')) { buffer = ''; next() }
    })

    sock.on('error', (err) => reject(err))
    sock.on('timeout', () => { sock.destroy(); reject(new Error('SMTP timeout')) })
    sock.setTimeout(15000)

    sock.on('secureConnect', () => next())
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body || {}
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email is required' })

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    await fetch(
      SB_URL + '/rest/v1/password_reset_codes?email=eq.' + encodeURIComponent(normalizedEmail) + '&verified=eq.false',
      { method: 'DELETE', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } }
    )

    const insResp = await fetch(SB_URL + '/rest/v1/password_reset_codes', {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        code,
        verified: false,
        attempts: 0,
        expires_at: expiresAt,
      }),
    })
    if (!insResp.ok) {
      const errText = await insResp.text()
      console.error('insert code failed:', insResp.status, errText)
      throw new Error('Failed to store reset code')
    }

    await sendSmtpEmail(normalizedEmail, 'Your Yobest Password Reset Code', buildEmailHtml(code))

    return res.status(200).json({ ok: true, message: 'Code sent to your email.' })
  } catch (err) {
    console.error('send-reset-code error:', err)
    return res.status(500).json({ error: 'Failed to send code. Please try again.' })
  }
}
