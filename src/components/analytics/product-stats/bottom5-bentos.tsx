/**
 * Bottom10Bentos — horizontal bar chart of the 10 lowest-selling bento items.
 * Supports 3 view modes: bar (default), pie, and table.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell, PieChart, Pie } from 'recharts'
import { BarChart3, PieChart as PieChartIcon, Table as TableIcon } from 'lucide-react'
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
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { ChartEmpty } from '@/components/analytics/chart-empty'
import { RippleButton } from '@/components/ui/ripple-button'
import { cn } from '@/lib/cn'
import { useAppStore } from '@/stores/app-store'
import { CHART_PALETTES, getColor } from '@/lib/analytics/chart-colors'
import type { ProductRanking } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'bar' | 'pie' | 'table'

interface Bottom10BentosProps {
  items: ProductRanking[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_CHART_HEIGHT = 300
const ROW_HEIGHT = 40

// Palette 3: Sunset Harvest
const PALETTE = CHART_PALETTES.sunsetHarvest

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ChartRow {
  name: string
  value: number
}

function buildChartData(items: ProductRanking[]): ChartRow[] {
  return items.map(item => ({
    name: item.name,
    value: item.quantity,
  }))
}

/** Format number as currency string. */
function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Bottom10Bentos({ items }: Bottom10BentosProps) {
  const { t } = useTranslation()
  const fontSize = useAppStore().fontSize
  const [viewMode, setViewMode] = useState<ViewMode>('bar')

  const chartConfig = {
    value: {
      label: t('analytics.quantity'),
      color: 'var(--chart-4)',
    },
  } satisfies ChartConfig

  const chartData = buildChartData(items)
  const minHeight = Math.max(MIN_CHART_HEIGHT, items.length * ROW_HEIGHT)
  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  const viewButtons: { mode: ViewMode; label: string; icon: typeof BarChart3 }[] = [
    { mode: 'bar', label: t('analytics.viewBar'), icon: BarChart3 },
    { mode: 'pie', label: t('analytics.viewPie'), icon: PieChartIcon },
    { mode: 'table', label: t('analytics.viewTable'), icon: TableIcon },
  ]

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.bottom10Title')}</CardTitle>
        <CardDescription>{t('analytics.bottom10Desc')}</CardDescription>
        <CardAction>
          <div className="flex gap-2">
            {viewButtons.map(({ mode, label, icon: Icon }) => (
              <RippleButton
                key={mode}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-4 py-2 text-base transition-colors',
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
                onClick={() => setViewMode(mode)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </RippleButton>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <ChartEmpty />
        ) : viewMode === 'bar' ? (
          <BarView chartData={chartData} chartConfig={chartConfig} minHeight={minHeight} fontSize={fontSize} maxValue={maxValue} t={t} />
        ) : viewMode === 'pie' ? (
          <PieView chartData={chartData} />
        ) : (
          <TableView items={items} />
        )}
      </CardContent>
    </Card>
  )
}

// ─── Bar sub-component ──────────────────────────────────────────────────────

interface BarViewProps {
  chartData: ChartRow[]
  chartConfig: ChartConfig
  minHeight: number
  fontSize: number
  maxValue: number
  t: (key: string) => string
}

function BarView({ chartData, chartConfig, minHeight, fontSize, maxValue, t }: BarViewProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full"
      style={{ minHeight }}
    >
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
        accessibilityLayer
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tickLine={false}
          tick={{ fontSize }}
          axisLine={false}
        />
        <XAxis
          type="number"
          domain={[0, maxValue * 1.13]}
          tick={{ fontSize }}
          hide
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Bar
          dataKey="value"
          name={t('analytics.quantity')}
          radius={[0, 4, 4, 0]}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={getColor(PALETTE, i)} />
          ))}
          <LabelList
            dataKey="value"
            position="insideRight"
            offset={8}
            className="fill-white"
            fontSize="var(--font-size)"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

// ─── Pie sub-component ──────────────────────────────────────────────────────

interface PieViewProps {
  chartData: ChartRow[]
}

function PieView({ chartData }: PieViewProps) {
  const config = chartData.reduce<ChartConfig>((acc, item, i) => ({
    ...acc,
    [item.name]: { label: item.name, color: getColor(PALETTE, i) },
  }), {})

  return (
    <ChartContainer config={config} className="min-h-[250px] w-full">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
        >
          {chartData.map((item, i) => (
            <Cell key={item.name} fill={getColor(PALETTE, i)} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

// ─── Table sub-component ────────────────────────────────────────────────────

interface TableViewProps {
  items: ProductRanking[]
}

function TableView({ items }: TableViewProps) {
  const { t } = useTranslation()
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="pb-3 text-base text-muted-foreground">
            {t('analytics.productNameCol')}
          </th>
          <th className="pb-3 text-right text-base text-muted-foreground">
            {t('analytics.quantityCol')}
          </th>
          <th className="pb-3 text-right text-base text-muted-foreground">
            {t('analytics.revenueCol')}
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.name} className="border-b last:border-b-0">
            <td className="py-3 text-base">{item.name}</td>
            <td className="py-3 text-right text-base">{item.quantity}</td>
            <td className="py-3 text-right text-base">{formatCurrency(item.revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
