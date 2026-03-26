/**
 * ProductTrendChart — line chart showing daily sales quantity for a selected
 * commodity, with a shadcn Select for switching between commodities.
 */

import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ChartEmpty } from '@/components/analytics/chart-empty'
import { useAppStore } from '@/stores/app-store'
import { CHART_PALETTES } from '@/lib/analytics/chart-colors'
import type { DailyRevenue } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommodityOption {
  id: string
  name: string
}

interface ProductTrendChartProps {
  data: DailyRevenue[]
  commodities: CommodityOption[]
  selectedId: string
  onSelectChange: (id: string) => void
}

interface ChartRow {
  day: number
  salesQuantity: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildChartData(data: DailyRevenue[]): ChartRow[] {
  return data.map(d => ({
    day: Number(d.date.split('-')[2]),
    salesQuantity: d.revenue,
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductTrendChart({
  data,
  commodities,
  selectedId,
  onSelectChange,
}: ProductTrendChartProps) {
  const { t } = useTranslation()
  const fontSize = useAppStore().fontSize
  const chartData = buildChartData(data)

  // Palette 1: Moss Forest
  const chartConfig = {
    salesQuantity: {
      label: t('analytics.salesQuantity'),
      color: CHART_PALETTES.mossForest[0],
    },
  } satisfies ChartConfig

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.productTrendTitle')}</CardTitle>
        <CardDescription>{t('analytics.productTrendDesc')}</CardDescription>
        <CardAction>
          <Select value={selectedId} onValueChange={onSelectChange}>
            <SelectTrigger className="w-[200px]" aria-label={t('analytics.selectProduct')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {commodities.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every(d => d.salesQuantity === 0) ? <ChartEmpty /> : (
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <LineChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize }} />
            <YAxis tick={{ fontSize }} allowDecimals={false} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Line
              type="monotone"
              dataKey="salesQuantity"
              stroke="var(--color-salesQuantity)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
