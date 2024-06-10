import React, { useCallback, useMemo, useContext } from 'react'
import { Flex, Button, Tabs, Dropdown, Space, Tag } from 'antd'
import type { MenuProps } from 'antd'
import {
  SwapLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
} from '@ant-design/icons'

import { NUMBER_BUTTONS } from 'src/constants/defaults/buttons'
import { COMMODITIES } from 'src/constants/defaults/commondities'
import { AppContext } from 'src/components/App/context'
import { useNumberInput } from './hooks'
import * as styles from './styles'

const ICON_MAP = {
  SwapLeftOutlined: <SwapLeftOutlined />,
  PlusOutlined: <PlusOutlined />,
  DeleteOutlined: <DeleteOutlined />,
  CloseOutlined: <CloseOutlined />,
}

export const Keyboard: React.FC<{}> = props => {
  const { data, total, input, updateItemType } = useNumberInput()
  const { isTablet } = useContext(AppContext)
  const handleInput = useCallback(
    (meta: string) => {
      const [key, type] = meta.split('|')
      return input(key, type).data
    },
    [input],
  )
  const onButtonClick = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      const { meta = '' } = event.currentTarget.dataset
      console.log('meta', meta)
      handleInput(meta)
    },
    [handleInput],
  )
  const onMenuClick: MenuProps['onClick'] = useCallback(
    event => {
      const { key } = event
      if (isTablet) {
        updateItemType(key)
      } else {
        handleInput(key)
      }
    },
    [isTablet, handleInput, updateItemType],
  )
  const numberButtons = useMemo(() => {
    return NUMBER_BUTTONS.map((buttons, index) => (
      <Flex key={index} gap="large">
        {buttons.map((config, key) => {
          const { label, meta, icon } = config
          return (
            <Button
              key={key}
              shape="circle"
              size="large"
              data-meta={meta}
              icon={ICON_MAP[icon]}
              onClick={onButtonClick}
            >
              {label}
            </Button>
          )
        })}
      </Flex>
    ))
  }, [onButtonClick])
  const commondities = useMemo(() => {
    return COMMODITIES.map(tab => {
      const { type, label, items, color } = tab
      const buttons = items.map((each, index) => {
        const { name, price, menu, showRelevancy } = each
        const meta =
          showRelevancy && menu
            ? `+${price}|${menu[0].name}`
            : `+${price}|${name}`
        const btnElement = (
          <Button
            key={`${index}-${meta}`}
            shape="circle"
            size="large"
            data-meta={meta}
            css={styles.COLOR_MAP[color]}
            onClick={onButtonClick}
          >
            {name}
          </Button>
        )
        if (menu) {
          return (
            <Dropdown
              overlayClassName={styles.btnDropdownCssName}
              arrow={{ pointAtCenter: true }}
              placement="bottom"
              key={meta}
              menu={{
                onClick: onMenuClick,
                items: menu.map(({ name, price, textIcon }) => {
                  const key = `+${price}|${name}`
                  return {
                    key,
                    label: textIcon ? (
                      <Space>
                        {textIcon}
                        {name}
                      </Space>
                    ) : (
                      name
                    ),
                  }
                }),
              }}
            >
              {btnElement}
            </Dropdown>
          )
        } else {
          return btnElement
        }
      })

      return {
        label,
        key: type,
        children: (
          <Flex css={styles.tabPanelCss} gap="large" vertical wrap>
            {buttons}
          </Flex>
        ),
      }
    })
  }, [onButtonClick, onMenuClick])

  const meals = useMemo(
    () =>
      data.map(({ value, operator, type }, index) => {
        let content
        if (operator) {
          content = (
            <span>
              {operator}
              {value}
            </span>
          )
        } else {
          content = type ? (
            <span>
              {value}(
              <Tag bordered={false} color="#222" closeIcon>
                {type}
              </Tag>
              )
            </span>
          ) : (
            value
          )
        }
        return <Space key={`${index}-${value}`}>{content}</Space>
      }),
    [data],
  )

  return (
    <Flex css={styles.keyboardCss} vertical>
      <Flex css={styles.textAreaCss} flex="2" vertical>
        <div css={styles.mealsCss}>{meals}</div>
        {total && <div css={styles.totalCss}> = ${total}</div>}
      </Flex>
      <Flex css={styles.btnCss} flex="1" gap="large">
        <div css={styles.numberBtnsCss}>
          <Button
            danger
            type="primary"
            size="large"
            data-meta="Escape"
            css={styles.deleteBtnCss}
            icon={<DeleteOutlined />}
            onClick={onButtonClick}
          />
          {numberButtons}
        </div>
        <Tabs
          css={styles.tabCss}
          defaultActiveKey="main dish"
          items={commondities}
        />
      </Flex>
      <Flex flex="1" vertical>
        <Button css={styles.submitCss} size="large">
          送單
        </Button>
      </Flex>
    </Flex>
  )
}

export default Keyboard
