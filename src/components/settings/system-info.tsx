/**
 * System Info component — displays app version, storage, backup status,
 * system details, quick actions, backup history, and error logs.
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar'
import { Trash2, Eraser, DatabaseBackup, RefreshCw } from 'lucide-react'
import { RippleButton } from '@/components/ui/ripple-button'
import { notify } from '@/components/ui/sonner'
import { PaginationControls } from '@/components/settings/pagination-controls'
import { useGoogleAuth } from '@/hooks/use-google-auth'
import { getErrorLogRepo, getBackupLogRepo } from '@/lib/repositories/provider'
import { SCHEMA_VERSION } from '@/lib/schema'
import { APP_VERSION } from '@/lib/version'
import type { BackupLogType, BackupLogStatus } from '@/lib/schemas'

// ─── Constants ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Check if the app is running in standalone (PWA installed) mode */
function isPwaMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

/** Get the environment label */
function getEnvironment(): string {
  return import.meta.env.MODE === 'production' ? 'PROD' : 'DEV'
}

/** Format bytes into a human-readable string */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(1)} ${units[i]}`
}

/** Format milliseconds into a human-readable duration string */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/** Get the translated label for a backup type */
function getTypeLabel(type: BackupLogType, t: (key: string) => string): string {
  const map: Record<BackupLogType, string> = {
    manual: t('backup.typeManual'),
    auto: t('backup.typeAuto'),
    'v1-import': t('backup.typeV1Import'),
  }
  return map[type]
}

/** Get the translated label for a backup status */
function getStatusLabel(
  status: BackupLogStatus,
  t: (key: string) => string,
): string {
  const map: Record<BackupLogStatus, string> = {
    success: t('backup.statusSuccess'),
    failed: t('backup.statusFailed'),
  }
  return map[status]
}

// ─── Storage Hook ────────────────────────────────────────────────────────────

function useStorageEstimate(): number {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    async function estimate() {
      try {
        const est = await navigator.storage.estimate()
        const usage = est.usage ?? 0
        const quota = est.quota ?? 0
        if (quota === 0) {
          setPercent(0)
          return
        }
        setPercent(Math.round((usage / quota) * 100))
      } catch {
        // Storage API not supported — show 0
        setPercent(0)
      }
    }
    estimate()
  }, [])

  return percent
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SystemInfo() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const storagePercent = useStorageEstimate()

  const { googleUser, isAdmin } = useGoogleAuth()

  // ── Pagination State ─────────────────────────────────────────────────
  const [backupPage, setBackupPage] = useState(1)
  const [errorPage, setErrorPage] = useState(1)

  // ── Backup Logs Query ────────────────────────────────────────────────
  const { data: backupLogs = [] } = useQuery({
    queryKey: ['backup-logs', backupPage],
    queryFn: () => getBackupLogRepo().findPaginated(backupPage, PAGE_SIZE),
  })

  const { data: backupLogCount = 0 } = useQuery({
    queryKey: ['backup-logs-count'],
    queryFn: () => getBackupLogRepo().count(),
  })

  const clearBackupLogsMutation = useMutation({
    mutationFn: () => getBackupLogRepo().clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-logs'] })
      queryClient.invalidateQueries({ queryKey: ['backup-logs-count'] })
      setBackupPage(1)
      notify.success(t('settings.logsCleared'))
    },
  })

  // ── Error Logs Query ──────────────────────────────────────────────────

  const { data: logs = [] } = useQuery({
    queryKey: ['error-logs', errorPage],
    queryFn: () => getErrorLogRepo().findPaginated(errorPage, PAGE_SIZE),
  })

  const { data: errorLogCount = 0 } = useQuery({
    queryKey: ['error-logs-count'],
    queryFn: () => getErrorLogRepo().count(),
  })

  const clearLogsMutation = useMutation({
    mutationFn: () => getErrorLogRepo().clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] })
      queryClient.invalidateQueries({ queryKey: ['error-logs-count'] })
      setErrorPage(1)
      notify.success(t('settings.logsCleared'))
    },
  })

  // ── Quick Action Handlers ─────────────────────────────────────────────

  const handleClearCache = useCallback(async () => {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map(k => caches.delete(k)))
      notify.success(t('settings.cacheCleared'))
    } catch {
      // Caches API not available
    }
  }, [t])

  const handleExportDb = useCallback(() => {
    notify.info(t('settings.featureInDev'))
  }, [t])

  const handleForceReload = useCallback(() => {
    window.location.reload()
  }, [])

  // ── Derived Values ────────────────────────────────────────────────────
  const backupTotalPages = Math.max(1, Math.ceil(backupLogCount / PAGE_SIZE))
  const errorTotalPages = Math.max(1, Math.ceil(errorLogCount / PAGE_SIZE))

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Version Card */}
        <Card shadow className="py-4">
          <CardHeader className="py-0">
            <CardTitle fontSize="text-md" className="text-muted-foreground">
              {t('settings.appVersion')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="text-2xl">v{APP_VERSION}</div>
            <div className="mt-auto text-md text-muted-foreground">
              {t('settings.lastUpdated')}: {document.lastModified}
            </div>
          </CardContent>
        </Card>

        {/* Storage Card */}
        <Card shadow className="py-4">
          <CardHeader className="py-0">
            <CardTitle fontSize="text-md" className="text-muted-foreground">
              {t('settings.localStorage')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AnimatedCircularProgressBar
              value={storagePercent}
              gaugePrimaryColor="rgb(127, 149, 106)"
              gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
            />
          </CardContent>
        </Card>

        {/* Backup Card */}
        <Card shadow className="py-4">
          <CardHeader className="py-0">
            <CardTitle fontSize="text-md" className="text-muted-foreground">
              {t('settings.cloudBackup')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="text-lg text-amber-500">
              {t('settings.noBackup')}
            </div>
            <div className="mt-auto text-md text-muted-foreground">
              {t('settings.lastBackup')}: {t('settings.noBackupRecord')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: System Details */}
      <div className="grid grid-cols-3 gap-4">
        {/* Application Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('settings.deployMode')}
              </span>
              <span>{isPwaMode() ? 'PWA' : 'Browser'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('settings.environment')}
              </span>
              <span>{getEnvironment()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Database Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.database')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('settings.dbStatus')}
              </span>
              <span>{t('settings.dbNormal')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('settings.schemaVersion')}
              </span>
              <span>{SCHEMA_VERSION}</span>
            </div>
          </CardContent>
        </Card>

        {/* Login Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.loginInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-muted-foreground">
                {t('settings.googleAccount')}
              </span>
              <div className="break-all">
                {googleUser?.email ?? t('settings.notLoggedIn')}
              </div>
            </div>
            <div>
              {isAdmin ? (
                <span className="inline-block rounded-full bg-primary/15 px-3 py-0.5 text-md text-primary">
                  {t('settings.adminStatus')}
                </span>
              ) : (
                <span className="inline-block rounded-full bg-(--color-red)/15 px-3 py-0.5 text-md text-(--color-red)">
                  {t('settings.notAdmin')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <RippleButton
              className="flex items-center justify-center gap-2 rounded-md border-none bg-(--color-red) px-4 py-2 text-white hover:opacity-80"
              onClick={handleClearCache}
            >
              <Eraser size={16} />
              {t('settings.clearCache')}
            </RippleButton>
            <RippleButton
              className="flex items-center justify-center gap-2 rounded-md border-none bg-(--color-green) px-4 py-2 text-white hover:opacity-80"
              onClick={handleExportDb}
            >
              <DatabaseBackup size={16} />
              {t('settings.exportDb')}
            </RippleButton>
            <RippleButton
              className="flex items-center justify-center gap-2 rounded-md border-none bg-(--color-blue) px-4 py-2 text-white hover:opacity-80"
              onClick={handleForceReload}
            >
              <RefreshCw size={16} />
              {t('settings.reloadApp')}
            </RippleButton>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Backup History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('backup.history')}</CardTitle>
            <RippleButton
              className="flex items-center gap-2 rounded-md border-none bg-(--color-red) px-3 py-1 text-white hover:opacity-80"
              onClick={() => clearBackupLogsMutation.mutate()}
            >
              <Trash2 size={14} />
              {t('backup.clearHistory')}
            </RippleButton>
          </div>
        </CardHeader>
        <CardContent>
          {backupLogs.length === 0 ? (
            <p className="text-muted-foreground">
              {t('backup.noBackupHistory')}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="px-2 py-1">{t('backup.historyTime')}</th>
                      <th className="px-2 py-1">{t('backup.historyType')}</th>
                      <th className="px-2 py-1">{t('backup.historyStatus')}</th>
                      <th className="px-2 py-1">
                        {t('backup.historyFilename')}
                      </th>
                      <th className="px-2 py-1 text-right">
                        {t('backup.historySize')}
                      </th>
                      <th className="px-2 py-1 text-right">
                        {t('backup.historyDuration')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupLogs.map(log => (
                      <tr key={log.id} className="border-b">
                        <td className="px-2 py-1 whitespace-nowrap">
                          {dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </td>
                        <td className="px-2 py-1">
                          {getTypeLabel(log.type, t)}
                        </td>
                        <td className="px-2 py-1">
                          {getStatusLabel(log.status, t)}
                        </td>
                        <td className="px-2 py-1">{log.filename ?? '-'}</td>
                        <td className="px-2 py-1 text-right">
                          {formatSize(log.size)}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {formatDuration(log.durationMs)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={backupPage}
                totalPages={backupTotalPages}
                onPageChange={setBackupPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Error Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('settings.errorLogs')}</CardTitle>
            <RippleButton
              className="flex items-center gap-2 rounded-md border-none bg-(--color-red) px-3 py-1 text-white hover:opacity-80"
              onClick={() => clearLogsMutation.mutate()}
            >
              <Trash2 size={14} />
              {t('settings.clearLogs')}
            </RippleButton>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground">{t('settings.noErrors')}</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="px-2 py-1">{t('settings.logTime')}</th>
                      <th className="px-2 py-1">{t('settings.logSource')}</th>
                      <th className="px-2 py-1">{t('settings.logMessage')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b">
                        <td className="px-2 py-1 whitespace-nowrap">
                          {dayjs(log.createdAt).format('HH:mm:ss')}
                        </td>
                        <td className="px-2 py-1">{log.source}</td>
                        <td className="px-2 py-1">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                currentPage={errorPage}
                totalPages={errorTotalPages}
                onPageChange={setErrorPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
