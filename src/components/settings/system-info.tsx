/**
 * System Info component — displays app version, storage, backup status,
 * system details, quick actions, and error logs.
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar'
import { RippleButton } from '@/components/ui/ripple-button'
import { notify } from '@/components/ui/sonner'
import { useAppStore } from '@/stores/app-store'
import { getErrorLogRepo } from '@/lib/repositories/provider'
import { SCHEMA_VERSION } from '@/lib/schema'
import { APP_VERSION } from '@/lib/version'

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

  const googleUser = useAppStore(s => s.googleUser)
  const isAdmin = useAppStore(s => s.isAdmin)

  // ── Error Logs Query ──────────────────────────────────────────────────

  const { data: logs = [] } = useQuery({
    queryKey: ['error-logs'],
    queryFn: () => getErrorLogRepo().findRecent(50),
  })

  const clearLogsMutation = useMutation({
    mutationFn: () => getErrorLogRepo().clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] })
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('settings.googleAccount')}
              </span>
              <span>{googleUser?.email ?? t('settings.notLoggedIn')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('settings.adminStatus')}
              </span>
              <span>{isAdmin ? '\u2705' : '\u274C'}</span>
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
              className="rounded-md border border-input bg-background px-4 py-2 text-foreground hover:bg-accent"
              onClick={handleClearCache}
            >
              {t('settings.clearCache')}
            </RippleButton>
            <RippleButton
              className="rounded-md border border-input bg-background px-4 py-2 text-foreground hover:bg-accent"
              onClick={handleExportDb}
            >
              {t('settings.exportDb')}
            </RippleButton>
            <RippleButton
              className="rounded-md border border-input bg-background px-4 py-2 text-foreground hover:bg-accent"
              onClick={handleForceReload}
            >
              {t('settings.forceReload')}
            </RippleButton>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Error Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('settings.errorLogs')}</CardTitle>
            <RippleButton
              className="rounded-md border border-input bg-background px-3 py-1 text-foreground hover:bg-accent"
              onClick={() => clearLogsMutation.mutate()}
            >
              {t('settings.clearLogs')}
            </RippleButton>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground">{t('settings.noErrors')}</p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
