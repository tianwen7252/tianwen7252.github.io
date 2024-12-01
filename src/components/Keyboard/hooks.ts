import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

import { process, calculate } from 'src/libs/arithmetic'
import { getCommoditiesInfo } from 'src/libs/common'

export function converData(data: Resta.Keyboard.Data) {
  let text = ''
  data.forEach(({ value, operator = '' }) => {
    text += operator + value
  })
  return {
    text,
    total: calculate(text) || 0,
  }
}

export function useNumberInput(commData?: Resta.Products.commonditiesMap) {
  const { priceMap, commodityMap } = useMemo(
    () => getCommoditiesInfo(commData),
    [commData],
  )
  const displayedText = useRef('')
  const readyToMultiply = useRef(false)
  const [text, setText] = useState('')
  const [data, setData] = useState<Resta.Keyboard.Data>([])
  const [total, setTotal] = useState(0)
  const dataRef = useRef(data)
  displayedText.current = text
  dataRef.current = data

  const handleOperator = useCallback(
    (key: Resta.Keyboard.InputItem['operator']) => {
      const data = dataRef.current
      const last = data.at(-1)
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
  const updateRes = useCallback(
    (item: Resta.Keyboard.InputItem, res: string) => {
      const info = commodityMap[res]
      if (info) {
        const [, type] = info
        item.res = res
        item.type = type
      } else {
        item.res = ''
        item.type = ''
      }
      return item
    },
    [commodityMap],
  )
  const updateItemRes = useCallback(
    (meta: string, target?: Resta.Keyboard.InputItem, remove = false) => {
      const data = dataRef.current
      if (remove && target) {
        const index = data.indexOf(target)
        if (index !== -1) {
          const start = index - 1
          data.splice(start > 0 ? start : 0, target.amount ? 3 : 2)
          // update text and total => data to text and total
          const { text, total } = converData(data)
          setText(text)
          setTotal(total)
        }
      } else {
        target = target ?? data.at(-1)
        if (target) {
          const [, res] = meta.split('|')
          updateRes(target, res)
        }
      }
      setData([...data])
    },
    [updateRes],
  )
  const input = useCallback(
    (key: string, res?: string) => {
      let data = dataRef.current
      let lastData = data.at(-1)
      let newData: typeof data
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
          if (
            key === '.' &&
            (displayedText.current === '' || lastData.value === '')
          ) {
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
            const target = data.at(-2)
            target && (target.amount = lastData.value)
          }
          newData = [...data]
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
                const target = data.at(-2)
                target.amount = lastData.value
                // if non-operators
              } else if (lastData.value === '') {
                data.pop()
              }
            }
          }
          newData = [...data]
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
            const newItem = {
              value: key.slice(1),
              res,
            }
            data.push(updateRes(newItem, res))
            newData = [...data]
            break
          }
        }
      }
      // guess the data res
      if (!lastData?.operator && lastData?.value) {
        const reference = priceMap[lastData.value]?.[0]?.name
        const [currentResPrice] = commodityMap?.[lastData.res] ?? []
        if (+lastData.value !== currentResPrice) {
          const newRes = reference ?? ''
          if (lastData.res !== newRes) {
            updateRes(lastData, newRes)
            newData = [...data]
          }
        }
      }
      if (newData) {
        dataRef.current = data = newData
        setData(newData)
      }
      return { data }
    },
    [handleOperator, updateRes, priceMap, commodityMap],
  )
  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      input(event.key)
    },
    [input],
  )
  const clear = useCallback(() => {
    input('Escape')
  }, [input])
  const update = useCallback((data: Resta.Keyboard.Data, total: number) => {
    const { text } = converData(data)
    setText(text)
    setTotal(total)
    setData(data)
  }, [])

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [onKeyUp])

  return { data, text, total, priceMap, input, updateItemRes, update, clear }
}
