import { Clock } from 'lucide-react'
import { ClockIn } from '@/components/clock-in'

export function ClockInPage() {
  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock size={20} />
          <span>員工打卡</span>
        </div>
      </div>

      {/* ClockIn component */}
      <ClockIn />
    </div>
  )
}
