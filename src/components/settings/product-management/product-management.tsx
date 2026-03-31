/**
 * Product Management settings page.
 * Orchestrates 4 sections with a shared refresh mechanism
 * and a unified "Save Settings" button.
 */

import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { ConfirmModal } from '@/components/modal'
import { RippleButton } from '@/components/ui/ripple-button'
import { notify } from '@/components/ui/sonner'
import { CommodityTypeSection } from './commodity-type-section'
import { CommoditySection } from './commodity-section'
import { OrderTypeSection } from './order-type-section'
import { ResetSection } from './reset-section'
import type { SectionRef, ChangeSummaryItem } from './types'

export function ProductManagement() {
  const { t } = useTranslation()
  const [refreshKey, setRefreshKey] = useState(0)

  // Section refs for orchestrating saves
  const typeRef = useRef<SectionRef | null>(null)
  const commodityRef = useRef<SectionRef | null>(null)
  const orderTypeRef = useRef<SectionRef | null>(null)

  // Track which sections have changes
  const [changesMap, setChangesMap] = useState<Record<string, boolean>>({})
  const hasAnyChanges = Object.values(changesMap).some(Boolean)

  // Save confirm modal state
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [changeSummary, setChangeSummary] = useState<
    readonly ChangeSummaryItem[]
  >([])

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
    setChangesMap({})
  }, [])

  // Change callbacks for each section
  const handleTypeChanges = useCallback((has: boolean) => {
    setChangesMap(prev => ({ ...prev, types: has }))
  }, [])

  const handleCommodityChanges = useCallback((has: boolean) => {
    setChangesMap(prev => ({ ...prev, commodities: has }))
  }, [])

  const handleOrderTypeChanges = useCallback((has: boolean) => {
    setChangesMap(prev => ({ ...prev, orderTypes: has }))
  }, [])

  // Collect summaries and open confirm modal
  const handleSaveClick = useCallback(() => {
    const summaries: ChangeSummaryItem[] = [
      ...(typeRef.current?.getChangeSummary() ?? []),
      ...(commodityRef.current?.getChangeSummary() ?? []),
      ...(orderTypeRef.current?.getChangeSummary() ?? []),
    ]
    setChangeSummary(summaries)
    setIsSaveOpen(true)
  }, [])

  // Confirm save -- write all changes to DB
  const handleSaveConfirm = useCallback(async () => {
    setIsSaving(true)

    try {
      await typeRef.current?.save()
      await commodityRef.current?.save()
      await orderTypeRef.current?.save()

      setIsSaveOpen(false)
      notify.success(t('productMgmt.saveSuccess'))
      handleRefresh()
    } catch {
      notify.error(t('productMgmt.saveError'))
    } finally {
      setIsSaving(false)
    }
  }, [t, handleRefresh])

  const handleSaveCancel = useCallback(() => {
    setIsSaveOpen(false)
  }, [])

  return (
    <div className="space-y-8 p-6">
      {/* Unified Save Settings button */}
      <div className="flex justify-end">
        <RippleButton
          disabled={!hasAnyChanges}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-base text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSaveClick}
        >
          <Save size={16} />
          {t('productMgmt.saveSettings')}
        </RippleButton>
      </div>

      <CommodityTypeSection
        refreshKey={refreshKey}
        onHasChanges={handleTypeChanges}
        sectionRef={typeRef}
      />
      <CommoditySection
        refreshKey={refreshKey}
        onHasChanges={handleCommodityChanges}
        sectionRef={commodityRef}
      />
      <OrderTypeSection
        refreshKey={refreshKey}
        onHasChanges={handleOrderTypeChanges}
        sectionRef={orderTypeRef}
      />
      <ResetSection onReset={handleRefresh} />

      {/* Save confirm modal -- shows all pending changes */}
      <ConfirmModal
        open={isSaveOpen}
        title={t('productMgmt.saveConfirmTitle')}
        variant="green"
        shineColor="green"
        confirmText={t('common.confirm')}
        loading={isSaving}
        onConfirm={handleSaveConfirm}
        onCancel={handleSaveCancel}
      >
        <div className="space-y-2 text-base text-foreground">
          {changeSummary.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 text-muted-foreground">
                {item.type === 'add' && '+'}
                {item.type === 'edit' && '~'}
                {item.type === 'delete' && '-'}
                {item.type === 'label' && '~'}
                {item.type === 'reorder' && '#'}
              </span>
              <span>{item.description}</span>
            </div>
          ))}
        </div>
      </ConfirmModal>
    </div>
  )
}
