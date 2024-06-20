import React, { memo, useEffect, useRef } from 'react'
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
  const observerRef = useRef<HTMLDivElement>()
  const headerRef = useRef<HTMLDivElement>()

  // set app header shadow by IntersectionObserver
  useEffect(() => {
    const observerDom = observerRef.current
    const observer = new IntersectionObserver(([entry]) => {
      headerRef.current.classList.toggle(
        'resta-header--active',
        !entry.isIntersecting,
      )
    })
    observer.observe(observerDom)
    return () => {
      observer.unobserve(observerDom)
    }
  }, [])
  return (
    <>
      <div id="resta-header-observer" ref={observerRef}></div>
      <Header ref={headerRef} css={headerCss}>
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
