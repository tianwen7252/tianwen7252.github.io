import { useState, useCallback, useEffect, useRef } from 'react'

import { process } from 'src/libs/arithmetic'

export function useNumberInput() {
  const displayedText = useRef('')
  const readyToMultiply = useRef(false)
  const [text, setText] = useState('')
  const [data, setData] = useState<Resta.Keyboard.Input['data']>([])
  const [total, setTotal] = useState(0)
  const dataRef = useRef(data)
  displayedText.current = text
  dataRef.current = data

  const handleOperator = useCallback(
    (key: Resta.Keyboard.InputItem['operator']) => {
      const data = dataRef.current
      const { length } = data
      const last = data[length - 1]
      if (!last) {
        return data
      }
      if (!last.operator || (last.operator && last.value)) {
        data.push({
          value: '',
          operator: key,
        })
      } else {
        last.operator = key
      }
      readyToMultiply.current = key === '*'
      return data
    },
    [],
  )

  const updateItemType = useCallback((meta: string) => {
    const data = dataRef.current
    const last = data[data.length - 1]
    if (last) {
      const [, type] = meta.split('|')
      last.type = type
    }
    setData([...data])
  }, [])

  const input = useCallback(
    (key: string, type?: string) => {
      const data = dataRef.current
      let lastData = data[data.length - 1]
      switch (key) {
        case '+':
        case '*': {
          const { transformedInput } = process(displayedText.current + key)
          setText(transformedInput)
          setData([...handleOperator(key)])
          break
        }
        case '.':
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          if (key === '.' && displayedText.current === '') {
            key = '0.'
          }
          const { total, transformedInput } = process(
            displayedText.current + key,
          )
          setText(transformedInput)
          setTotal(total)
          // NOTE: the callback inside setData(prevData => {... }) will be called twice
          // due to React's behaviour https://stackoverflow.com/a/66494744
          if (data.length === 0 || lastData?.operator === '+') {
            lastData = {
              value: '',
            }
            data.push(lastData)
          }
          lastData.value += key
          if (readyToMultiply.current) {
            const target = data[data.length - 2]
            target && (target.amount = lastData.value)
          }
          setData([...data])
          break
        }
        case 'Backspace': {
          const { total, transformedInput } = process(
            displayedText.current.slice(0, -1),
          )
          setText(transformedInput)
          setTotal(total)
          if (lastData) {
            // if number
            if (lastData.value === '') {
              data.pop()
            } else {
              lastData.value = lastData.value.slice(0, -1)
              if (lastData.operator === '*') {
                const target = data[data.length - 2]
                target.amount = lastData.value
                // if non-operators
              } else if (lastData.value === '') {
                data.pop()
              }
            }
          }
          setData([...data])
          break
        }
        case 'Escape': {
          setText('')
          setTotal(0)
          setData([])
          dataRef.current = []
          readyToMultiply.current = false
          break
        }
        // custom
        default: {
          if (key.startsWith('+')) {
            const { total, transformedInput } = process(
              displayedText.current + key,
            )
            setText(transformedInput)
            setTotal(total)
            const data = handleOperator('+')
            data.push({
              value: key.slice(1),
              type,
            })
            setData([...data])
            break
          }
        }
      }
      console.log('data', dataRef.current)

      return { data }
    },
    [handleOperator],
  )

  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      input(event.key)
    },
    [input],
  )

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp, false)
    return () => {
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [onKeyUp])

  return { data, text, total, input, updateItemType }
}
