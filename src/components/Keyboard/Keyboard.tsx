import React, {
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
  Drawer,
  Segmented,
  Switch,
  Divider,
  Empty,
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
import dayjs from 'dayjs'

import { useOrderList } from 'src/components/OrderList/hooks'
import { CONFIG } from 'src/constants/defaults/config'
import { NUMBER_BUTTONS } from 'src/constants/defaults/numberButtons'
import { COMMODITIES } from 'src/constants/defaults/commondities'
import { MEMOS } from 'src/constants/defaults/memos'
import { AppContext } from 'src/components/App/context'
import { toCurrency } from 'src/libs/common'
import { useNumberInput } from './hooks'
import * as styles from './styles'

const ICON_MAP = {
  SwapLeftOutlined: <SwapLeftOutlined />,
  PlusOutlined: <PlusOutlined />,
  DeleteOutlined: <DeleteOutlined />,
  CloseOutlined: <CloseOutlined />,
}

export const Keyboard: React.FC<{
  mode?: Resta.Keyboard.Mode
}> = props => {
  const { isTablet, DATE_FORMAT } = useContext(AppContext)
  const { data, total, priceMap, input, updateItemRes, update, clear } =
    useNumberInput()
  const [mode, setMode] = useState(props.mode || 'both')
  const [selectedMemos, setSelectedMemos] = useState<string[]>([])
  const [submitBtnText, setSubmitBtnText] = useState(
    CONFIG.KEYBOARD_SUBMIT_BTN_TEXT,
  )
  const [isUpdate, setUpdateMode] = useState(false)
  const recordRef = useRef<RestaDB.OrderRecord>()
  const drawerContentRef = useRef<HTMLDivElement>()
  const soups = useMemo(() => {
    let count = 0
    data.forEach(({ res, type, amount = '' }) => {
      if (type === CONFIG.MAIN_DISH_TYPE || res === '湯') {
        const quailty = amount ? +amount : 1
        count += quailty < 1 && quailty > 0 ? 1 : quailty
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
  const onChangeKeyboardMode = useCallback(
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
  const resetKeyBoard = useCallback(() => {
    handleInput('Escape')
    setSelectedMemos([])
    setSubmitBtnText(CONFIG.KEYBOARD_SUBMIT_BTN_TEXT)
    setUpdateMode(false)
  }, [handleInput])
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
  const onToggleShowList = useCallback(() => {}, [])
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
  const onAction: Resta.Order.Props['onAction'] = useCallback(
    (record, action, handleAction) => {
      switch (action) {
        case 'edit': {
          const { data, total, memo, number } = record
          recordRef.current = record
          update(data, total)
          setSelectedMemos(memo.filter(text => !text.includes('杯湯')))
          setSubmitBtnText(`更新訂單 - 編號[${number}]`)
          setUpdateMode(true)
          break
        }
        case 'delete': {
          handleAction(record, 'delete')
          break
        }
      }
    },
    [update],
  )
  const { orderListElement, summaryElement, lastRecordNumber, handleAction } =
    useOrderList('today', onAction, true)
  const onSubmit = useCallback(() => {
    if (total > 0 || isFree) {
      const newRecord = {
        data,
        number: lastRecordNumber + 1,
        total: isFree ? 0 : total,
        soups,
        memo:
          !soups || noNeedSoups
            ? selectedMemos
            : [...selectedMemos, `${soups}杯湯`],
        timestamp: dayjs().valueOf(),
      }
      if (isUpdate) {
        const record = recordRef.current
        if (record) {
          handleAction(
            {
              ...record,
              ...newRecord,
            },
            'edit',
          )
        }
      } else {
        handleAction(newRecord, 'add')
      }
      setSelectedMemos([])
      setSubmitBtnText(CONFIG.KEYBOARD_SUBMIT_BTN_TEXT)
      setUpdateMode(false)
      clear()
    }
  }, [
    data,
    lastRecordNumber,
    total,
    soups,
    isFree,
    isUpdate,
    noNeedSoups,
    selectedMemos,
    handleAction,
    clear,
  ])

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
        return <Space key={`${index}-${value}`}>{content}</Space>
      }),
    [data, priceMap, onChangeType],
  )

  useEffect(() => {
    // scroll the drawer content to top
    const target = drawerContentRef.current?.parentNode as HTMLDivElement
    target?.scroll?.(0, 0)
  }, [])

  console.log('data', soups, data)

  return (
    <div css={styles.keyboardCss}>
      <Flex
        css={[
          styles.keyboardLeftCss,
          mode === 'commondity' && styles.modeCommondityCss,
        ]}
        vertical
      >
        <Flex css={styles.textAreaCss} flex="2" vertical>
          <div css={styles.mealsCss}>{meals}</div>
          <div css={styles.totalCss}>
            <Space size="large">
              <span>
                {total ? `= ${toCurrency(isFree ? 0 : total)}` : total}
              </span>
              <span css={styles.soupsCss}>
                {soups > 0 && !noNeedSoups && `(${soups}杯湯)`}
              </span>
            </Space>
          </div>
        </Flex>
        <Flex flex="1" gap="middle" vertical>
          <Space size="middle">
            <Segmented
              css={styles.keyBoardModeCss}
              options={[
                { value: 'both', icon: <AppstoreAddOutlined /> },
                { value: 'commondity', icon: <AppstoreOutlined /> },
                { value: 'calculator', icon: <CalculatorOutlined /> },
              ]}
              onChange={onChangeKeyboardMode}
            />
            <Switch
              css={styles.switchCss}
              checkedChildren="自動顯示列表"
              unCheckedChildren="手動顯示列表"
              defaultChecked
              onChange={onToggleShowList}
            />
            <Button
              danger
              type="primary"
              size="large"
              css={styles.deleteBtnCss}
              icon={<DeleteOutlined />}
              onClick={resetKeyBoard}
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
            css={[styles.submitBtnCss, isUpdate && styles.updateBtnCss]}
            size="large"
            type="primary"
            onClick={onSubmit}
          >
            {submitBtnText}
          </Button>
        </Flex>
      </Flex>
      <Drawer
        css={styles.drawerCss}
        title={`訂單記錄 - ${dayjs().format(DATE_FORMAT)}`}
        getContainer={false}
        placement="right"
        open={true}
        mask={false}
        closeIcon={null}
        // onClose={onCloseOrderList}
        footer={summaryElement}
      >
        <div ref={drawerContentRef}>
          {orderListElement || (
            <Empty
              description={
                <>
                  <p>還沒營業? 今天沒人來? 還是老闆不爽做?</p>
                  <p>加油好嗎</p>
                </>
              }
            />
          )}
        </div>
      </Drawer>
    </div>
  )
}

export default Keyboard
