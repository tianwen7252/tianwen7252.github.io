import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useContext,
  useState,
} from 'react'
import { Space, Divider, Tag, Flex } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import SwipeListener from 'swipe-listener'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'
import { isNil } from 'lodash-es'

import { toCurrency, DATE_FORMAT_TIME } from 'src/libs/common'
import { AppContext } from 'src/pages/App/context'
import * as styles from './styles'

const emptyFn = () => {}

export const Order: React.FC<Resta.Order.Props> = memo(props => {
  const { record, number, editable = true, callOrderAPI = emptyFn } = props
  const [showAction, setShowAction] = useState(false)
  const [isEditing, setEditState] = useState(false)
  const { API, appEvent, isTablet } = useContext(AppContext)
  const ref = useRef<HTMLDivElement>()
  const { data, total, originalTotal, memo, editedMemo, createdAt, updatedAt } =
    record
  const createdDate = dayjs.tz(createdAt)
  const updatedDate = updatedAt && dayjs.tz(updatedAt)
  // === APIs ===
  const orderTypes = useLiveQuery(
    async () => await API.orderTypes.get(),
    [],
    [] as RestaDB.Table.OrderType[],
  )
  const bgColor = useMemo(() => {
    let bgColor = ''
    if (Array.isArray(memo)) {
      memo.some(tag => {
        const typeData = orderTypes.find(type => type.name === tag)
        if (typeData) {
          bgColor = typeData.color
        }
        return typeData
      })
    }
    return bgColor
  }, [memo, orderTypes])

  const toggleActionUI = useCallback(() => {
    setShowAction(toShow => !toShow)
  }, [])
  const onSwipe = useCallback(
    (event: IObject) => {
      if (editable) {
        const { directions } = event.detail
        if (directions.left) {
          setShowAction(true)
        } else if (directions.right) {
          setShowAction(false)
        }
      }
    },
    [editable],
  )
  const onClickAction = useCallback(
    (action: Resta.Order.ActionType) => {
      action === 'edit' && setEditState(true)
      appEvent.fire(appEvent.KEYBOARD_ON_ACTION, {
        record,
        action,
        callOrderAPI,
      })
    },
    [record, callOrderAPI, appEvent],
  )
  const cancelEdit = useCallback(() => {
    appEvent.fire(appEvent.KEYBOARD_ON_CANCEL_EDIT)
    setEditState(false)
  }, [appEvent])

  useEffect(() => {
    const container = ref.current
    const listener = SwipeListener(container)
    container.addEventListener('swipe', onSwipe)
    const eventOff = appEvent.on(appEvent.ORDER_AFTER_ACTION, () => {
      setEditState(false)
      setShowAction(false)
    })
    return () => {
      container.removeEventListener('swipe', onSwipe)
      listener.off()
      eventOff()
    }
  }, [appEvent, onSwipe])

  return (
    <div
      css={[styles.orderCss, showAction && styles.onEditCss]}
      className="resta-order-card"
      ref={ref}
    >
      <Flex css={styles.frameCss}>
        <div css={[styles.mainCss, styles.BG_COLOR_MAP[bgColor]]}>
          <Flex css={styles.cardCss} vertical>
            <Flex css={styles.headerCss}>
              <div css={styles.numberCss}>{number}</div>
              {!isTablet && (
                <span css={styles.actionBtnCss} onClick={toggleActionUI}>
                  {showAction ? (
                    <ArrowRightOutlined />
                  ) : (
                    <MoreOutlined css={styles.actionMoreBtnCss} />
                  )}
                </span>
              )}
            </Flex>
            <div css={styles.contentCss}>
              {data.map((item, index) => {
                const { value, operator, res } = item
                let content
                if (operator) {
                  content = (
                    <span>
                      <span css={styles.operatorCss}>{operator}</span>
                      {value}
                    </span>
                  )
                } else {
                  content = res ? (
                    <span>
                      {value} ({res})
                    </span>
                  ) : (
                    value
                  )
                }
                return <Space key={`${index}-${value}`}>{content}</Space>
              })}
              {memo?.length > 0 && (
                <>
                  <Divider />
                  <Space wrap>
                    {memo.map(name => (
                      <Tag key={name}>{name}</Tag>
                    ))}
                  </Space>
                </>
              )}
              <Divider />
            </div>
            <div css={styles.footerCss}>
              <div css={styles.totalCss}>金額 {toCurrency(total)}</div>
              {!isNil(originalTotal) && (
                <div css={styles.editedTotalCss}>
                  {' '}
                  (原金額: {toCurrency(originalTotal)})
                </div>
              )}
              {editedMemo && <Space css={styles.dateCss}>{editedMemo}</Space>}
              <Space css={styles.dateCss}>訂單編號: {record.number}</Space>
              <Space css={styles.dateCss}>
                {createdDate.format(DATE_FORMAT_TIME)}
                <span>({createdDate.fromNow()})</span>
              </Space>
              {updatedDate && (
                <Space css={[styles.dateCss, styles.dateUpdatedCss]}>
                  更新於: {updatedDate.format(DATE_FORMAT_TIME)}
                  <span>({updatedDate.fromNow()})</span>
                </Space>
              )}
            </div>
          </Flex>
        </div>
        {editable && (
          <Flex css={styles.actionCss}>
            {isEditing ? (
              <div css={styles.actionEditCss} onClick={cancelEdit}>
                <ReloadOutlined />
              </div>
            ) : (
              <div
                css={styles.actionEditCss}
                onClick={onClickAction.bind(null, 'edit')}
              >
                <EditOutlined />
              </div>
            )}
            <div
              css={styles.actionDeleteCss}
              onClick={onClickAction.bind(null, 'delete')}
            >
              <DeleteOutlined />
            </div>
          </Flex>
        )}
      </Flex>
    </div>
  )
})

export default Order
