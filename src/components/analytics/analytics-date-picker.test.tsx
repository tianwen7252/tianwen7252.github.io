/**
 * Tests for AnalyticsDatePicker component.
 * Verifies quick preset buttons call onChange with correct date ranges,
 * month navigation works, and mode prop controls visible UI.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { AnalyticsDatePicker } from './analytics-date-picker'

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
})
