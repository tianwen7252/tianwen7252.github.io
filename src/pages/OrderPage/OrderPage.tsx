import React, { useCallback, useContext, memo } from 'react'
import { Drawer } from 'antd'
import dayjs from 'dayjs'

import Keyboard from 'src/components/Keyboard'
import { useOrderList } from 'src/pages/OrderList/hooks'
import { AppContext } from 'src/pages/App/context'
import * as styles from './styles'

export const OrderPage: React.FC = memo(() => {
  const { DATE_FORMAT } = useContext(AppContext)

  const {
    orderListElement,
    summaryElement,
    lastRecordNumber,
    contentRef,
    callOrderAPI,
  } = useOrderList({
    datetime: 'today',
    orderPageMode: true,
    emptyDescription: (
      <>
        <p>還沒營業? 今天沒人來? 還是老闆不爽做?</p>
        <p>加油好嗎</p>
      </>
    ),
  })

  const submitCallback = useCallback(
    (type: Resta.Order.ActionType) => {
      // scroll the drawer content to top
      type === 'add' && contentRef.current?.parentElement?.scroll?.(0, 0)
    },
    [contentRef],
  )

  return (
    <div css={styles.orderPageCss}>
      <Keyboard
        lastRecordNumber={lastRecordNumber}
        callOrderAPI={callOrderAPI}
        submitCallback={submitCallback}
      />
      <Drawer
        css={styles.drawerCss}
        title={<span>訂單記錄 - {dayjs.tz().format(DATE_FORMAT)}</span>}
        getContainer={false}
        placement="right"
        open={true}
        mask={false}
        closeIcon={null}
        footer={summaryElement}
      >
        {orderListElement}
      </Drawer>
    </div>
  )
})

export default OrderPage
