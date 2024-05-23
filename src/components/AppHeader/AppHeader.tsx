import React from 'react'
import { Menu, Layout, Flex } from 'antd'
import {
  FormOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  UserSwitchOutlined,
  SettingOutlined,
} from '@ant-design/icons'

import viteLogo from '/vite.svg'
import { headerCss, menuCss, logoCss } from './styles'

const { Header } = Layout
const MENU_ITEMS = [
  { key: 'order', label: '點餐', icon: <FormOutlined /> },
  { key: 'list', label: '訂單', icon: <OrderedListOutlined /> },
  { key: 'statistics', label: '統計', icon: <BarChartOutlined /> },
  { key: 'staff', label: '員工', icon: <UserSwitchOutlined /> },
  { key: 'system', label: '系統', icon: <SettingOutlined /> },
]

export const AppHeader: React.FC<{}> = props => {
  return (
    <>
      <Header css={headerCss}>
        <Flex>
          <img css={logoCss} src={viteLogo} />
          <Menu
            css={menuCss}
            mode="horizontal"
            defaultSelectedKeys={['order']}
            items={MENU_ITEMS}
          />
        </Flex>
      </Header>
    </>
  )
}

export default AppHeader
