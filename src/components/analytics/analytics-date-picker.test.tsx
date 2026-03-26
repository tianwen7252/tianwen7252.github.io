/**
 * Tests for AnalyticsDatePicker component.
 * Verifies quick preset buttons call onChange with correct date ranges,
 * month navigation works, mode prop controls visible UI,
 * and active preset detection with correct aria-pressed state.
 * After i18n: preset button labels and aria-labels use t() returning zh-TW translations.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { AnalyticsDatePicker, getActivePreset } from './analytics-date-picker'

// ─── Fixed reference dates ────────────────────────────────────────────────────

const START_DATE = new Date('2026-03-01T00:00:00.000')
const END_DATE = new Date('2026-03-31T23:59:59.999')

// ─── Default props ────────────────────────────────────────────────────────────

function makeProps(overrides: Partial<{
  startDate: Date
  endDate: Date
  onChange: (start: Date, end: Date) => void
  mode: 'range' | 'month'
}> = {}) {
  return {
    startDate: START_DATE,
    endDate: END_DATE,
    onChange: vi.fn(),
    ...overrides,
  }
}

describe('AnalyticsDatePicker', () => {
  // ── Preset: 今日 ────────────────────────────────────────────────────────────

  it('calls onChange with today start (00:00) and end (23:59) when 今日 is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<AnalyticsDatePicker {...makeProps({ onChange })} />)

    await user.click(screen.getByRole('button', { name: '今日' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [start, end] = onChange.mock.calls[0] as [Date, Date]
    const today = dayjs().format('YYYY-MM-DD')
    expect(dayjs(start).format('YYYY-MM-DD HH:mm:ss')).toBe(`${today} 00:00:00`)
    expect(dayjs(end).format('YYYY-MM-DD HH:mm:ss')).toBe(`${today} 23:59:59`)
  })

  // ── Preset: 本週 ────────────────────────────────────────────────────────────

  it('calls onChange when 本週 is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<AnalyticsDatePicker {...makeProps({ onChange })} />)

    await user.click(screen.getByRole('button', { name: '本週' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [start] = onChange.mock.calls[0] as [Date, Date]
    // start should be the beginning of this week
    expect(dayjs(start).isSame(dayjs().startOf('week'), 'day')).toBe(true)
  })

  // ── Preset: 本月 ────────────────────────────────────────────────────────────

  it('calls onChange with current month start/end when 本月 is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<AnalyticsDatePicker {...makeProps({ onChange })} />)

    await user.click(screen.getByRole('button', { name: '本月' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [start, end] = onChange.mock.calls[0] as [Date, Date]
    const thisMonth = dayjs().format('YYYY-MM')
    expect(dayjs(start).format('YYYY-MM-DD')).toBe(dayjs().startOf('month').format('YYYY-MM-DD'))
    expect(dayjs(end).format('YYYY-MM')).toBe(thisMonth)
  })

  // ── Preset: 上月 ────────────────────────────────────────────────────────────

  it('calls onChange with last month start/end when 上月 is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<AnalyticsDatePicker {...makeProps({ onChange })} />)

    await user.click(screen.getByRole('button', { name: '上月' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [start, end] = onChange.mock.calls[0] as [Date, Date]
    const lastMonth = dayjs().subtract(1, 'month')
    expect(dayjs(start).format('YYYY-MM-DD')).toBe(lastMonth.startOf('month').format('YYYY-MM-DD'))
    expect(dayjs(end).format('YYYY-MM-DD')).toBe(lastMonth.endOf('month').format('YYYY-MM-DD'))
  })

  // ── month mode: 本月 and 上月 are visible ───────────────────────────────────

  it('renders 本月 and 上月 preset buttons in month mode', () => {
    render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)
    expect(screen.getByRole('button', { name: '本月' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '上月' })).toBeTruthy()
  })

  it('renders all four preset buttons in range mode', () => {
    render(<AnalyticsDatePicker {...makeProps({ mode: 'range' })} />)
    expect(screen.getByRole('button', { name: '今日' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '本週' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '本月' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '上月' })).toBeTruthy()
  })

  // ── Prev month navigation ───────────────────────────────────────────────────

  it('calls onChange with February 2026 when 上個月 is clicked (startDate is March 2026)', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<AnalyticsDatePicker {...makeProps({ onChange })} />)

    await user.click(screen.getByRole('button', { name: '上個月' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [start, end] = onChange.mock.calls[0] as [Date, Date]
    expect(dayjs(start).format('YYYY-MM-DD')).toBe('2026-02-01')
    expect(dayjs(end).format('YYYY-MM-DD')).toBe('2026-02-28')
  })

  // ── Next month navigation ───────────────────────────────────────────────────

  it('calls onChange with April 2026 when 下個月 is clicked (startDate is March 2026)', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<AnalyticsDatePicker {...makeProps({ onChange })} />)

    await user.click(screen.getByRole('button', { name: '下個月' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [start, end] = onChange.mock.calls[0] as [Date, Date]
    expect(dayjs(start).format('YYYY-MM-DD')).toBe('2026-04-01')
    expect(dayjs(end).format('YYYY-MM-DD')).toBe('2026-04-30')
  })

  // ── getActivePreset utility ─────────────────────────────────────────────────

  describe('getActivePreset', () => {
    it('returns "analytics.today" key when start/end match today boundaries', () => {
      const start = dayjs().startOf('day').toDate()
      const end = dayjs().endOf('day').toDate()
      expect(getActivePreset(start, end)).toBe('analytics.today')
    })

    it('returns "analytics.thisWeek" key when start/end match this week boundaries', () => {
      const start = dayjs().startOf('week').toDate()
      const end = dayjs().endOf('week').toDate()
      expect(getActivePreset(start, end)).toBe('analytics.thisWeek')
    })

    it('returns "analytics.thisMonth" key when start/end match this month boundaries', () => {
      const start = dayjs().startOf('month').toDate()
      const end = dayjs().endOf('month').toDate()
      expect(getActivePreset(start, end)).toBe('analytics.thisMonth')
    })

    it('returns "analytics.lastMonth" key when start/end match last month boundaries', () => {
      const last = dayjs().subtract(1, 'month')
      const start = last.startOf('month').toDate()
      const end = last.endOf('month').toDate()
      expect(getActivePreset(start, end)).toBe('analytics.lastMonth')
    })

    it('returns null when dates do not match any preset', () => {
      const twoDay = new Date('2020-01-05T00:00:00.000')
      const twoDayEnd = new Date('2020-01-06T23:59:59.999')
      expect(getActivePreset(twoDay, twoDayEnd)).toBeNull()
    })
  })

  // ── Active preset button aria-pressed state ─────────────────────────────────

  it('marks the matching preset button with aria-pressed="true"', () => {
    // Render with today's range so 今日 should be active
    const start = dayjs().startOf('day').toDate()
    const end = dayjs().endOf('day').toDate()
    render(<AnalyticsDatePicker {...makeProps({ startDate: start, endDate: end })} />)

    const todayBtn = screen.getByRole('button', { name: '今日' })
    expect(todayBtn.getAttribute('aria-pressed')).toBe('true')
  })

  it('marks non-matching preset buttons with aria-pressed="false"', () => {
    // Render with today's range so only 今日 is active
    const start = dayjs().startOf('day').toDate()
    const end = dayjs().endOf('day').toDate()
    render(<AnalyticsDatePicker {...makeProps({ startDate: start, endDate: end })} />)

    const thisWeekBtn = screen.getByRole('button', { name: '本週' })
    const thisMonthBtn = screen.getByRole('button', { name: '本月' })
    const lastMonthBtn = screen.getByRole('button', { name: '上月' })
    expect(thisWeekBtn.getAttribute('aria-pressed')).toBe('false')
    expect(thisMonthBtn.getAttribute('aria-pressed')).toBe('false')
    expect(lastMonthBtn.getAttribute('aria-pressed')).toBe('false')
  })

  it('applies active styling class to the active preset button', () => {
    const start = dayjs().startOf('day').toDate()
    const end = dayjs().endOf('day').toDate()
    render(<AnalyticsDatePicker {...makeProps({ startDate: start, endDate: end })} />)

    const todayBtn = screen.getByRole('button', { name: '今日' })
    // Active button should carry bg-primary class
    expect(todayBtn.className).toContain('bg-primary')
  })

  it('does not apply active styling to inactive preset buttons', () => {
    const start = dayjs().startOf('day').toDate()
    const end = dayjs().endOf('day').toDate()
    render(<AnalyticsDatePicker {...makeProps({ startDate: start, endDate: end })} />)

    const thisWeekBtn = screen.getByRole('button', { name: '本週' })
    expect(thisWeekBtn.className).not.toContain('bg-primary')
  })

  it('shows no active preset when date range does not match any preset', () => {
    // Use a fixed past range that will never match a "live" preset
    const start = new Date('2020-01-05T00:00:00.000')
    const end = new Date('2020-01-06T23:59:59.999')
    render(<AnalyticsDatePicker {...makeProps({ startDate: start, endDate: end })} />)

    for (const name of ['今日', '本週', '本月', '上月']) {
      const btn = screen.getByRole('button', { name })
      expect(btn.getAttribute('aria-pressed')).toBe('false')
      expect(btn.className).not.toContain('bg-primary')
    }
  })

  // ── Month mode: month picker popover ────────────────────────────────────────

  describe('month mode month picker', () => {
    it('renders a clickable button (not a static span) in month mode', () => {
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)
      // The month display should be a button, not a plain span
      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      expect(monthBtn).toBeTruthy()
    })

    it('opens month picker popover when month display button is clicked', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      // Popover should now be visible with a month grid
      // After i18n: month buttons show t('analytics.monthSuffix', { month }) = "1月" in zh-TW
      expect(screen.getByText('1月')).toBeTruthy()
      expect(screen.getByText('12月')).toBeTruthy()
    })

    it('shows all 12 months in the popover grid', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      for (let m = 1; m <= 12; m++) {
        expect(screen.getByText(`${m}月`)).toBeTruthy()
      }
    })

    it('shows the current year in the picker header after opening', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      // startDate is March 2026, so picker year should start at 2026
      expect(screen.getByText('2026')).toBeTruthy()
    })

    it('calls onChange with correct start/end when a month is selected', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month', onChange })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      // Click on month 5 (May) — rendered as "5月" in zh-TW
      await user.click(screen.getByText('5月'))

      expect(onChange).toHaveBeenCalledTimes(1)
      const [start, end] = onChange.mock.calls[0] as [Date, Date]
      expect(dayjs(start).format('YYYY-MM-DD')).toBe('2026-05-01')
      expect(dayjs(end).format('YYYY-MM-DD')).toBe('2026-05-31')
    })

    it('closes the popover after a month is selected', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      // Verify popover is open
      expect(screen.getByText('5月')).toBeTruthy()

      await user.click(screen.getByText('5月'))

      // After selection, month grid should be gone
      expect(screen.queryByText('1月')).toBeNull()
    })

    it('navigates to the previous year when left arrow is clicked', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      // After i18n: aria-label uses t('analytics.prevYear') = "上一年"
      const prevYearBtn = screen.getByRole('button', { name: '上一年' })
      await user.click(prevYearBtn)

      expect(screen.getByText('2025')).toBeTruthy()
    })

    it('navigates to the next year when right arrow is clicked', async () => {
      const user = userEvent.setup()
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      // After i18n: aria-label uses t('analytics.nextYear') = "下一年"
      const nextYearBtn = screen.getByRole('button', { name: '下一年' })
      await user.click(nextYearBtn)

      expect(screen.getByText('2027')).toBeTruthy()
    })

    it('highlights the currently selected month in the grid', async () => {
      const user = userEvent.setup()
      // startDate is March 2026, so month 3 should be highlighted
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month' })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      // The button for 3月 should carry bg-primary styling
      const marchBtn = screen.getByText('3月').closest('button')
      expect(marchBtn).toBeTruthy()
      expect(marchBtn!.className).toContain('bg-primary')
    })

    it('calls onChange with start of February 2025 when navigating to 2025 and selecting 2月', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<AnalyticsDatePicker {...makeProps({ mode: 'month', onChange })} />)

      const monthBtn = screen.getByRole('button', { name: /2026-03/ })
      await user.click(monthBtn)

      const prevYearBtn = screen.getByRole('button', { name: '上一年' })
      await user.click(prevYearBtn)

      await user.click(screen.getByText('2月'))

      expect(onChange).toHaveBeenCalledTimes(1)
      const [start, end] = onChange.mock.calls[0] as [Date, Date]
      expect(dayjs(start).format('YYYY-MM-DD')).toBe('2025-02-01')
      expect(dayjs(end).format('YYYY-MM-DD')).toBe('2025-02-28')
    })
  })
})
