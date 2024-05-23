import { evaluate } from 'mathjs'
import { trim, last } from 'lodash'

const OPERATORS = ['+', '-', '*']
const OPERATORS_STRING = OPERATORS.join('')

export function process(input: string) {
  const { length } = input
  const cleanInput = trim(input, OPERATORS_STRING)
  const result = length === 0 ? 0 : evaluate(cleanInput)
  let transformedInput = input
  // show empty if there's no number from the beginning
  if (length === 1 && OPERATORS.includes(input)) {
    transformedInput = ''
  } else {
    const lastChar = last(input)
    // "1+2+3++" => "1+2+3+"
    // "1+2+3+*" => "1+2+3*"
    // "1+2+3*-" => "1+2+3-" ... and so on
    if (OPERATORS.includes(lastChar) && OPERATORS.includes(input[length - 2])) {
      transformedInput = cleanInput + lastChar
    }
  }
  return {
    input,
    result,
    transformedInput,
  }
}
