/**
 * DeliveryOrdersChart — pie chart showing product distribution for delivery orders.
 * Each slice represents a product, colored via sunsetHarvest palette.
 */

import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { ChartEmpty } from '@/components/analytics/chart-empty'
import { CHART_PALETTES, getColor } from '@/lib/analytics/chart-colors'
import type { DeliveryProductRow } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryOrdersChartProps {
  /** Array of delivery product rows with quantity and revenue. */
  data: DeliveryProductRow[]
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = CHART_PALETTES.sunsetHarvest

// ─── Component ────────────────────────────────────────────────────────────────

export function DeliveryOrdersChart({ data }: DeliveryOrdersChartProps) {
  const { t } = useTranslation()

  // Build chartConfig immutably using reduce (not forEach mutation)
  const chartConfig = data.reduce<ChartConfig>((acc, item, i) => ({
    ...acc,
    [item.commodityName]: {
      label: item.commodityName,
      color: getColor(PALETTE, i),
    },
  }), {})

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.deliveryOrdersTitle')}</CardTitle>
        <CardDescription>{t('analytics.deliveryOrdersDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? <ChartEmpty /> : (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Pie
              data={data}
              dataKey="quantity"
              nameKey="commodityName"
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              {data.map((item, i) => (
                <Cell key={item.commodityName} fill={getColor(PALETTE, i)} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
