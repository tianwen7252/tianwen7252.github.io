/**
 * OrderTimeChart — bar chart showing order count distribution
 * for business hours (10AM-8PM), aggregated into 2-hour buckets.
 * Supports 3 view modes: bar (default), pie, and table.
 */

import { useState, useMemo } from 'react'
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
import type { HourBucket } from '@/lib/repositories/statistics-repository'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'bar' | 'pie' | 'table'

interface OrderTimeChartProps {
  data: HourBucket[]
}

interface TwoHourBucket {
  label: string
  count: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PALETTE = CHART_PALETTES.mossForest

// Business hour range: 10AM-8PM in 2-hour increments
const BUSINESS_HOURS: Array<{ start: number; label: string }> = [
  { start: 10, label: '10AM' },
  { start: 12, label: '12PM' },
  { start: 14, label: '2PM' },
  { start: 16, label: '4PM' },
  { start: 18, label: '6PM' },
]

// Aggregate 24-hour data into 2-hour business-hour buckets (10AM-8PM)
function aggregateToTwoHourBuckets(data: HourBucket[]): TwoHourBucket[] {
  const countByHour = new Map<number, number>(data.map(b => [b.hour, b.count]))
  return BUSINESS_HOURS.map(({ start, label }) => ({
    label,
    count: (countByHour.get(start) ?? 0) + (countByHour.get(start + 1) ?? 0),
  }))
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OrderTimeChart({ data }: OrderTimeChartProps) {
  const { t } = useTranslation()
  const fontSize = useAppStore().fontSize
  const [viewMode, setViewMode] = useState<ViewMode>('bar')

  const chartConfig = {
    count: {
      label: t('analytics.orderCountLabel'),
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig

  const buckets = useMemo(() => aggregateToTwoHourBuckets(data), [data])
  const isEmpty = data.length === 0 || buckets.every(b => b.count === 0)

  const viewButtons: { mode: ViewMode; label: string; icon: typeof BarChart3 }[] = [
    { mode: 'bar', label: t('analytics.viewBar'), icon: BarChart3 },
    { mode: 'pie', label: t('analytics.viewPie'), icon: PieChartIcon },
    { mode: 'table', label: t('analytics.viewTable'), icon: TableIcon },
  ]

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-normal">{t('analytics.orderTimeTitle')}</CardTitle>
        <CardDescription>{t('analytics.orderTimeDesc')}</CardDescription>
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
        {isEmpty ? (
          <ChartEmpty />
        ) : viewMode === 'bar' ? (
          <BarView buckets={buckets} chartConfig={chartConfig} fontSize={fontSize} />
        ) : viewMode === 'pie' ? (
          <PieView buckets={buckets} />
        ) : (
          <TableView buckets={buckets} />
        )}
      </CardContent>
    </Card>
  )
}

// ─── Bar sub-component ──────────────────────────────────────────────────────

interface BarViewProps {
  buckets: TwoHourBucket[]
  chartConfig: ChartConfig
  fontSize: number
}

function BarView({ buckets, chartConfig, fontSize }: BarViewProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart data={buckets} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize }}
        />
        <YAxis tick={{ fontSize }} allowDecimals={false} hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="count" position="top" offset={6} className="fill-foreground" fontSize={fontSize} />
          {buckets.map((_, index) => (
            <Cell key={index} fill={getColor(PALETTE, index)} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

// ─── Pie sub-component ──────────────────────────────────────────────────────

interface PieViewProps {
  buckets: TwoHourBucket[]
}

function PieView({ buckets }: PieViewProps) {
  const config = buckets.reduce<ChartConfig>((acc, item, i) => ({
    ...acc,
    [item.label]: { label: item.label, color: getColor(PALETTE, i) },
  }), {})

  return (
    <ChartContainer config={config} className="min-h-[250px] w-full">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Pie
          data={buckets}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
        >
          {buckets.map((item, i) => (
            <Cell key={item.label} fill={getColor(PALETTE, i)} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

// ─── Table sub-component ────────────────────────────────────────────────────

interface TableViewProps {
  buckets: TwoHourBucket[]
}

function TableView({ buckets }: TableViewProps) {
  const { t } = useTranslation()
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="pb-3 text-base text-muted-foreground">
            {t('analytics.timeSlotCol')}
          </th>
          <th className="pb-3 text-right text-base text-muted-foreground">
            {t('analytics.orderCountCol')}
          </th>
        </tr>
      </thead>
      <tbody>
        {buckets.map((item) => (
          <tr key={item.label} className="border-b last:border-b-0">
            <td className="py-3 text-base">{item.label}</td>
            <td className="py-3 text-right text-base">{item.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
