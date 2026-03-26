/**
 * DailyHeadcountChart — line chart showing daily attendance headcount.
 * X axis: date, Y axis: number of employees who attended.
 * Uses Recharts LineChart with monotone interpolation.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import type { DailyHeadcount } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyHeadcountChartProps {
  data: DailyHeadcount[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_HEIGHT = 280
const LINE_COLOR = 'hsl(221 83% 53%)'

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Renders a line chart with one point per day showing attendance headcount.
 * The caller is responsible for zero-filling missing dates before passing data.
 */
export function DailyHeadcountChart({ data }: DailyHeadcountChartProps) {
  return (
    <section aria-label="每日到班人數">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            name="到班人數"
            stroke={LINE_COLOR}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}
