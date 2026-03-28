// Calculator Engine — iPhone-style calculator (pure functions, immutable state)

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalculatorKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '.'
  | '+'
  | '-'
  | '*'
  | '/'
  | '='
  | '%'
  | 'c'
  | 'backspace'
  | '+/-'

export interface CalculatorState {
  readonly display: string
  readonly expression: string
  readonly previousValue: number | null
  readonly operator: string | null
  readonly waitingForOperand: boolean
  readonly lastOperator: string | null
  readonly lastOperand: number | null
  readonly error: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DIGIT_KEYS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
const OPERATOR_KEYS = new Set(['+', '-', '*', '/'])

/** Map internal operator symbols to display-friendly symbols. */
const DISPLAY_OPERATOR: Readonly<Record<string, string>> = {
  '+': '+',
  '-': '-',
  '*': '\u00D7',
  '/': '\u00F7',
}

// ─── Initial State ───────────────────────────────────────────────────────────

/** Create a fresh calculator state with display "0". */
export function createInitialState(): CalculatorState {
  return {
    display: '0',
    expression: '',
    previousValue: null,
    operator: null,
    waitingForOperand: false,
    lastOperator: null,
    lastOperand: null,
    error: false,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse a display string to a number. Returns 0 for non-numeric strings (e.g., "Error"). */
function parseDisplay(display: string): number {
  const value = parseFloat(display)
  return Number.isNaN(value) ? 0 : value
}

/** Format a numeric result for display. */
function formatResult(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error'
  }
  // Remove trailing zeros from decimal results
  return String(parseFloat(value.toPrecision(12)))
}

/** Check whether a numeric result is out of displayable range (would produce scientific notation). */
function isOutOfRange(value: number): boolean {
  if (!Number.isFinite(value)) return true
  const abs = Math.abs(value)
  return abs !== 0 && (abs >= 1e15 || abs < 1e-6)
}

/** Perform a binary arithmetic operation. Returns null for division by zero. */
function calculate(left: number, op: string, right: number): number | null {
  switch (op) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      return right === 0 ? null : left / right
    default:
      return left
  }
}

/** Build an expression string like "1+1=2". */
function buildExpression(
  left: number,
  op: string,
  right: number,
  result: number,
): string {
  const displayOp = DISPLAY_OPERATOR[op] ?? op
  return `${formatResult(left)}${displayOp}${formatResult(right)}=${formatResult(result)}`
}

/** Check if state is "just finished equals" and ready for fresh input. */
function isAfterEquals(state: CalculatorState): boolean {
  return (
    state.lastOperator !== null &&
    !state.waitingForOperand &&
    state.operator === null
  )
}

/** Create an error state from the current state. */
function toErrorState(state: CalculatorState): CalculatorState {
  return {
    ...state,
    display: 'Error',
    error: true,
    expression: '',
    previousValue: null,
    operator: null,
    waitingForOperand: false,
    lastOperator: null,
    lastOperand: null,
  }
}

// ─── Key Handlers ────────────────────────────────────────────────────────────

/** Handle digit key press (0-9). */
function handleDigit(state: CalculatorState, key: string): CalculatorState {
  // After equals, start a fresh calculation
  if (isAfterEquals(state)) {
    return {
      ...createInitialState(),
      display: key,
    }
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: key,
      waitingForOperand: false,
    }
  }

  // Suppress leading zeros
  const newDisplay = state.display === '0' ? key : state.display + key
  return {
    ...state,
    display: newDisplay,
  }
}

/** Handle decimal point key press. */
function handleDecimal(state: CalculatorState): CalculatorState {
  // After equals, start fresh with "0."
  if (isAfterEquals(state)) {
    return {
      ...createInitialState(),
      display: '0.',
    }
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
    }
  }

  // Ignore if decimal already exists
  if (state.display.includes('.')) {
    return state
  }

  return {
    ...state,
    display: state.display + '.',
  }
}

/** Handle operator key press (+, -, *, /). */
function handleOperator(state: CalculatorState, op: string): CalculatorState {
  const currentValue = parseDisplay(state.display)

  // If already waiting for operand, just replace the operator
  if (state.waitingForOperand && state.operator !== null) {
    return {
      ...state,
      operator: op,
    }
  }

  // If there is a pending operation, evaluate it first (chained operations)
  if (
    state.previousValue !== null &&
    state.operator !== null &&
    !state.waitingForOperand
  ) {
    const result = calculate(state.previousValue, state.operator, currentValue)

    if (result === null || isOutOfRange(result)) {
      return toErrorState(state)
    }

    return {
      ...state,
      display: formatResult(result),
      previousValue: result,
      operator: op,
      waitingForOperand: true,
      lastOperator: null,
      lastOperand: null,
      expression: '',
    }
  }

  // First operator press — store the left operand
  return {
    ...state,
    previousValue: currentValue,
    operator: op,
    waitingForOperand: true,
    lastOperator: null,
    lastOperand: null,
    expression: '',
  }
}

/** Handle equals key press. */
function handleEquals(state: CalculatorState): CalculatorState {
  const currentValue = parseDisplay(state.display)

  // Repeat last operation if pressing equals again
  if (state.lastOperator !== null && state.operator === null) {
    const left = currentValue
    const right = state.lastOperand ?? 0
    const op = state.lastOperator
    const result = calculate(left, op, right)

    if (result === null || isOutOfRange(result)) {
      return toErrorState(state)
    }

    return {
      ...state,
      display: formatResult(result),
      expression: buildExpression(left, op, right, result),
      previousValue: null,
      operator: null,
      waitingForOperand: false,
      lastOperator: op,
      lastOperand: right,
    }
  }

  // No pending operation — just show current value
  if (state.operator === null || state.previousValue === null) {
    return state
  }

  // If waiting for operand (e.g., 5+=), use left operand as right operand (iPhone behavior: 5+5=10)
  const rightOperand = state.waitingForOperand
    ? state.previousValue
    : currentValue
  const left = state.previousValue
  const op = state.operator
  const result = calculate(left, op, rightOperand)

  if (result === null || isOutOfRange(result)) {
    return toErrorState(state)
  }

  return {
    ...state,
    display: formatResult(result),
    expression: buildExpression(left, op, rightOperand, result),
    previousValue: null,
    operator: null,
    waitingForOperand: false,
    lastOperator: op,
    lastOperand: rightOperand,
  }
}

/** Handle percentage key press. */
function handlePercentage(state: CalculatorState): CalculatorState {
  const currentValue = parseDisplay(state.display)

  // With pending operator: calculate percentage of left operand
  if (state.previousValue !== null && state.operator !== null) {
    const op = state.operator

    // For + and -, percentage means "X% of previousValue"
    // For * and /, percentage means "divide by 100"
    const percentValue =
      op === '+' || op === '-'
        ? state.previousValue * (currentValue / 100)
        : currentValue / 100

    if (isOutOfRange(percentValue)) {
      return toErrorState(state)
    }

    return {
      ...state,
      display: formatResult(percentValue),
      waitingForOperand: false,
    }
  }

  // No operator: just divide by 100
  const result = currentValue / 100
  if (isOutOfRange(result)) {
    return toErrorState(state)
  }
  return {
    ...state,
    display: formatResult(result),
  }
}

/** Handle sign toggle (+/-) key press. */
function handleSignToggle(state: CalculatorState): CalculatorState {
  const currentValue = parseDisplay(state.display)

  // 0 stays 0
  if (currentValue === 0) {
    return {
      ...state,
      display: '0',
    }
  }

  const negated = -currentValue
  return {
    ...state,
    display: formatResult(negated),
  }
}

/** Handle backspace key press. */
function handleBackspace(state: CalculatorState): CalculatorState {
  // If waiting for operand, treat as removing from "0" → stays "0"
  if (state.waitingForOperand) {
    return {
      ...state,
      display: '0',
      waitingForOperand: false,
    }
  }

  // Remove last character
  const newDisplay = state.display.slice(0, -1)

  return {
    ...state,
    display: newDisplay === '' || newDisplay === '-' ? '0' : newDisplay,
  }
}

// ─── Main Dispatch ───────────────────────────────────────────────────────────

/** Process a single key press and return a new (immutable) calculator state. */
export function processKey(
  state: CalculatorState,
  key: CalculatorKey,
): CalculatorState {
  // Clear always works, even in error state
  if (key === 'c') {
    return createInitialState()
  }

  // In error state, only clear is accepted
  if (state.error) {
    return state
  }

  // Dispatch by key type
  if (DIGIT_KEYS.has(key)) {
    return handleDigit(state, key)
  }

  if (key === '.') {
    return handleDecimal(state)
  }

  if (OPERATOR_KEYS.has(key)) {
    return handleOperator(state, key)
  }

  if (key === '=') {
    return handleEquals(state)
  }

  if (key === '%') {
    return handlePercentage(state)
  }

  if (key === '+/-') {
    return handleSignToggle(state)
  }

  if (key === 'backspace') {
    return handleBackspace(state)
  }

  // Unknown key — return state unchanged
  return state
}

// ─── Utility Functions ───────────────────────────────────────────────────────

/** Get the numeric value from state, or null if in error state. */
export function getNumericValue(state: CalculatorState): number | null {
  if (state.error) {
    return null
  }

  return parseDisplay(state.display)
}

/** Check whether the calculator is in an error state. */
export function isError(state: CalculatorState): boolean {
  return state.error
}
