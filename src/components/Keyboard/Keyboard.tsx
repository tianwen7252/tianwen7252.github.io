import React, {
  memo,
  useCallback,
  useMemo,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react'
import {
  Flex,
  Button,
  Tabs,
  Dropdown,
  Space,
  Tag,
  Segmented,
  Divider,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  SwapLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
  CalculatorOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'

import { CONFIG } from 'src/constants/defaults/config'
import { NUMBER_BUTTONS } from 'src/constants/defaults/numberButtons'
import { COMMODITIES } from 'src/constants/defaults/commondities'
import { MEMOS } from 'src/constants/defaults/memos'
import { AppContext } from 'src/components/App/context'
import { toCurrency, getCorrectAmount } from 'src/libs/common'
import { useNumberInput } from './hooks'
import * as styles from './styles'

const ICON_MAP = {
  SwapLeftOutlined: <SwapLeftOutlined />,
  PlusOutlined: <PlusOutlined />,
  DeleteOutlined: <DeleteOutlined />,
  CloseOutlined: <CloseOutlined />,
}

export const COMMON_BILLS = [1000, 500, 100]
export function getChange(total: number) {
  const totalStr = total.toString()
  const { length } = totalStr
  const firstNumber = +totalStr[0]
  const result: [number, number, number][] = [] // bill unit, money, change
  if (length <= 4 && length > 1) {
    COMMON_BILLS.forEach((bill, index) => {
      if (bill > total) {
        result.push([bill, bill, bill - total])
      } else if (total > bill) {
        const money = bill * (firstNumber + 1)
        if (money > total && (money < COMMON_BILLS[index - 1] || index === 0)) {
          result.push([bill, money, money - total])
        }
      }
    })
    return result
  }
  return null
}

export const Keyboard: React.FC<Resta.Keyboard.Props> = memo(props => {
  const { appEvent, isTablet } = useContext(AppContext)
  const { data, total, priceMap, input, updateItemRes, update, clear } =
    useNumberInput()
  const {
    editMode = false,
    record,
    lastRecordNumber,
    drawerMode = false,
    callOrderAPI,
    submitCallback,
  } = props
  const [mode, setMode] = useState(props.mode || 'both')
  const [selectedMemos, setSelectedMemos] = useState<string[]>([])
  const [submitBtnText, setSubmitBtnText] = useState(
    CONFIG.KEYBOARD_SUBMIT_BTN_TEXT,
  )
  const [isEditMode, setEditMode] = useState(editMode)
  const recordRef = useRef<RestaDB.OrderRecord>(record)
  const soups = useMemo(() => {
    let count = 0
    data.forEach(({ res, type, amount = '' }) => {
      if (type === CONFIG.MAIN_DISH_TYPE || res === '湯') {
        count += getCorrectAmount(amount)
      }
    })
    return count
  }, [data])
  const noNeedSoups = useMemo(() => {
    return selectedMemos.includes('不要湯')
  }, [selectedMemos])
  const isFree = useMemo(() => {
    return selectedMemos.includes('免費')
  }, [selectedMemos])
  const handleInput = useCallback(
    (meta: string) => {
      const [key, res] = meta.split('|')
      return input(key, res).data
    },
    [input],
  )
  const onChangeorderPageMode = useCallback(
    (value: Resta.Keyboard.Mode) => {
      setMode(value)
    },
    [setMode],
  )
  const onButtonClick = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      const { meta = '' } = event.currentTarget.dataset
      handleInput(meta)
    },
    [handleInput],
  )
  const onMenuClick: MenuProps['onClick'] = useCallback(
    event => {
      const { key } = event
      if (isTablet) {
        updateItemRes(key)
      } else {
        handleInput(key)
      }
    },
    [isTablet, handleInput, updateItemRes],
  )
  const onChangeType = useCallback(
    (
      item: Resta.Keyboard.InputItem,
      remove = false,
      event: React.KeyboardEvent,
    ) => {
      const { key } = event
      updateItemRes(key, item, remove)
    },
    [updateItemRes],
  )
  const onHandleMemo = useCallback(
    (name: string, checked: boolean) => {
      const index = selectedMemos.indexOf(name)

      if (checked) {
        index === -1 && selectedMemos.push(name)
      } else {
        selectedMemos.splice(index, 1)
      }
      setSelectedMemos([...selectedMemos])
    },
    [selectedMemos],
  )
  const reset = useCallback(() => {
    handleInput('Escape')
    setSelectedMemos([])
    if (!drawerMode) {
      setSubmitBtnText(CONFIG.KEYBOARD_SUBMIT_BTN_TEXT)
      setEditMode(false)
      appEvent.fire(appEvent.ORDER_AFTER_ACTION)
    }
    recordRef.current = null
    clear()
  }, [drawerMode, appEvent, handleInput, clear])
  const onSubmit = useCallback(async () => {
    if (total > 0 || isFree) {
      let type = 'add' as Resta.Order.ActionType
      const newRecord = {
        data,
        number: lastRecordNumber + 1,
        total: isFree ? 0 : total,
        soups,
        memo:
          !soups || noNeedSoups
            ? selectedMemos
            : [...selectedMemos, `${soups}杯湯`],
      }
      if (isEditMode) {
        const record = recordRef.current
        delete newRecord.number
        type = 'edit'
        if (record) {
          callOrderAPI(
            {
              ...record,
              ...newRecord,
            },
            type,
          )
        }
      } else {
        await callOrderAPI(newRecord, type)
      }
      submitCallback?.(type)
      reset()
    }
  }, [
    data,
    lastRecordNumber,
    total,
    soups,
    isFree,
    isEditMode,
    noNeedSoups,
    selectedMemos,
    callOrderAPI,
    submitCallback,
    reset,
  ])

  useEffect(() => {
    const off = appEvent.on(
      appEvent.KEYBOARD_ON_ACTION,
      (
        event: Resta.AppEventObject<Resta.AppEvent.KEYBOARD_ON_ACTION.Detail>,
      ) => {
        const { record, action } = event.detail
        switch (action) {
          case 'edit': {
            const { data, total, memo, number } = record
            recordRef.current = record
            update(data, total)
            setSelectedMemos(memo.filter(text => !text.includes('杯湯')))
            setSubmitBtnText(`編輯訂單 - 編號[${number}]`)
            setEditMode(true)
            break
          }
          case 'delete': {
            callOrderAPI(record, 'delete')
            break
          }
        }
      },
    )
    const off2 = appEvent.on(appEvent.KEYBOARD_ON_CANCEL_EDIT, reset)
    return () => {
      off()
      off2()
    }
  }, [appEvent, update, callOrderAPI, reset])

  const numberButtons = useMemo(() => {
    return NUMBER_BUTTONS.map((buttons, index) => (
      <Flex key={index} gap="middle">
        {buttons.map((config, key) => {
          const { label, meta, icon } = config
          return (
            <Button
              key={key}
              shape="circle"
              size="large"
              data-meta={meta}
              icon={ICON_MAP[icon]}
              onClick={onButtonClick}
            >
              {label}
            </Button>
          )
        })}
      </Flex>
    ))
  }, [onButtonClick])

  const commondities = useMemo(() => {
    return COMMODITIES.map(tab => {
      const { type, label, items, color } = tab
      const buttons = items.map((each: Resta.Commodity.Item, index) => {
        const { name, price, menu, visible, showRelevancy, hideOnMode } = each
        if (visible === false || hideOnMode === mode) return null
        const meta =
          showRelevancy && menu
            ? `+${price}|${menu[0].name}`
            : `+${price}|${name}`
        const btnElement = (
          <Button
            key={`${index}-${meta}`}
            shape="circle"
            size="large"
            data-meta={meta}
            css={styles.BTN_COLOR_MAP[color]}
            onClick={onButtonClick}
          >
            {name}
          </Button>
        )
        if (menu) {
          return (
            <Dropdown
              overlayClassName={styles.btnDropdownCssName}
              arrow={{ pointAtCenter: true }}
              placement="bottom"
              key={meta}
              menu={{
                onClick: onMenuClick,
                items: menu.map(({ name, price, textIcon }) => {
                  const key = `+${price}|${name}`
                  return {
                    key,
                    label: textIcon ? (
                      <Space>
                        {textIcon}
                        {name}
                      </Space>
                    ) : (
                      name
                    ),
                  }
                }),
              }}
            >
              {btnElement}
            </Dropdown>
          )
        } else {
          return btnElement
        }
      })

      return {
        label,
        key: type,
        children: (
          <Flex css={styles.tabPanelCss} gap="middle" vertical wrap>
            {buttons}
          </Flex>
        ),
      }
    })
  }, [mode, onButtonClick, onMenuClick])

  const meals = useMemo(
    () =>
      data.map((item, index) => {
        const { value, operator, res } = item
        let content
        if (operator) {
          content = (
            <span>
              {operator}
              {value}
            </span>
          )
        } else {
          content = res ? (
            <span>
              {value}(
              <Dropdown
                key={`${index}-${value}`}
                overlayClassName={styles.btnDropdownCssName}
                arrow={{ pointAtCenter: true }}
                placement="bottom"
                menu={{
                  items: priceMap[value]?.map?.(({ name }) => ({
                    key: `+${value}|${name}`,
                    label: name,
                  })),
                  onClick: onChangeType.bind(null, item, false),
                }}
              >
                <Tag
                  bordered={false}
                  color="#222"
                  closeIcon
                  onClose={onChangeType.bind(null, item, true)}
                >
                  {res}
                </Tag>
              </Dropdown>
              )
            </span>
          ) : (
            value
          )
        }
        // using random key to avoid the bug of rendering of same index cache
        return <Space key={`${index}-${value}-${Date.now()}`}>{content}</Space>
      }),
    [data, priceMap, onChangeType],
  )

  const changeDesc =
    !isFree &&
    total !== 0 &&
    getChange(total)?.map(([unit, money, change]) => (
      <span
        css={styles.changeCss}
        key={unit}
        className={`resta-keyboard-change-${unit}`}
      >
        ${money} 找 ${change}
      </span>
    ))

  return (
    <div css={[styles.keyboardCss, drawerMode && styles.drawerModeCss]}>
      <Flex
        css={[
          styles.keyboardLeftCss,
          mode === 'commondity' && styles.modeCommondityCss,
        ]}
        className="resta-keyboard-left"
        vertical
      >
        <Flex
          css={styles.textAreaCss}
          className="resta-keyboard-textArea"
          vertical
        >
          <div css={styles.mealsCss}>{meals}</div>
          <div css={styles.totalCss}>
            <Space size="large">
              <span>
                {total ? `= ${toCurrency(isFree ? 0 : total)}` : total}
              </span>
              <span css={styles.soupsCss}>
                {soups > 0 && !noNeedSoups && `(${soups}杯湯)`}
              </span>
              {changeDesc && (
                <span css={styles.changePanelCss}>{changeDesc}</span>
              )}
            </Space>
          </div>
        </Flex>
        <Flex css={styles.btnAreaCss} gap="middle" vertical>
          <Space size="middle">
            <Segmented
              css={styles.orderPageModeCss}
              options={[
                { value: 'both', icon: <AppstoreAddOutlined /> },
                { value: 'commondity', icon: <AppstoreOutlined /> },
                { value: 'calculator', icon: <CalculatorOutlined /> },
              ]}
              onChange={onChangeorderPageMode}
            />
            <Button
              danger
              type="primary"
              size="large"
              css={styles.deleteBtnCss}
              icon={<DeleteOutlined />}
              onClick={reset}
            >
              清除
            </Button>
          </Space>
          <Flex css={styles.btnCss} gap="middle">
            {mode !== 'commondity' && (
              <div css={styles.numberBtnsCss}>{numberButtons}</div>
            )}
            {mode !== 'calculator' && (
              <Tabs
                css={styles.tabCss}
                tabPosition={mode === 'commondity' ? 'left' : 'top'}
                defaultActiveKey={COMMODITIES[0].type}
                items={commondities}
              />
            )}
          </Flex>
        </Flex>
        <Divider />
        <Flex css={styles.memoCss} gap="small" wrap align="center">
          <span css={styles.memoTextCss}>備註</span>
          {MEMOS.map(({ name, color }) => (
            <Tag.CheckableTag
              css={styles.MEMO_COLOR_MAP[color]}
              key={name}
              checked={selectedMemos.includes(name)}
              onChange={checked => onHandleMemo(name, checked)}
            >
              {name}
            </Tag.CheckableTag>
          ))}
        </Flex>
        <Divider />
        <Flex vertical>
          <Button
            css={[styles.submitBtnCss, isEditMode && styles.updateBtnCss]}
            size="large"
            type="primary"
            disabled={drawerMode && data?.length === 0}
            onClick={onSubmit}
          >
            {submitBtnText}
          </Button>
        </Flex>
      </Flex>
    </div>
  )
})

export default Keyboard
