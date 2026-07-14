import { supabase } from '@/config/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export interface UploadResult {
  fileId: string
  fileUrl: string
  directLink: string
  fileName: string
}

export async function uploadToGoogleDrive(file: File, folder?: string): Promise<UploadResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('file', file)
  if (folder) formData.append('folder', folder)

  const res = await fetch(`${SUPABASE_URL}/functions/v1/drive-upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  })

  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Upload failed')

  return {
    fileId: body.fileId,
    fileUrl: body.fileUrl,
    directLink: body.directLink,
    fileName: body.fileName,
  }
}

export function toDirectImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (fileIdMatch) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=w800`
    }
    const idParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (idParam) {
      return `https://lh3.googleusercontent.com/d/${idParam[1]}=w800`
    }
    return url
  }
  return url
}

export function extractGamepassId(urlOrId: string): string {
  const match = urlOrId.match(/game-pass[\/?](\d+)/)
  if (match) return match[1]
  const numOnly = urlOrId.trim().replace(/\D/g, '')
  return numOnly || urlOrId.trim()
}
