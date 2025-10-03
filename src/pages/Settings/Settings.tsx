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
import Backup from 'src/components/Settings/Backup'
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
  // {
  //   key: 'stuff',
  //   icon: <UserOutlined />,
  //   label: '員工設定',
  // },
  {
    key: 'cost',
    icon: <DollarOutlined />,
    label: '每月成本',
  },
  {
    key: 'backup',
    icon: <CloudSyncOutlined />,
    label: '雲端備份',
    children: <Backup />,
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
    const newList = []
    const deletedList = []
    const updatedList = []
    const iDMap = new Map(
      backupComm.map(backup => [backup.id.toString(), backup]),
    )
    console.log('source & iDMap', commondities, Array.from(iDMap))
    commondities.forEach(commondity => {
      const id = commondity.id.toString()
      const target = iDMap.get(id)
      if (id.includes('new-')) {
        newList.push(commondity)
        iDMap.delete(id)
      } else if (iDMap.has(id)) {
        const { name, price, priority, onMarket } = commondity
        if (name !== target.name || price !== target.price) {
          // TBD
          newList.push(commondity)
          deletedList.push(commondity)
        } else if (onMarket === '0') {
          deletedList.push(commondity)
        } else if (priority !== target.priority) {
          updatedList.push(commondity)
        }
        iDMap.delete(id)
      }
    })
    for (const [, commondity] of iDMap) {
      deletedList.push(commondity)
    }
    console.log('result', {
      newList,
      deletedList,
      updatedList,
    })
    // newList.forEach(record => {
    //   delete record.id
    //   API.commondity.add(record)
    // })
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
              存檔設定 (測式中-未完成)
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
