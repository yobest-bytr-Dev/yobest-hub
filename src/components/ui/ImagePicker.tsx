import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image, Loader2, Check, Trash2 } from 'lucide-react'
import { uploadToGoogleDrive, toDirectImageUrl } from '@/lib/drive-upload'
import Modal from './Modal'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'yobest_image_uploads'

export interface StoredImage {
  url: string
  name: string
  date: string
}

function getStoredImages(): StoredImage[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveStoredImage(img: StoredImage) {
  const images = getStoredImages()
  images.unshift(img)
  if (images.length > 50) images.pop()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
}

function removeStoredImage(url: string) {
  const images = getStoredImages().filter((i) => i.url !== url)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
}

interface ImagePickerProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  className?: string
}

export default function ImagePicker({ value, onChange, folder = 'yobest/uploads', label = 'Thumbnail Image', className }: ImagePickerProps) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<StoredImage[]>([])
  const [selected, setSelected] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImages(getStoredImages())
  }, [open])

  useEffect(() => {
    setSelected(value)
  }, [value])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('Image too large. Maximum 10MB.'); setUploading(false); return }
    setUploading(true)
    try {
      const result = await uploadToGoogleDrive(file, folder)
      const img: StoredImage = {
        url: result.directLink,
        name: file.name,
        date: new Date().toISOString(),
      }
      saveStoredImage(img)
      setImages(getStoredImages())
      setSelected(result.directLink)
      onChange(result.directLink)
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'))
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSelect = (url: string) => {
    setSelected(url)
    onChange(url)
    setOpen(false)
  }

  const handleRemove = (url: string) => {
    removeStoredImage(url)
    setImages(getStoredImages())
    if (selected === url) {
      setSelected('')
      onChange('')
    }
  }

  const handleClear = () => {
    setSelected('')
    onChange('')
  }

  return (
    <div className={className}>
      <label className="text-xs text-text-muted font-medium mb-1.5 block">{label}</label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-elevated border border-border-primary text-text-secondary text-sm hover:border-accent-blue/50 hover:text-accent-blue transition-all"
        >
          <Image size={14} />
          {selected ? 'Change Image' : 'Choose Image'}
        </button>
        {selected && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-xl bg-bg-elevated border border-border-primary text-text-muted hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {selected && (
        <div className="mt-2 relative w-24 h-16 rounded-lg overflow-hidden border border-border-primary">
          <img src={toDirectImageUrl(selected)} alt="Selected" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      <Modal open={open} onClose={() => setOpen(false)} title="Choose Image" maxWidth="max-w-lg">
        <div className="space-y-4">
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-border-primary hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all text-text-secondary hover:text-accent-blue"
          >
            {uploading ? (
              <><Loader2 size={20} className="animate-spin" /> Uploading...</>
            ) : (
              <><Upload size={20} /> Upload New Image</>
            )}
          </button>

          {/* Previous Uploads */}
          {images.length > 0 && (
            <div>
              <h4 className="text-xs text-text-muted font-medium mb-2">Previous Uploads</h4>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                {images.map((img) => (
                  <div
                    key={img.url}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer group transition-all',
                      selected === img.url
                        ? 'border-accent-blue ring-1 ring-accent-blue/30'
                        : 'border-border-primary hover:border-border-hover'
                    )}
                    onClick={() => handleSelect(img.url)}
                  >
                    <img
                      src={toDirectImageUrl(img.url)}
                      alt={img.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    {selected === img.url && (
                      <div className="absolute inset-0 bg-accent-blue/20 flex items-center justify-center">
                        <Check size={16} className="text-white drop-shadow" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemove(img.url) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 && !uploading && (
            <p className="text-xs text-text-dim text-center">No previous uploads. Upload your first image above.</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
