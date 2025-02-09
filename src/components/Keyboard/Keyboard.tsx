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
  Modal,
  Input,
  InputNumber,
  Form,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  SwapLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
  CalculatorOutlined,
  AppstoreOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useLiveQuery } from 'dexie-react-hooks'
import { isNil, pull } from 'lodash-es'

import { CONFIG } from 'src/constants/defaults/config'
import { NUMBER_BUTTONS } from 'src/constants/defaults/numberButtons'
import { AppContext } from 'src/pages/App/context'
import { toCurrency, toCurrencyNumber, getCorrectAmount } from 'src/libs/common'
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
  const { API, appEvent, isTablet } = useContext(AppContext)
  // === APIs ===
  const commTypesData = useLiveQuery(
    async () => {
      const data = await API.commondityTypes.get()
      return data.map(type => ({ key: type.id, ...type }))
    },
    [],
    [] as RestaDB.Table.CommondityType[],
  )
  const commData = useLiveQuery(
    async () => {
      const data = await API.commondity.getMapData()
      return data
    },
    [],
    {} as Resta.Products.commonditiesMap,
  )
  const orderTypesData = useLiveQuery(
    async () => {
      const data = await API.orderTypes.get()
      return data
    },
    [],
    [] as RestaDB.Table.OrderType[],
  )
  const { data, total, priceMap, input, updateItemRes, update, clear } =
    useNumberInput(commData)

  const {
    editMode = false,
    record,
    drawerMode = false,
    callOrderAPI,
    submitCallback,
  } = props
  const [mode, setMode] = useState(props.mode || 'both')
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([])
  const [submitBtnText, setSubmitBtnText] = useState(
    CONFIG.KEYBOARD_SUBMIT_BTN_TEXT,
  )
  const [isEditMode, setEditMode] = useState(editMode)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editedTotal, setEditedTotal] = useState<number>(null)
  const [editedTotalMemo, setEditedTotalMemo] = useState('')
  const [hasEditedTotal, setHasEditedTotal] = useState(false)

  const recordRef = useRef<RestaDB.OrderRecord>(record)
  const soups = useMemo(() => {
    let count = 0
    data.forEach(({ res, type, amount = '' }) => {
      const noNeedSoup = CONFIG.NO_NEED_SOUP_KEYWORDS.some(keyword =>
        res?.includes(keyword),
      )
      if (!noNeedSoup && (type === CONFIG.MAIN_DISH_TYPE || res === '湯')) {
        count += getCorrectAmount(amount)
      }
    })
    return count
  }, [data])
  const noNeedSoups = useMemo(() => {
    return selectedOrderTypes.includes('不要湯')
  }, [selectedOrderTypes])

  // === callbacks ===
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
  const onChangeOrderTypes = useCallback(
    (name: string, checked: boolean) => {
      const index = selectedOrderTypes.indexOf(name)
      if (checked) {
        index === -1 && selectedOrderTypes.push(name)
      } else {
        selectedOrderTypes.splice(index, 1)
      }
      setSelectedOrderTypes([...selectedOrderTypes])
    },
    [selectedOrderTypes],
  )
  const onEditTotal = useCallback(() => {
    setIsModalOpen(true)
  }, [])
  const onChangeTotal = useCallback(() => {
    if (editedTotal === null || editedTotal === total) {
      setEditedTotal(null)
      setHasEditedTotal(false)
    } else {
      if (!selectedOrderTypes.includes('優惠價')) {
        setSelectedOrderTypes([...selectedOrderTypes, '優惠價'])
      }
      setHasEditedTotal(true)
    }
    setIsModalOpen(false)
  }, [editedTotal, total, selectedOrderTypes])
  const onCancelTotal = useCallback(() => {
    setHasEditedTotal(false)
    setEditedTotal(null)
    setEditedTotalMemo('')
    if (selectedOrderTypes.includes('優惠價')) {
      setSelectedOrderTypes([...pull(selectedOrderTypes, '優惠價')])
    }
    setIsModalOpen(false)
  }, [selectedOrderTypes])
  const reset = useCallback(() => {
    onCancelTotal()
    setSelectedOrderTypes([])
    if (!drawerMode) {
      setSubmitBtnText(CONFIG.KEYBOARD_SUBMIT_BTN_TEXT)
      setEditMode(false)
      appEvent.fire(appEvent.ORDER_AFTER_ACTION)
    }
    recordRef.current = null
    clear()
  }, [drawerMode, appEvent, clear, onCancelTotal])
  const onSubmit = useCallback(async () => {
    const newTotal = hasEditedTotal ? editedTotal : total
    if (newTotal > 0) {
      let type = 'add' as Resta.Order.ActionType
      const newRecord = {
        data,
        total: newTotal,
        originalTotal: hasEditedTotal ? total : undefined,
        editedMemo: editedTotalMemo,
        soups,
        memo:
          !soups || noNeedSoups
            ? selectedOrderTypes
            : [...selectedOrderTypes, `${soups}杯湯`],
      }
      if (isEditMode) {
        const record = recordRef.current
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
    total,
    soups,
    isEditMode,
    noNeedSoups,
    selectedOrderTypes,
    hasEditedTotal,
    editedTotal,
    editedTotalMemo,
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
            const { data, memo, number, editedMemo } = record
            let { total, originalTotal } = record
            recordRef.current = record
            if (!isNil(originalTotal)) {
              setEditedTotal(total)
              setEditedTotalMemo(editedMemo)
              setHasEditedTotal(true)
              total = originalTotal
            }
            update(data, total)
            setSelectedOrderTypes(memo.filter(text => !text.includes('杯湯')))
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
    return commTypesData.map(typeData => {
      const { type, label, typeID, color } = typeData
      const items = commData[typeID] ?? []
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
  }, [mode, commTypesData, commData, onButtonClick, onMenuClick])

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

  useEffect(() => {
    const mealsArea = document.getElementById('resta-keyboard-meals')
    mealsArea.scrollTop = mealsArea.scrollHeight
  }, [meals])

  const [mealTypeEls, orderTypeEls] = useMemo(() => {
    const meals: JSX.Element[] = []
    const orders: JSX.Element[] = []
    orderTypesData.forEach(item => {
      const { name, color, type } = item
      const element = (
        <Tag.CheckableTag
          css={styles.ORDER_TYPES_COLOR_MAP[color]}
          key={name}
          checked={selectedOrderTypes.includes(name)}
          onChange={checked => onChangeOrderTypes(name, checked)}
        >
          {name}
        </Tag.CheckableTag>
      )
      if (type === 'meal') {
        meals.push(element)
      } else {
        orders.push(element)
      }
    })
    return [meals, orders]
  }, [orderTypesData, selectedOrderTypes, onChangeOrderTypes])

  const changeDesc = useMemo(() => {
    const newTotal = hasEditedTotal ? editedTotal : total
    return (
      newTotal !== 0 &&
      getChange(newTotal)?.map(([unit, money, change]) => (
        <span
          css={styles.changeCss}
          key={unit}
          className={`resta-keyboard-change-${unit}`}
        >
          ${money} 找 ${change}
        </span>
      ))
    )
  }, [hasEditedTotal, total, editedTotal])

  const soupsAndChange = useMemo(() => {
    return (
      <>
        <span css={styles.soupsCss}>
          {soups > 0 && !noNeedSoups && `(${soups}杯湯)`}
        </span>
        {changeDesc && <span css={styles.changePanelCss}>{changeDesc}</span>}
      </>
    )
  }, [soups, noNeedSoups, changeDesc])

  return (
    <div
      css={[
        styles.keyboardCss,
        drawerMode && styles.drawerModeCss,
        hasEditedTotal && styles.keyboardHasEditedTotal,
      ]}
    >
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
          <div id="resta-keyboard-meals" css={styles.mealsCss}>
            {meals}
          </div>
          <div css={styles.totalCss}>
            <Space size="large">
              <span css={hasEditedTotal && styles.originalTotalCss}>
                {total ? `= ${toCurrency(total)}` : total}
                {total !== 0 && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={onEditTotal}
                  />
                )}
              </span>
              {!hasEditedTotal && soupsAndChange}
            </Space>
          </div>
          {hasEditedTotal && (
            <div css={[styles.totalCss, styles.editedTotalCss]}>
              <Space size="large">
                <span>{`= ${toCurrency(editedTotal)}`}</span>
                {soupsAndChange}
              </Space>
            </div>
          )}
        </Flex>
        <Flex css={styles.btnAreaCss} gap="middle" vertical>
          <Space size="middle">
            <Segmented
              css={styles.orderPageModeCss}
              options={[
                { value: 'both', icon: <CalculatorOutlined /> },
                { value: 'commondity', icon: <AppstoreOutlined /> },
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
          <Flex
            css={styles.btnCss}
            gap="middle"
            className="resta-keyboard-btn-area"
          >
            {mode === 'both' && (
              <div css={styles.numberBtnsCss}>{numberButtons}</div>
            )}
            <Tabs
              css={styles.tabCss}
              tabPosition={mode === 'commondity' ? 'left' : 'top'}
              defaultActiveKey={commTypesData?.[0]?.type}
              items={commondities}
            />
          </Flex>
        </Flex>
        <Divider />
        <Flex css={styles.orderTypesCss} gap="small" wrap align="center">
          <Space
            css={styles.orderTypesBarCss}
            split={<span css={styles.verticalBarCss} />}
          >
            <Space>{mealTypeEls}</Space>
            <Space>{orderTypeEls}</Space>
          </Space>
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
      <Modal
        title="設定訂單總金額"
        open={isModalOpen}
        okText="確定修改"
        cancelText="取消 (還原)"
        closable={false}
        maskClosable={false}
        onOk={onChangeTotal}
        onCancel={onCancelTotal}
      >
        <Flex vertical>
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            css={styles.editTotalFormCss}
          >
            <Form.Item label="目前金額">{toCurrency(total)}</Form.Item>
            <Form.Item label="修改金額">
              <InputNumber<number>
                type="number"
                prefix="$"
                // formatter={toCurrencyNumber}
                // parser={value => Number(value?.replace(/\$\s?|(,*)/g, ''))}
                value={editedTotal === null ? total : editedTotal}
                min={0}
                style={{ minWidth: '60%' }}
                addonAfter={`($${toCurrencyNumber(editedTotal === null ? total : editedTotal)})`}
                onChange={useCallback(value => setEditedTotal(value), [])}
              />
            </Form.Item>
            <Form.Item label="備註">
              <Input
                type="text"
                placeholder="請輸入備註"
                value={editedTotalMemo}
                onChange={useCallback(
                  event => setEditedTotalMemo(event.target.value),
                  [],
                )}
              />
            </Form.Item>
          </Form>
        </Flex>
      </Modal>
    </div>
  )
})

export default Keyboard
