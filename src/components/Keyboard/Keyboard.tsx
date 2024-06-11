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
  FloatButton,
  Statistic,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  SwapLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
  OrderedListOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { Order } from 'src/components/Order'
import { NUMBER_BUTTONS } from 'src/constants/defaults/buttons'
import { COMMODITIES } from 'src/constants/defaults/commondities'
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

export const Keyboard: React.FC<{}> = () => {
  const { data, total, priceMap, input, updateItemType, clear } =
    useNumberInput()
  const [orderRecord, setOrderRecord] = useState<Resta.OrderList>([])
  const [openOrder, setOpenOrder] = useState(false)
  const { isTablet } = useContext(AppContext)
  const drawerContentRef = useRef<HTMLDivElement>()
  const handleInput = useCallback(
    (meta: string) => {
      const [key, type] = meta.split('|')
      return input(key, type).data
    },
    [input],
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
        updateItemType(key)
      } else {
        handleInput(key)
      }
    },
    [isTablet, handleInput, updateItemType],
  )
  const onChangeType = useCallback(
    (item: Resta.Keyboard.InputItem, event: React.KeyboardEvent) => {
      const { key } = event
      updateItemType(key, item)
    },
    [updateItemType],
  )
  const onOpenOrderList = useCallback(() => {
    setOpenOrder(true)
  }, [setOpenOrder])
  const onCloseOrderList = useCallback(() => {
    setOpenOrder(false)
  }, [setOpenOrder])
  const onSubmit = useCallback(() => {
    setOrderRecord([
      {
        data,
        total,
        timestamp: dayjs().valueOf(),
      },
      ...orderRecord,
    ])
    onOpenOrderList()
    clear()
  }, [data, total, orderRecord, setOrderRecord, onOpenOrderList, clear])

  const numberButtons = useMemo(() => {
    return NUMBER_BUTTONS.map((buttons, index) => (
      <Flex key={index} gap="large">
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
      const buttons = items.map((each, index) => {
        const { name, price, menu, visible, showRelevancy } = each
        if (visible === false) return null
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
            css={styles.COLOR_MAP[color]}
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
          <Flex css={styles.tabPanelCss} gap="large" vertical wrap>
            {buttons}
          </Flex>
        ),
      }
    })
  }, [onButtonClick, onMenuClick])

  const meals = useMemo(
    () =>
      data.map((item, index) => {
        const { value, operator, type } = item
        let content
        if (operator) {
          content = (
            <span>
              {operator}
              {value}
            </span>
          )
        } else {
          content = type ? (
            <span>
              {value}(
              <Dropdown
                overlayClassName={styles.btnDropdownCssName}
                arrow={{ pointAtCenter: true }}
                placement="bottom"
                menu={{
                  items: priceMap[value].map(({ name }) => ({
                    key: `+${value}|${name}`,
                    label: name,
                  })),
                  onClick: onChangeType.bind(null, item),
                }}
              >
                <Tag bordered={false} color="#222" closeIcon>
                  {type}
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

  let totalCount = 0
  let soldItemsCount = 0
  const orderListElement = orderRecord.map((record, index) => {
    const { data, total, timestamp } = record
    totalCount += total
    soldItemsCount += data.filter(({ type }) => !!type).length
    return (
      <Order
        key={timestamp}
        record={record}
        number={orderRecord.length - index}
      />
    )
  })

  useEffect(() => {
    const target = drawerContentRef.current?.parentNode as HTMLDivElement
    target?.scroll?.(0, 0)
  }, [openOrder])

  console.log('data', data, orderRecord)

  return (
    <div style={{ position: 'relative' }}>
      <Flex css={styles.keyboardCss} vertical>
        <Flex css={styles.textAreaCss} flex="2" vertical>
          <div css={styles.mealsCss}>{meals}</div>
          {total && <div css={styles.totalCss}> = {toCurrency(total)}</div>}
        </Flex>
        <Flex css={styles.btnCss} flex="1" gap="large">
          <div css={styles.numberBtnsCss}>
            <Button
              danger
              type="primary"
              size="large"
              data-meta="Escape"
              css={styles.deleteBtnCss}
              icon={<DeleteOutlined />}
              onClick={onButtonClick}
            />
            {numberButtons}
          </div>
          <Tabs
            css={styles.tabCss}
            defaultActiveKey="main dish"
            items={commondities}
          />
        </Flex>
        <Flex flex="1" vertical>
          <Button css={styles.submitCss} size="large" onClick={onSubmit}>
            送單
          </Button>
        </Flex>
      </Flex>
      <Drawer
        title={`訂單記錄 - ${dayjs().format('YYYY/MM/DD dddd')}`}
        placement="right"
        open={openOrder}
        className={styles.drawerCssName}
        onClose={onCloseOrderList}
        footer={
          <Flex css={styles.drawerSymmaryCss} justify="space-between">
            <Statistic title="訂單數量" value={orderRecord.length} />
            <Statistic title="銷售商品數量" value={soldItemsCount} />
            <Statistic title="營業額" prefix="$" value={totalCount} />
          </Flex>
        }
      >
        <div ref={drawerContentRef}>{orderListElement}</div>
      </Drawer>
      {!openOrder && (
        <FloatButton
          shape="square"
          style={{ right: 24 }}
          icon={<OrderedListOutlined />}
          onClick={onOpenOrderList}
        />
      )}
    </div>
  )
}

export default Keyboard
