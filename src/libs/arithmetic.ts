import { create, evaluateDependencies, unaryPlusDependencies } from 'mathjs'
import { trim } from 'lodash-es'

const OPERATORS = ['+', '*']
const OPERATORS_STRING = OPERATORS.join('')

// light-weight mathjs
const { evaluate } = create({ evaluateDependencies, unaryPlusDependencies })

export function calculate(input: string) {
  return evaluate(input)
}

export function process(input: string) {
  const { length } = input
  const cleanInput = trim(input, OPERATORS_STRING)
  const total = length === 0 ? 0 : calculate(cleanInput)

  let transformedInput = input === '.' ? '0.' : input
  // remove the first operator from the beginning
  if (OPERATORS.includes(input[0])) {
    transformedInput = transformedInput.slice(1)
  } else {
    // '000000' => '0'
    // '0123' => '123'
    if (transformedInput.startsWith('0')) {
      transformedInput = transformedInput.slice(1)
      // "1+2+3++" => "1+2+3+"
      // "1+2+3+*" => "1+2+3*"
      // "1+2+3**" => "1+2+3*"
      // "1+2+3*+" => "1+2+3+" ... and so on
    } else {
      transformedInput = transformedInput.replaceAll(
        /(\++){2,}|(\*{2,})|(\*\+)|(\+\*)/g,
        match => {
          switch (match) {
            case '++':
            case '**':
              return match[0]
            case '+*':
            case '*+':
              return match.at(-1)
            default:
              return match
          }
        },
      )
    }
  }
  return {
    input,
    total,
    transformedInput,
  }
}
