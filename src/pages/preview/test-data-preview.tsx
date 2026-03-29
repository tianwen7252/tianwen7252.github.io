/**
 * Test data generation preview page — dev-only UI for inserting
 * 6 months of realistic order and attendance data.
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Database, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { RippleButton } from '@/components/ui/ripple-button'
import { ConfirmModal } from '@/components/modal'
import { getDatabase } from '@/lib/repositories'
import {
  insertTestData,
  type InsertProgress,
  type InsertTestDataResult,
} from '@/lib/test-data-inserter'
import { cn } from '@/lib/cn'

// ─── State types ────────────────────────────────────────────────────────────

type GenerationState =
  | { status: 'idle' }
  | { status: 'confirming' }
  | { status: 'running'; progress: InsertProgress }
  | { status: 'complete'; result: InsertTestDataResult }
  | { status: 'error'; message: string }

// ─── Component ──────────────────────────────────────────────────────────────

export function TestDataPreview() {
  const { t } = useTranslation()
  const [state, setState] = useState<GenerationState>({ status: 'idle' })

  const handleGenerate = useCallback(async () => {
    setState({
      status: 'running',
      progress: {
        currentDay: 0,
        totalDays: 0,
        ordersInserted: 0,
        attendancesInserted: 0,
        phase: 'generating',
      },
    })

    try {
      const db = getDatabase()
      const result = await insertTestData(db, {
        months: 6,
        onProgress: progress => {
          setState({ status: 'running', progress })
        },
      })
      setState({ status: 'complete', result })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setState({ status: 'error', message })
    }
  }, [])

  const handleConfirm = useCallback(() => {
    void handleGenerate()
  }, [handleGenerate])

  const handleReset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database size={24} className="text-primary" />
        <h2 className="text-xl">{t('preview.testData.title')}</h2>
      </div>

      <p className="text-md text-muted-foreground">
        {t('preview.testData.description')}
      </p>

      {/* Warning notice */}
      <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-yellow-600" />
        <p className="text-md text-yellow-800">
          {t('preview.testData.warning')}
        </p>
      </div>

      {/* Action area */}
      {state.status === 'idle' && (
        <RippleButton
          className="bg-primary text-primary-foreground"
          onClick={() => setState({ status: 'confirming' })}
        >
          {t('preview.testData.generateButton')}
        </RippleButton>
      )}

      {/* Progress display */}
      {state.status === 'running' && (
        <ProgressDisplay progress={state.progress} />
      )}

      {/* Complete display */}
      {state.status === 'complete' && (
        <CompleteDisplay result={state.result} onReset={handleReset} />
      )}

      {/* Error display */}
      {state.status === 'error' && (
        <ErrorDisplay message={state.message} onReset={handleReset} />
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={state.status === 'confirming'}
        title={t('preview.testData.confirmTitle')}
        variant="warm"
        onConfirm={handleConfirm}
        onCancel={handleReset}
      >
        <p className="text-md text-muted-foreground">
          {t('preview.testData.confirmMessage')}
        </p>
      </ConfirmModal>
    </div>
  )
}

// ─── Progress ───────────────────────────────────────────────────────────────

function ProgressDisplay({ progress }: { progress: InsertProgress }) {
  const { t } = useTranslation()
  const pct =
    progress.totalDays > 0
      ? Math.round((progress.currentDay / progress.totalDays) * 100)
      : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-md text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        <span>{t(`preview.testData.phase.${progress.phase}`)}</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full bg-primary transition-all duration-300',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-md text-muted-foreground">
        <span>
          {t('preview.testData.progress', {
            current: progress.currentDay,
            total: progress.totalDays,
          })}
        </span>
        <span>
          {t('preview.testData.ordersInserted', {
            count: progress.ordersInserted,
          })}
        </span>
        <span>
          {t('preview.testData.attendancesInserted', {
            count: progress.attendancesInserted,
          })}
        </span>
      </div>
    </div>
  )
}

// ─── Complete ───────────────────────────────────────────────────────────────

function CompleteDisplay({
  result,
  onReset,
}: {
  result: InsertTestDataResult
  onReset: () => void
}) {
  const { t } = useTranslation()

  const rows = [
    { label: t('preview.testData.summary.days'), value: result.totalDays },
    { label: t('preview.testData.summary.orders'), value: result.totalOrders },
    {
      label: t('preview.testData.summary.orderItems'),
      value: result.totalOrderItems,
    },
    {
      label: t('preview.testData.summary.orderDiscounts'),
      value: result.totalOrderDiscounts,
    },
    {
      label: t('preview.testData.summary.attendances'),
      value: result.totalAttendances,
    },
    {
      label: t('preview.testData.summary.dailyData'),
      value: result.totalDailyData,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={20} />
        <span className="text-md">{t('preview.testData.complete')}</span>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-md">{t('preview.testData.summary.title')}</h3>
        <div className="grid grid-cols-2 gap-2 text-md">
          {rows.map(row => (
            <div key={row.label} className="flex justify-between">
              <span className="text-muted-foreground">{row.label}</span>
              <span>{row.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <RippleButton
        className="bg-muted text-muted-foreground"
        onClick={onReset}
      >
        {t('preview.testData.generateButton')}
      </RippleButton>
    </div>
  )
}

// ─── Error ──────────────────────────────────────────────────────────────────

function ErrorDisplay({
  message,
  onReset,
}: {
  message: string
  onReset: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
        <p className="text-md text-red-800">
          {t('preview.testData.error', { message })}
        </p>
      </div>

      <RippleButton
        className="bg-muted text-muted-foreground"
        onClick={onReset}
      >
        {t('common.retry')}
      </RippleButton>
    </div>
  )
}
