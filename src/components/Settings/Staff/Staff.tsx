import React from 'react'
import { Tabs } from 'antd'
import ClockIn from './ClockIn'
import Records from './Records'

export const Staff: React.FC = () => {
  return (
    <div>
      <Tabs
        defaultActiveKey="clock-in"
        items={[
          {
            key: 'clock-in',
            label: '打卡',
            children: <ClockIn />,
          },
          {
            key: 'records',
            label: '打卡記錄',
            children: <Records />,
          },
        ]}
      />
    </div>
  )
}

export default Staff
