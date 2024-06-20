import React, { memo } from 'react'
import { Menu, Layout, Flex } from 'antd'
import { useLocation, Link } from 'react-router-dom'
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
  {
    key: '/',
    label: <Link to="/">點餐</Link>,
    icon: <FormOutlined />,
  },
  {
    key: '/order-list',
    label: <Link to="/order-list">訂單</Link>,
    icon: <OrderedListOutlined />,
  },
  { key: '/statistics', label: '統計', icon: <BarChartOutlined /> },
  { key: '/staff', label: '員工', icon: <UserSwitchOutlined /> },
  { key: '/system', label: '系統', icon: <SettingOutlined /> },
]

export const AppHeader: React.FC<{}> = memo(() => {
  const { pathname = '/' } = useLocation()
  return (
    <>
      <Header css={headerCss}>
        <Flex>
          <img css={logoCss} src={viteLogo} />
          <label>天文</label>
          <Menu
            css={menuCss}
            mode="horizontal"
            selectedKeys={[pathname]}
            items={MENU_ITEMS}
          />
        </Flex>
      </Header>
    </>
  )
})

export default AppHeader
