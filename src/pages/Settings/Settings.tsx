import React, { useState, useCallback, useMemo, useContext } from 'react'
import { Space, Tabs, Alert, Button } from 'antd'
import {
  SettingOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CloudSyncOutlined,
} from '@ant-design/icons'
import { cloneDeep, get, set } from 'lodash-es'

import StickyHeader from 'src/components/StickyHeader'
import Products from 'src/components/Settings/Products'
import Info from 'src/components/Settings/Info'
import { StorageContext, DefaultData } from './context'
import { AppContext } from '../App/context'

import * as styles from './styles'

const menuItems = [
  {
    key: 'info',
    icon: <InfoCircleOutlined />,
    label: '系統資訊',
    children: <Info />,
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
    key: 'cost',
    icon: <DollarOutlined />,
    label: '每月成本',
  },
  {
    key: 'cloud',
    icon: <CloudSyncOutlined />,
    label: '雲端同步',
  },
]

export const Settings: React.FC<{}> = () => {
  const { API } = useContext(AppContext)
  const storage = useMemo(() => ({ ...DefaultData }), [])
  const backup = useMemo(() => cloneDeep(DefaultData), [])
  const [hasUpdated, setHasUpdated] = useState(false)

  const updateStorage = useCallback(() => {
    // compare storage and backup by JSON.stringify rather than using fast-deep-equal
    // because the storage is not an expensive object to compare deeply
    console.log('comparison', storage, backup)
    setHasUpdated(JSON.stringify(storage) !== JSON.stringify(backup))
  }, [storage, backup])

  const onSave = useCallback(() => {
    let saved = false
    // TBD
    // products
    const {
      product: { commondityTypes, commondities, orderTypes },
    } = storage
    commondityTypes.forEach((type, index) => {
      const original = backup.product.commondityTypes[index]
      if (original.label !== type.label) {
        API.commondityTypes.set(type.id, type)
        saved = true
      }
    })
    // commondities
    const backupComm = backup.product.commondities
    backupComm.forEach((commondity, index) => {
      const original = backupComm[index]
      // if (original.label !== commondity.label) {
      //   API.commondity.set(commondity.id, commondity)
      //   saved = true
      // }
    })
    saved && setHasUpdated(false)
  }, [storage, backup, updateStorage, API])

  const contextValue = useMemo(() => {
    return {
      storage,
      updateStorage,
      setInitialStorage: (keyPath: string) => {
        set(backup, keyPath, cloneDeep(get(storage, keyPath)))
        console.log('init', keyPath, storage, backup)
      },
    }
  }, [storage, backup, updateStorage])
  return (
    <StorageContext.Provider value={contextValue}>
      <div css={styles.mainCss}>
        <StickyHeader cls={styles.headerCss}>
          <Space css={styles.titleCss}>
            <SettingOutlined />
            <label>系統設定</label>
            {hasUpdated && (
              <Space>
                <Alert
                  css={styles.alertCss}
                  description="設定尚未存檔"
                  type="warning"
                  showIcon
                />
              </Space>
            )}
          </Space>
          {hasUpdated && (
            <Button
              css={styles.saveBtnCss}
              size="small"
              type="primary"
              onClick={onSave}
            >
              存檔設定 (未完成)
            </Button>
          )}
        </StickyHeader>
        <div css={styles.containerCss}>
          <Tabs
            items={menuItems}
            defaultActiveKey="info"
            destroyInactiveTabPane
          />
        </div>
      </div>
    </StorageContext.Provider>
  )
}

export default Settings
