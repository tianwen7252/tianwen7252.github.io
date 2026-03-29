/**
 * Cloud Backup DB Statistics — displays a table of all database tables
 * with their row counts and a total row.
 */

import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useDbStats } from '@/hooks/use-db-stats'

// ── Component ───────────────────────────────────────────────────────────────

export function CloudBackupDbStats() {
  const { t } = useTranslation()
  const { tables, totalRows } = useDbStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('backup.dbStats')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="px-2 py-1">{t('backup.tableName')}</th>
                <th className="px-2 py-1 text-right">{t('backup.rowCount')}</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(table => (
                <tr key={table.tableName} className="border-b">
                  <td className="px-2 py-1">{table.tableName}</td>
                  <td className="px-2 py-1 text-right">{table.rowCount}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="border-t-2">
                <td className="px-2 py-1">{t('backup.totalRows')}</td>
                <td className="px-2 py-1 text-right">{totalRows}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
