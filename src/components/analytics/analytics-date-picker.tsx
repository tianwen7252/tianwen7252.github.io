/**
 * AnalyticsDatePicker — date range selector for the analytics page.
 * Supports quick presets (today, this week, this month, last month),
 * a custom calendar range picker, and prev/next month navigation.
 * In month mode, only full-month selection is available (no calendar day picker).
 */

import { useState } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { RippleButton } from '@/components/ui/ripple-button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { DateRange as DayPickerRange } from 'react-day-picker'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnalyticsDatePickerProps {
  readonly startDate: Date
  readonly endDate: Date
  readonly onChange: (start: Date, end: Date) => void
  readonly mode?: 'range' | 'month'
}

// ─── Quick preset helpers ─────────────────────────────────────────────────────

function today(): { start: Date; end: Date } {
  return { start: dayjs().startOf('day').toDate(), end: dayjs().endOf('day').toDate() }
}

function thisWeek(): { start: Date; end: Date } {
  return { start: dayjs().startOf('week').toDate(), end: dayjs().endOf('week').toDate() }
}

function thisMonth(): { start: Date; end: Date } {
  return { start: dayjs().startOf('month').toDate(), end: dayjs().endOf('month').toDate() }
}

function lastMonth(): { start: Date; end: Date } {
  const last = dayjs().subtract(1, 'month')
  return { start: last.startOf('month').toDate(), end: last.endOf('month').toDate() }
}

// ─── Preset button configuration ─────────────────────────────────────────────

const PRESETS = [
  { label: '今日', getRange: today },
  { label: '本週', getRange: thisWeek },
  { label: '本月', getRange: thisMonth },
  { label: '上月', getRange: lastMonth },
] as const

// ─── Date format helper ───────────────────────────────────────────────────────

function formatDisplay(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

function formatMonthDisplay(date: Date): string {
  return dayjs(date).format('YYYY-MM')
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Date picker with quick preset buttons, a calendar popover for custom range,
 * and prev/next month navigation arrows.
 * In month mode, prev/next arrows move by month and no custom range picker is shown.
 */
export function AnalyticsDatePicker({
  startDate,
  endDate,
  onChange,
  mode = 'range',
}: AnalyticsDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingRange, setPendingRange] = useState<DayPickerRange | undefined>(undefined)

  function handlePreset(getRange: () => { start: Date; end: Date }) {
    const { start, end } = getRange()
    onChange(start, end)
  }

  function handlePrevMonth() {
    const newStart = dayjs(startDate).subtract(1, 'month').startOf('month').toDate()
    const newEnd = dayjs(startDate).subtract(1, 'month').endOf('month').toDate()
    onChange(newStart, newEnd)
  }

  function handleNextMonth() {
    const newStart = dayjs(startDate).add(1, 'month').startOf('month').toDate()
    const newEnd = dayjs(startDate).add(1, 'month').endOf('month').toDate()
    onChange(newStart, newEnd)
  }

  function handleRangeSelect(range: DayPickerRange | undefined) {
    setPendingRange(range)
    if (range?.from && range?.to) {
      onChange(
        dayjs(range.from).startOf('day').toDate(),
        dayjs(range.to).endOf('day').toDate(),
      )
      setIsOpen(false)
      setPendingRange(undefined)
    }
  }

  const displayText =
    mode === 'month'
      ? formatMonthDisplay(startDate)
      : `${formatDisplay(startDate)} — ${formatDisplay(endDate)}`

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick preset buttons */}
      {PRESETS.map(preset => (
        <RippleButton
          key={preset.label}
          type="button"
          onClick={() => handlePreset(preset.getRange)}
          className="rounded-md bg-muted px-3 py-1.5 text-base text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {preset.label}
        </RippleButton>
      ))}

      {/* Month navigation arrows */}
      <div className="flex items-center gap-1">
        <RippleButton
          type="button"
          aria-label="上個月"
          onClick={handlePrevMonth}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </RippleButton>

        {/* Custom range picker — only shown in range mode */}
        {mode === 'range' ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <RippleButton
                type="button"
                className={cn(
                  'flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-base',
                  'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
                <span>{displayText}</span>
              </RippleButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={pendingRange ?? { from: startDate, to: endDate }}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        ) : (
          /* Month mode: display-only label */
          <span className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-base">
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
            {displayText}
          </span>
        )}

        <RippleButton
          type="button"
          aria-label="下個月"
          onClick={handleNextMonth}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </RippleButton>
      </div>
    </div>
  )
}
