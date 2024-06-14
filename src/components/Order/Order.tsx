import React, {
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
} from '@ant-design/icons'
import SwipeListener from 'swipe-listener'
import dayjs from 'dayjs'

import { toCurrency, DATE_FORMAT_TIME } from 'src/libs/common'
import { AppContext } from 'src/components/App/context'
import {
  MEMOS_NAME_COLOR_MAP,
  HIGHLIGHT_MEMOS,
} from 'src/constants/defaults/memos'
import * as styles from './styles'

export const Order: React.FC<Resta.Order.Props> = props => {
  const { record, number, editable = true, onAction } = props
  const [showAction, setShowAction] = useState(false)
  const { isTablet } = useContext(AppContext)
  const ref = useRef<HTMLDivElement>()
  const { data, total, memo, timestamp } = record
  const bgColor = useMemo(() => {
    let bgColor = ''
    if (Array.isArray(memo)) {
      memo.some(tag => {
        const has = HIGHLIGHT_MEMOS.includes(tag)
        if (has) {
          bgColor = MEMOS_NAME_COLOR_MAP[tag]
        }
        return has
      })
    }
    return bgColor
  }, [memo])

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
      onAction?.(record, action)
    },
    [record, onAction],
  )

  useEffect(() => {
    const container = ref.current
    const listener = SwipeListener(container)
    container.addEventListener('swipe', onSwipe)
    return () => {
      container.removeEventListener('swipe', onSwipe)
      listener.off()
    }
  }, [onSwipe])

  return (
    <div css={[styles.orderCss, showAction && styles.onEditCss]} ref={ref}>
      <Flex css={styles.frameCss}>
        <div css={[styles.mainCss, styles.BG_COLOR_MAP[bgColor]]}>
          <div css={styles.cardCss}>
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
              {memo && (
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
              {total && (
                <div css={styles.totalCss}>金額 {toCurrency(total)}</div>
              )}
              <Space css={styles.dateCss}>
                {dayjs(timestamp).format(DATE_FORMAT_TIME)}
                <span>({dayjs(timestamp).fromNow()})</span>
              </Space>
            </div>
          </div>
        </div>
        {editable && (
          <Flex css={styles.actionCss}>
            <div
              css={styles.actionEditCss}
              onClick={onClickAction.bind(null, 'edit')}
            >
              <EditOutlined />
            </div>
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
}

export default Order
