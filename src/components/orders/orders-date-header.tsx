/**
 * Date header for the Orders page.
 * Shows formatted date with relative label and a calendar popover for date selection.
 */

import { useState } from 'react'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { CalendarDays } from 'lucide-react'
import { formatOrderDate } from '@/lib/format-order-date'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrdersDateHeaderProps {
  readonly selectedDate: Dayjs
  readonly onDateChange: (date: Dayjs) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Displays the currently selected date with a relative label (today/yesterday/weekday)
 * and provides a calendar popover for date navigation.
 */
export function OrdersDateHeader({
  selectedDate,
  onDateChange,
}: OrdersDateHeaderProps) {
  const [open, setOpen] = useState(false)
  const { formatted, label } = formatOrderDate(selectedDate)

  /** Handle calendar date selection */
  function handleSelect(date: Date | undefined) {
    if (!date) return
    onDateChange(dayjs(date))
    setOpen(false)
  }

  return (
    <div
      data-testid="orders-date-header"
      className="flex items-center justify-between"
    >
      {/* Left: formatted date with label */}
      <span className="text-lg text-primary">
        {formatted} ({label})
      </span>

      {/* Right: calendar icon popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Select date">
            <CalendarDays className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate.toDate()}
            onSelect={handleSelect}
            startMonth={new Date(2024, 0)}
            endMonth={new Date(2030, 11)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
