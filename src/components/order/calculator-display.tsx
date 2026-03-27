import { useTranslation } from 'react-i18next'
import { RippleButton } from '@/components/ui/ripple-button'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalculatorDisplayProps {
  /** Current display value from calculator engine */
  readonly display: string
  /** Expression string (e.g., "1+1=2") */
  readonly expression: string
  /** Whether calculator is in error state */
  readonly isError: boolean
  /** Numeric result (null if error) */
  readonly numericValue: number | null
  /** Custom order name (user input or selected) */
  readonly name: string
  /** Called when name changes */
  readonly onNameChange: (name: string) => void
  /** Available name options from DB */
  readonly nameOptions: readonly ComboboxOption[]
  /** Called when a name option is deleted */
  readonly onDeleteNameOption: (value: string) => void
  /** Called when confirm submit is pressed */
  readonly onSubmit: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────

/** Right-side panel: expression display, name combobox, and submit button. */
export function CalculatorDisplay({
  display,
  expression,
  isError,
  numericValue,
  name,
  onNameChange,
  nameOptions,
  onDeleteNameOption,
  onSubmit,
}: CalculatorDisplayProps) {
  const { t } = useTranslation()

  // Disable submit when: error, result is zero, or display is initial "0" with no expression
  const isZeroResult = numericValue === 0
  const canSubmit = !isError && !isZeroResult && numericValue !== null

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Expression + Result display */}
      <div className="flex flex-col items-end gap-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
        {expression && (
          <span className="text-sm text-white/60 truncate max-w-full">
            {expression}
          </span>
        )}
        <span
          className={`text-3xl font-mono truncate max-w-full ${
            isError ? 'text-destructive' : 'text-white'
          }`}
        >
          {display}
        </span>
      </div>

      {/* Custom order name input / Combobox */}
      <Combobox
        value={name}
        onChange={onNameChange}
        options={nameOptions as ComboboxOption[]}
        onDelete={onDeleteNameOption}
        placeholder={t('order.calculatorNamePlaceholder')}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Error hint */}
      {isError && (
        <p className="text-center text-sm text-destructive">
          {t('order.calculatorError')}
        </p>
      )}
      {isZeroResult && !isError && (
        <p className="text-center text-sm text-destructive">
          {t('order.calculatorZeroResult')}
        </p>
      )}

      {/* Submit button */}
      <RippleButton
        onClick={onSubmit}
        disabled={!canSubmit}
        className="h-14 w-full rounded-xl bg-primary text-md text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {t('order.calculatorSubmit')}
      </RippleButton>
    </div>
  )
}
