/**
 * ProductTrendChart — line chart showing daily sales quantity for a selected
 * commodity, with a native select for switching between commodities.
 */

import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
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
  salesQuantity: number
}

// ─── Chart config color (static — label resolved inside component) ────────────

const CHART_COLOR = 'hsl(var(--chart-1))'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildChartData(data: DailyRevenue[]): ChartRow[] {
  return data.map(d => ({
    day: Number(d.date.split('-')[2]),
    salesQuantity: d.revenue,
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
  const { t } = useTranslation()
  const chartData = buildChartData(data)

  // Chart config built inside component so labels use translated strings.
  const chartConfig = {
    salesQuantity: {
      label: t('analytics.salesQuantity'),
      color: CHART_COLOR,
    },
  } satisfies ChartConfig

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onSelectChange(e.target.value)
  }

  return (
    <div aria-label={t('analytics.productTrend')} role="region" className="flex flex-col gap-3">
      <select
        value={selectedId}
        onChange={handleChange}
        aria-label={t('analytics.selectProduct')}
        className="rounded-lg border border-border bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {commodities.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }} accessibilityLayer>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="salesQuantity"
            stroke="var(--color-salesQuantity)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
