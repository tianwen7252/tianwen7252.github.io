import React, { memo } from 'react'
import { Space } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

import StickyHeader from 'src/components/StickyHeader'
import ClockIn from 'src/components/Settings/Staff/ClockIn'

import * as styles from './styles'

export const ClockInPage: React.FC = memo(() => {
  return (
    <div css={styles.mainCss}>
      <StickyHeader cls={styles.headerCss}>
        <Space css={styles.titleCss}>
          <ClockCircleOutlined />
          <label>員工打卡</label>
        </Space>
      </StickyHeader>
      <ClockIn />
    </div>
  )
})

export default ClockInPage
