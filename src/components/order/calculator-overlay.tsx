import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createInitialState,
  processKey,
  getNumericValue,
  isError as isCalcError,
  type CalculatorKey,
  type CalculatorState,
} from '@/lib/calculator-engine'
import { getCustomOrderNameRepo } from '@/lib/repositories/provider'
import { useOrderStore } from '@/stores/order-store'
import { RippleButton } from '@/components/ui/ripple-button'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { CalculatorKeypad } from './calculator-keypad'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalculatorOverlayProps {
  readonly onClose: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Full calculator overlay rendered inside ProductGrid.
 * White glassmorphism, absolute positioned to fill the parent container.
 * Vertical layout: expression → keypad → combobox → submit.
 */
export function CalculatorOverlay({ onClose }: CalculatorOverlayProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const addCustomItem = useOrderStore(s => s.addCustomItem)

  const [calcState, setCalcState] =
    useState<CalculatorState>(createInitialState)
  const [customName, setCustomName] = useState('')

  // Fetch saved custom order names
  const { data: savedNames = [] } = useQuery({
    queryKey: ['custom-order-names'],
    queryFn: () => getCustomOrderNameRepo().findAll(),
  })

  const nameOptions: ComboboxOption[] = savedNames.map(n => ({
    value: n.id,
    label: n.name,
  }))

  const handleKey = useCallback((key: CalculatorKey) => {
    setCalcState(prev => processKey(prev, key))
  }, [])

  const handleDeleteNameOption = useCallback(
    async (id: string) => {
      await getCustomOrderNameRepo().remove(id)
      queryClient.invalidateQueries({ queryKey: ['custom-order-names'] })
    },
    [queryClient],
  )

  const handleSubmit = useCallback(async () => {
    const value = getNumericValue(calcState)
    if (value === null || value === 0) return

    let orderName = customName.trim()
    if (!orderName) {
      orderName =
        value < 0 ? t('order.discountDefault') : t('order.customOrderDefault')
    }

    addCustomItem(orderName, value)

    // Persist custom name if it's user-defined
    if (
      customName.trim() &&
      customName.trim() !== t('order.customOrderDefault') &&
      customName.trim() !== t('order.discountDefault')
    ) {
      await getCustomOrderNameRepo().create(customName.trim())
      queryClient.invalidateQueries({ queryKey: ['custom-order-names'] })
    }

    onClose()
  }, [calcState, customName, addCustomItem, onClose, queryClient, t])

  const numericValue = getNumericValue(calcState)
  const errorState = isCalcError(calcState)
  const isZeroResult = numericValue === 0
  const canSubmit = !errorState && !isZeroResult && numericValue !== null

  return (
    <div
      data-testid="calculator-overlay"
      className="absolute inset-0 z-20 flex flex-col border border-black/5 bg-white/70 p-4 backdrop-blur-xl"
    >
      {/* Header: expression display + close button */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex min-w-0 flex-1 flex-col items-end pr-3">
          {calcState.expression && (
            <span className="truncate text-base text-muted-foreground">
              {calcState.expression}
            </span>
          )}
          <span
            className={`font-mono text-3xl truncate max-w-full ${
              errorState ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {calcState.display}
          </span>
        </div>
        <RippleButton
          onClick={onClose}
          rippleColor="rgba(0,0,0,0.1)"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </RippleButton>
      </div>

      {/* Keypad — fills available space */}
      <CalculatorKeypad activeOperator={calcState.operator} onKey={handleKey} />

      {/* Bottom: Combobox + Submit */}
      <div className="mt-3 flex flex-col gap-2">
        <Combobox
          value={customName}
          onChange={setCustomName}
          options={nameOptions}
          onDelete={handleDeleteNameOption}
          placeholder={t('order.calculatorNamePlaceholder')}
        />
        <RippleButton
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-14 w-full rounded-xl bg-primary text-md text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {t('order.calculatorSubmit')}
        </RippleButton>
      </div>
    </div>
  )
}
