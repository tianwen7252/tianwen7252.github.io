/**
 * StaffHoursChart — horizontal stacked bar chart showing per-employee
 * working hours broken down by attendance type.
 * Uses Recharts BarChart with layout="vertical".
 */

import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { EmployeeHours } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffHoursChartProps {
  data: EmployeeHours[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_CHART_HEIGHT = 300
const ROW_HEIGHT = 48

// ─── Static segment keys ──────────────────────────────────────────────────────

type SegmentKey = 'regular' | 'paidLeave' | 'sickLeave' | 'personalLeave' | 'absent'

const SEGMENT_KEYS: SegmentKey[] = ['regular', 'paidLeave', 'sickLeave', 'personalLeave', 'absent']

const SEGMENT_LABEL_KEYS: Record<SegmentKey, string> = {
  regular: 'analytics.regularLabel',
  paidLeave: 'analytics.paidLeave',
  sickLeave: 'analytics.sickLeave',
  personalLeave: 'analytics.personalLeave',
  absent: 'analytics.absent',
}

const SEGMENT_COLORS: Record<SegmentKey, string> = {
  regular: 'hsl(var(--chart-1))',
  paidLeave: 'hsl(var(--chart-2))',
  sickLeave: 'hsl(var(--chart-3))',
  personalLeave: 'hsl(var(--chart-4))',
  absent: 'hsl(var(--chart-5))',
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Renders a horizontal stacked bar chart with one row per employee.
 * Each bar is split into 5 colored segments: regular, paidLeave, sickLeave, personalLeave, absent.
 */
export function StaffHoursChart({ data }: StaffHoursChartProps) {
  const { t } = useTranslation()

  // Chart config built inside component so labels use translated strings.
  const chartConfig = Object.fromEntries(
    SEGMENT_KEYS.map(key => [
      key,
      {
        label: t(SEGMENT_LABEL_KEYS[key]),
        color: SEGMENT_COLORS[key],
      },
    ]),
  ) as ChartConfig

  // Map to recharts-compatible format keyed by employeeName
  const chartData = data.map(row => ({
    name: row.employeeName,
    regular: row.regular,
    paidLeave: row.paidLeave,
    sickLeave: row.sickLeave,
    personalLeave: row.personalLeave,
    absent: row.absent,
  }))

  const minHeight = Math.max(MIN_CHART_HEIGHT, data.length * ROW_HEIGHT)

  return (
    <section aria-label={t('analytics.staffHoursDistribution')}>
      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ minHeight }}
      >
        <BarChart layout="vertical" data={chartData} accessibilityLayer>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={80} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {SEGMENT_KEYS.map(key => (
            <Bar
              key={key}
              dataKey={key}
              name={t(SEGMENT_LABEL_KEYS[key])}
              stackId="hours"
              fill={`var(--color-${key})`}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </section>
  )
}
