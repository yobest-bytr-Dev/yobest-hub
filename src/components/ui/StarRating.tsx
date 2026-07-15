import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  count?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export default function StarRating({ rating, count = 0, size = 14, interactive = false, onChange, className }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = interactive ? star <= (hover || rating) : star <= Math.round(rating)
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(star)}
              onMouseEnter={() => interactive && setHover(star)}
              onMouseLeave={() => interactive && setHover(0)}
              className={cn(
                'transition-colors',
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              )}
            >
              <Star
                size={size}
                className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-text-dim'}
                strokeWidth={1.5}
              />
            </button>
          )
        })}
      </div>
      {count > 0 && (
        <span className="text-xs text-text-muted ml-0.5">({count})</span>
      )}
    </div>
  )
}
