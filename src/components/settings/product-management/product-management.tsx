/**
 * Product Management settings page.
 * Orchestrates 4 sections with a shared refresh mechanism.
 */

import { useState, useCallback } from 'react'
import { CommodityTypeSection } from './commodity-type-section'
import { CommoditySection } from './commodity-section'
import { OrderTypeSection } from './order-type-section'
import { ResetSection } from './reset-section'

export function ProductManagement() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <div className="space-y-8 p-6">
      <CommodityTypeSection refreshKey={refreshKey} onRefresh={handleRefresh} />
      <CommoditySection refreshKey={refreshKey} onRefresh={handleRefresh} />
      <OrderTypeSection refreshKey={refreshKey} onRefresh={handleRefresh} />
      <ResetSection onReset={handleRefresh} />
    </div>
  )
}
