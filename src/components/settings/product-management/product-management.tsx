/**
 * Product Management settings page.
 * Orchestrates 4 sections: commodity types, commodities, order types, reset.
 */

import { CommodityTypeSection } from './commodity-type-section'
import { CommoditySection } from './commodity-section'
import { OrderTypeSection } from './order-type-section'
import { ResetSection } from './reset-section'

export function ProductManagement() {
  return (
    <div className="space-y-8 p-6">
      <CommodityTypeSection />
      <CommoditySection />
      <OrderTypeSection />
      <ResetSection />
    </div>
  )
}
