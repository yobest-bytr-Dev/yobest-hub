import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/forgot-password', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-accent-blue" />
    </div>
  )
}
