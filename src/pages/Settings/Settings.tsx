import React from 'react'
import {
  Flex,
  Statistic,
  Space,
  DatePicker,
  FloatButton,
  Menu,
  Tabs,
} from 'antd'
import {
  SettingOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CloudSyncOutlined,
} from '@ant-design/icons'

import StickyHeader from 'src/components/StickyHeader'
import Products from 'src/components/Settings/Products'
import { StorageContext, DefaultData } from './context'
import * as styles from './styles'

const menuItems = [
  {
    key: 'cost',
    icon: <DollarOutlined />,
    label: '每月成本',
  },
  {
    key: 'product',
    icon: <ShoppingOutlined />,
    label: '商品設定',
    children: <Products />,
  },
  {
    key: 'stuff',
    icon: <UserOutlined />,
    label: '員工設定',
  },
  {
    key: 'system',
    icon: <InfoCircleOutlined />,
    label: '系統資訊',
  },
  {
    key: 'cloud',
    icon: <CloudSyncOutlined />,
    label: '雲端同步',
  },
]

export const Settings: React.FC<{}> = props => {
  return (
    <StorageContext.Provider value={DefaultData}>
      <div css={styles.mainCss}>
        <StickyHeader cls={styles.headerCss}>
          <Space css={styles.titleCss}>
            <SettingOutlined />
            <label>系統設定</label>
          </Space>
        </StickyHeader>
        <div css={styles.containerCss}>
          <Tabs items={menuItems} defaultActiveKey="cost" />
        </div>
      </div>
    </StorageContext.Provider>
  )
}

export default Settings
