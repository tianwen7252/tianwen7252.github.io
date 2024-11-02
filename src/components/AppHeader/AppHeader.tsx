import React, { memo, useCallback, useRef } from 'react'
import { Menu, Layout, Flex, FloatButton } from 'antd'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  FormOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons'

import { useObserverDom } from 'src/hooks'
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
  const navigate = useNavigate()
  const observerRef = useRef<HTMLDivElement>()
  const headerRef = useRef<HTMLDivElement>()

  // set app header shadow by IntersectionObserver
  // const onObserve = useCallback((isIntersecting: boolean) => {
  //   headerRef.current.classList.toggle('resta-header--active', !isIntersecting)
  // }, [])
  // useObserverDom(observerRef, onObserve)

  const onClickMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      const { url } = event.currentTarget.dataset
      navigate(url)
    },
    [navigate],
  )

  return (
    <>
      <div id="resta-header-observer" ref={observerRef}></div>
      {/* <Header ref={headerRef} css={headerCss}>
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
      </Header> */}
      <FloatButton.Group
        trigger="hover"
        style={{ right: 10, top: 10, zIndex: 1001 }}
        icon={<MenuOutlined />}
        placement="bottom"
      >
        <FloatButton
          data-url="/"
          icon={<FormOutlined />}
          onClick={onClickMenu}
        />
        <FloatButton
          data-url="/order-list"
          icon={<OrderedListOutlined />}
          onClick={onClickMenu}
        />
        <FloatButton
          data-url="/statistics"
          icon={<BarChartOutlined />}
          onClick={onClickMenu}
        />
        <FloatButton
          data-url="/settings"
          icon={<SettingOutlined />}
          onClick={onClickMenu}
        />
      </FloatButton.Group>
    </>
  )
})

export default AppHeader
