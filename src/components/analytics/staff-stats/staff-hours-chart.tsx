/**
 * StaffHoursChart — horizontal stacked bar chart showing per-employee
 * working hours broken down by attendance type.
 * Uses Recharts BarChart with layout="vertical".
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { EmployeeHours } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffHoursChartProps {
  data: EmployeeHours[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_CHART_HEIGHT = 300
const ROW_HEIGHT = 48

/** Color palette for each attendance type segment. */
const COLORS = {
  regular: 'hsl(221 83% 53%)',
  paidLeave: 'hsl(142 72% 45%)',
  sickLeave: 'hsl(25 95% 53%)',
  personalLeave: 'hsl(48 96% 53%)',
  absent: 'hsl(0 84% 60%)',
} as const

// ─── Bar segments config ──────────────────────────────────────────────────────

const SEGMENTS: Array<{ dataKey: keyof typeof COLORS; name: string }> = [
  { dataKey: 'regular', name: '正班' },
  { dataKey: 'paidLeave', name: '特休' },
  { dataKey: 'sickLeave', name: '病假' },
  { dataKey: 'personalLeave', name: '事假' },
  { dataKey: 'absent', name: '缺席' },
]

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Renders a horizontal stacked bar chart with one row per employee.
 * Each bar is split into 5 colored segments: 正班, 特休, 病假, 事假, 缺席.
 */
export function StaffHoursChart({ data }: StaffHoursChartProps) {
  // Map to recharts-compatible format keyed by employeeName
  const chartData = data.map(row => ({
    name: row.employeeName,
    regular: row.regular,
    paidLeave: row.paidLeave,
    sickLeave: row.sickLeave,
    personalLeave: row.personalLeave,
    absent: row.absent,
  }))

  const chartHeight = Math.max(MIN_CHART_HEIGHT, data.length * ROW_HEIGHT)

  return (
    <section aria-label="員工工時分布">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart layout="vertical" data={chartData}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip />
          <Legend />
          {SEGMENTS.map(({ dataKey, name }) => (
            <Bar
              key={dataKey}
              dataKey={dataKey}
              name={name}
              stackId="hours"
              fill={COLORS[dataKey]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
