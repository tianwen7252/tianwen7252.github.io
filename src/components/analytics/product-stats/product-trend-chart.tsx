/**
 * ProductTrendChart — line chart showing daily sales quantity for a selected
 * commodity, with a native select for switching between commodities.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommodityOption {
  id: string
  name: string
}

interface ProductTrendChartProps {
  /** Daily sales quantity for the selected commodity (revenue field = quantity). */
  data: DailyRevenue[]
  /** Commodity options available in the selector. */
  commodities: CommodityOption[]
  /** Currently selected commodity id. */
  selectedId: string
  /** Called with the new commodity id when the selection changes. */
  onSelectChange: (id: string) => void
}

/** Row used by recharts — day number and quantity value. */
interface ChartRow {
  day: number
  銷量: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_HEIGHT = 250
const COLOR_LINE = 'hsl(221 83% 53%)'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildChartData(data: DailyRevenue[]): ChartRow[] {
  return data.map(d => ({
    day: Number(d.date.split('-')[2]),
    銷量: d.revenue,
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a commodity selector and a line chart of daily sales quantity.
 */
export function ProductTrendChart({
  data,
  commodities,
  selectedId,
  onSelectChange,
}: ProductTrendChartProps) {
  const chartData = buildChartData(data)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onSelectChange(e.target.value)
  }

  return (
    <div aria-label="商品銷售趨勢" role="region" className="flex flex-col gap-3">
      <select
        value={selectedId}
        onChange={handleChange}
        aria-label="選擇商品"
        className="rounded-lg border border-border bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {commodities.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip formatter={(value) => [value, '銷量']} labelFormatter={(label) => `第 ${label} 日`} />
          <Line
            type="monotone"
            dataKey="銷量"
            stroke={COLOR_LINE}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
