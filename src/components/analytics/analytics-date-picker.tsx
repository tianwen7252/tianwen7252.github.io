/**
 * AnalyticsDatePicker — date range selector for the analytics page.
 * Supports quick presets (today, this week, this month, last month),
 * a custom calendar range picker, and prev/next month navigation.
 * In month mode, only full-month selection is available (no calendar day picker).
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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

// ─── Preset key configuration ────────────────────────────────────────────────

const PRESET_KEYS = [
  { key: 'analytics.today', getRange: today },
  { key: 'analytics.thisWeek', getRange: thisWeek },
  { key: 'analytics.thisMonth', getRange: thisMonth },
  { key: 'analytics.lastMonth', getRange: lastMonth },
] as const

// ─── Active preset detection ──────────────────────────────────────────────────

/**
 * Returns the i18n key of the preset whose range matches the given start/end dates,
 * or null if no preset matches.
 */
export function getActivePreset(startDate: Date, endDate: Date): string | null {
  for (const preset of PRESET_KEYS) {
    const { start, end } = preset.getRange()
    if (
      dayjs(start).isSame(startDate, 'day') &&
      dayjs(end).isSame(endDate, 'day')
    ) {
      return preset.key
    }
  }
  return null
}

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
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [pendingRange, setPendingRange] = useState<DayPickerRange | undefined>(undefined)
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(() => startDate.getFullYear())

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

  function handleMonthSelect(year: number, month: number) {
    const start = dayjs().year(year).month(month - 1).startOf('month').toDate()
    const end = dayjs().year(year).month(month - 1).endOf('month').toDate()
    onChange(start, end)
    setIsMonthPickerOpen(false)
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

  const activePresetKey = getActivePreset(startDate, endDate)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick preset buttons */}
      {PRESET_KEYS.map(preset => {
        const isActive = activePresetKey === preset.key
        return (
          <RippleButton
            key={preset.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => handlePreset(preset.getRange)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-base',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {t(preset.key)}
          </RippleButton>
        )
      })}

      {/* Month navigation arrows */}
      <div className="flex items-center gap-1">
        <RippleButton
          type="button"
          aria-label={t('analytics.prevMonth')}
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
          /* Month mode: clickable month picker */
          <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
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
            <PopoverContent className="w-auto p-4" align="start">
              {/* Year navigation */}
              <div className="mb-3 flex items-center justify-between">
                <RippleButton
                  type="button"
                  aria-label={t('analytics.prevYear')}
                  onClick={() => setPickerYear(y => y - 1)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </RippleButton>
                <span className="text-base font-medium">{pickerYear}</span>
                <RippleButton
                  type="button"
                  aria-label={t('analytics.nextYear')}
                  onClick={() => setPickerYear(y => y + 1)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </RippleButton>
              </div>
              {/* Month grid: 4×3 */}
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                  const isSelected =
                    pickerYear === startDate.getFullYear() &&
                    month === startDate.getMonth() + 1
                  return (
                    <RippleButton
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(pickerYear, month)}
                      className={cn(
                        'rounded-md px-2 py-1.5 text-base',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      {t('analytics.monthSuffix', { month })}
                    </RippleButton>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <RippleButton
          type="button"
          aria-label={t('analytics.nextMonth')}
          onClick={handleNextMonth}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </RippleButton>
      </div>
    </div>
  )
}
