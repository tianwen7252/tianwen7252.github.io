import React, {
  useReducer,
  useMemo,
  useContext,
  useCallback,
  useRef,
  useLayoutEffect,
  useState,
} from 'react'
import { debounce } from 'lodash-es'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Button,
  Input,
  InputNumber,
  Table,
  Select,
  Tabs,
  notification,
  Modal,
  FloatButton,
} from 'antd'
import {
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
} from '@ant-design/icons'

import { AppContext } from 'src/pages/App/context'
import { StorageContext } from 'src/pages/Settings/context'
import { LATEST_UPDATE_TIME } from 'src/constants/sync'

import * as styles from './styles'

export const getHoverRowIndex = (target: HTMLElement) => {
  const row = target.closest('.ant-table-row')
  return Array.from(row?.parentElement?.childNodes ?? []).indexOf(row)
}

export const Products: React.FC = () => {
  const { API } = useContext(AppContext)
  const { storage, updateStorage, setInitialStorage } =
    useContext(StorageContext)
  const [hoverRow, updateHoverRow] = useState('')
  const [noti, notiContextHolder] = notification.useNotification()
  const [modal, modalContextHolder] = Modal.useModal()
  const [refreshFlag, refresh] = useReducer(o => !o, true)
  const typeIDRef = useRef('1')
  // a flag to stop useLiveQuery to re-render when the observed data changes
  const resetRef = useRef(false)

  useLayoutEffect(() => {
    if (hoverRow) {
      const [tableID, direction, index] = hoverRow.split(':')
      setTimeout(() => {
        const rows = document
          .getElementById(tableID)
          .querySelectorAll('.ant-table-tbody > tr')
        if (rows.length && rows[index]) {
          const row = rows[index]
          row.childNodes.forEach(each => {
            each.classList.remove('ant-table-cell-row-hover')
          })
          if (direction === 'up') {
            row?.previousSibling?.childNodes?.forEach((each: HTMLElement) => {
              each.classList.add('ant-table-cell-row-hover')
            })
          } else {
            row?.nextSibling?.childNodes?.forEach((each: HTMLElement) => {
              each.classList.add('ant-table-cell-row-hover')
            })
          }
        }
      }, 100)
    }
  }, [hoverRow])

  const update = useCallback(
    (rerender = false) => {
      rerender && refresh()
      updateStorage()
    },
    [updateStorage],
  )

  // comm types
  const commondityTypes = useLiveQuery(
    async () => {
      if (resetRef.current) {
        return []
      }
      const types = await API.commondityTypes.get()
      storage.product.commondityTypes = types
      setInitialStorage('product.commondityTypes')
      return types.map(type => ({ key: type.id, ...type }))
    },
    [],
    [],
  )
  const onChangeTypeLabel = useCallback(
    debounce((id: number, event: React.ChangeEvent<HTMLInputElement>) => {
      storage.product.commondityTypes.some(type => {
        if (type.id === id) {
          type.label = event.target.value
          update()
          return true
        }
        return false
      })
    }, 300),
    [update],
  )
  const commondityTypeColumns = useMemo(
    () => [
      { title: '編號', dataIndex: 'typeID', key: 'typeID' },
      {
        title: '種類',
        dataIndex: 'label',
        key: 'label',
        render: (_, record: RestaDB.Table.CommondityType) => (
          <Input
            key={record.id}
            defaultValue={record.label}
            style={{ width: 200 }}
            onChange={onChangeTypeLabel.bind(null, record.id)}
          />
        ),
      },
    ],
    [onChangeTypeLabel],
  )

  // commondities
  const commonditiesData = useLiveQuery(
    async () => {
      if (resetRef.current) {
        return
      }
      const data = await API.commondity.get()
      storage.product.commondities = data
      setInitialStorage('product.commondities')
    },
    [],
    [],
  )
  const onChangeCommondity = useCallback(
    debounce(
      (
        id: number | string,
        action: 'add' | 'edit' | 'delete' | 'moveUp' | 'moveDown',
        dataIndex: string,
        event: React.ChangeEvent<HTMLInputElement> | string,
      ) => {
        const { commondities } = storage.product
        const commondity = commondities.find(comm => {
          return comm.id === id
        })
        const { typeID } = commondity
        if (commondity) {
          const target = (event as React.ChangeEvent<HTMLInputElement>)?.target
          const tableID = 'resta-settings-commondity-tabs'
          switch (action) {
            case 'edit': {
              const value = target?.value ?? event
              commondity[dataIndex] = value
              update()
              break
            }
            case 'delete': {
              if (commondity.id.toString().includes('new-')) {
                storage.product.commondities = commondities.filter(
                  comm => comm.id !== id,
                )
              } else {
                commondity.onMarket = '0'
              }
              update(true)
              break
            }
            case 'moveUp': {
              const upCommondity = commondities.find(comm => {
                return (
                  comm.priority === commondity.priority - 1 &&
                  comm.typeID === typeID
                )
              })
              if (upCommondity) {
                ++upCommondity.priority
                --commondity.priority
                const rowIndex = getHoverRowIndex(target)
                update(true)
                updateHoverRow(`${tableID}:up:${rowIndex}`)
              }
              break
            }
            case 'moveDown': {
              const downCommondity = commondities.find(comm => {
                return (
                  comm.priority === commondity.priority + 1 &&
                  comm.typeID === typeID
                )
              })
              if (downCommondity) {
                --downCommondity.priority
                ++commondity.priority
                const rowIndex = getHoverRowIndex(target)
                update(true)
                updateHoverRow(`${tableID}:down:${rowIndex}`)
              }
              break
            }
            // default:
            // case 'add':
            //   break
          }
        }
      },
      150,
    ),
    [],
  )
  const comTabItems = useMemo(() => {
    const columns = [
      {
        title: '順序',
        dataIndex: 'priority',
        key: 'priority',
      },
      {
        title: '品名',
        dataIndex: 'name',
        key: 'name',
        render: (_, record: RestaDB.Table.Commondity) => (
          <Input
            key={record.id}
            defaultValue={record.name}
            onChange={onChangeCommondity.bind(null, record.id, 'edit', 'name')}
          />
        ),
      },
      {
        title: '價格',
        dataIndex: 'price',
        key: 'price',
        render: (_, record: RestaDB.Table.Commondity) => (
          <InputNumber
            type="number"
            key={record.id}
            defaultValue={record.price}
            onChange={onChangeCommondity.bind(null, record.id, 'edit', 'price')}
          />
        ),
      },
      {
        title: '鍵盤顯示',
        dataIndex: 'hideOnMode',
        key: 'hideOnMode',
        render: (_, record: RestaDB.Table.Commondity) => (
          <Select
            defaultValue={record.hideOnMode || ''}
            style={{ width: 140 }}
            onChange={value =>
              onChangeCommondity(record.id, 'edit', 'hideOnMode', value)
            }
          >
            <Select.Option value="">皆顯示</Select.Option>
            <Select.Option value="calculator">僅顯示在計算機</Select.Option>
            <Select.Option value="commondity">僅顯示在商品</Select.Option>
            <Select.Option value="both">皆不顯示</Select.Option>
          </Select>
        ),
      },
      {
        title: '設定',
        key: 'action',
        render: (_, record: RestaDB.Table.Commondity) => (
          <>
            <Button
              css={styles.actionBtn}
              type="text"
              variant="filled"
              color="primary"
              icon={<ArrowUpOutlined />}
              onClick={onChangeCommondity.bind(null, record.id, 'moveUp', null)}
            />
            <Button
              css={styles.actionBtn}
              type="text"
              variant="filled"
              color="primary"
              icon={<ArrowDownOutlined />}
              onClick={onChangeCommondity.bind(
                null,
                record.id,
                'moveDown',
                null,
              )}
            />
            <Button
              css={styles.deleteBtn}
              type="text"
              variant="filled"
              color="danger"
              icon={<DeleteOutlined />}
              onClick={onChangeCommondity.bind(null, record.id, 'delete', null)}
            />
          </>
        ),
      },
    ]
    const map: Resta.Products.commonditiesMap = {}
    storage.product.commondities?.forEach(item => {
      const { id, typeID, priority, onMarket } = item
      map[typeID] = map[typeID] ?? []
      if (onMarket === '1') {
        map[typeID].push({
          key: `${id}-${priority}`,
          ...item,
        })
      }
    })
    return (
      commondityTypes?.map(type => {
        const { id, label, typeID } = type
        const dataSource = map[typeID] ?? []
        dataSource.sort((prev, next) => {
          return prev.priority - next.priority
        })
        return {
          key: id,
          label: label,
          children: (
            <Table
              bordered={false}
              css={styles.commondityTable}
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            />
          ),
        }
      }) ?? []
    )
    // refreshFlag is a flag to force re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commondityTypes, onChangeCommondity, commonditiesData, refreshFlag])
  const onAddComm = useCallback(() => {
    const typeID = typeIDRef.current
    const { commondities } = storage.product
    const dataSource = commondities
      .filter(comm => comm.typeID === typeID)
      .sort((prev, next) => {
        return prev.priority - next.priority
      })
    if (dataSource) {
      const lastPriority = dataSource.at(-1).priority + 1
      commondities.push({
        hideOnMode: '',
        id: `new-${Date.now()}`,
        name: '',
        onMarket: '1',
        price: 0,
        priority: lastPriority,
        editor: 'admin',
        typeID,
      })
      update(true)
      window.scroll({
        top:
          document
            .getElementById('resta-settings-commondity-tabs')
            ?.getBoundingClientRect()?.bottom -
          document.body.getBoundingClientRect().top -
          150,
        left: 0,
        behavior: 'smooth',
      })
    }
  }, [storage.product, update])

  // order types
  const orderTypesData = useLiveQuery(
    async () => {
      if (resetRef.current) {
        return
      }
      const data = await API.orderTypes.get()
      storage.product.orderTypes = data
      setInitialStorage('product.orderTypes')
    },
    [],
    [],
  )
  const onChangeOrderType = useCallback(
    debounce(
      (
        id: number | string,
        action: 'add' | 'edit' | 'delete' | 'moveUp' | 'moveDown',
        dataIndex: string,
        event: React.ChangeEvent<HTMLInputElement> | string,
      ) => {
        const { orderTypes } = storage.product
        const orderType = orderTypes.find(type => {
          return type.id === id
        })
        if (orderType) {
          const target = (event as React.ChangeEvent<HTMLInputElement>)?.target
          const tableID = 'resta-settings-orderTypes-table'
          switch (action) {
            case 'edit': {
              const value = target?.value ?? event
              orderType[dataIndex] = value
              update()
              break
            }
            case 'delete': {
              storage.product.orderTypes = orderTypes.filter(
                type => type.id !== id,
              )
              update(true)
              break
            }
            case 'moveUp': {
              const upOrderType = orderTypes.find(type => {
                return type.priority === orderType.priority - 1
              })
              if (upOrderType) {
                ++upOrderType.priority
                --orderType.priority
                const rowIndex = getHoverRowIndex(target)
                update(true)
                updateHoverRow(`${tableID}:up:${rowIndex}`)
              }
              break
            }
            case 'moveDown': {
              const downOrderType = orderTypes.find(type => {
                return type.priority === orderType.priority + 1
              })
              if (downOrderType) {
                --downOrderType.priority
                ++orderType.priority
                const rowIndex = getHoverRowIndex(target)
                update(true)
                updateHoverRow(`${tableID}:down:${rowIndex}`)
              }
              break
            }
          }
        }
      },
      150,
    ),
    [],
  )
  const [orderTypesColumns, orderTypesDataSource] = useMemo(() => {
    const columns = [
      {
        title: '順序',
        dataIndex: 'priority',
        key: 'priority',
      },
      {
        title: '名稱',
        dataIndex: 'name',
        key: 'name',
        render: (_, record: RestaDB.Table.OrderType) => (
          <Input
            key={record.id}
            defaultValue={record.name}
            onChange={onChangeOrderType.bind(null, record.id, 'edit', 'name')}
          />
        ),
      },
      {
        title: '顏色',
        dataIndex: 'color',
        key: 'color',
        render: (_, record: RestaDB.Table.OrderType) => (
          <Select
            key={record.id}
            defaultValue={record.color ?? ''}
            style={{ width: 120 }}
            onChange={value =>
              onChangeOrderType(record.id, 'edit', 'color', value)
            }
          >
            <Select.Option value="">無</Select.Option>
            <Select.Option value="red">紅色</Select.Option>
            <Select.Option value="blue">藍色</Select.Option>
            <Select.Option value="purple">紫色</Select.Option>
            <Select.Option value="gold">金色</Select.Option>
            <Select.Option value="brown">咖啡色</Select.Option>
          </Select>
        ),
      },
      {
        title: '設定',
        key: 'action',
        render: (_, record: RestaDB.Table.OrderType) => (
          <>
            <Button
              css={styles.actionBtn}
              type="text"
              variant="filled"
              color="primary"
              icon={<ArrowUpOutlined />}
              onClick={onChangeOrderType.bind(null, record.id, 'moveUp', null)}
            />
            <Button
              css={styles.actionBtn}
              type="text"
              variant="filled"
              color="primary"
              icon={<ArrowDownOutlined />}
              onClick={onChangeOrderType.bind(
                null,
                record.id,
                'moveDown',
                null,
              )}
            />
            <Button
              css={styles.deleteBtn}
              type="text"
              variant="filled"
              color="danger"
              icon={<DeleteOutlined />}
              onClick={onChangeOrderType.bind(null, record.id, 'delete', null)}
            />
          </>
        ),
      },
    ]

    const dataSource =
      storage.product.orderTypes
        ?.map(type => {
          return {
            ...type,
            key: type.id,
          }
        })
        .sort((prev, next) => {
          return prev.priority - next.priority
        }) ?? []
    return [columns, dataSource]

    // refreshFlag is a flag to force re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTypesData, onChangeOrderType, refreshFlag])
  const onAddOrderType = useCallback(() => {
    const { orderTypes } = storage.product
    if (orderTypes.length >= 10) {
      noti.warning({
        message: '系統設定',
        description: '訂單分類最多只能10個',
        showProgress: true,
      })
      return
    }
    const dataSource = orderTypes.sort((prev, next) => {
      return prev.priority - next.priority
    })
    if (dataSource) {
      const lastPriority = dataSource.at(-1).priority + 1
      orderTypes.push({
        id: `new-${Date.now()}`,
        name: '',
        priority: lastPriority,
        editor: 'admin',
        type: 'order',
      })
      update(true)
      window.scroll({
        top:
          document
            .getElementById('resta-settings-orderTypes-table')
            ?.getBoundingClientRect()?.bottom -
          document.body.getBoundingClientRect().top -
          100,
        left: 0,
        behavior: 'smooth',
      })
    }
  }, [storage.product, noti, update])

  const onChangeTab = useCallback((activeKey: string) => {
    typeIDRef.current = activeKey
  }, [])

  return (
    <div css={styles.container}>
      {notiContextHolder}
      {modalContextHolder}
      <h2 css={styles.title}>商品種類</h2>
      <Table
        bordered={false}
        css={styles.typeTable}
        dataSource={commondityTypes}
        columns={commondityTypeColumns}
        pagination={false}
      />
      <h2 css={styles.title}>商品設定</h2>
      <Tabs
        id="resta-settings-commondity-tabs"
        items={comTabItems}
        css={styles.commondityTable}
        tabBarExtraContent={
          <Button icon={<PlusOutlined />} onClick={onAddComm}>
            新增商品
          </Button>
        }
        onChange={onChangeTab}
      />
      <h2 css={styles.title}>
        訂單分類
        <Button
          css={styles.addCategoryButton}
          icon={<PlusOutlined />}
          onClick={onAddOrderType}
        >
          新增分類
        </Button>
      </h2>
      <Table
        id="resta-settings-orderTypes-table"
        css={styles.orderTypeTable}
        bordered={false}
        dataSource={orderTypesDataSource}
        columns={orderTypesColumns}
        pagination={false}
      />
      <Button
        css={styles.resetButton}
        type="primary"
        danger
        block
        onClick={useCallback(() => {
          modal.confirm({
            title: '危險動作 - 請再次確認',
            content: (
              <>
                <label>
                  確定要還原所有商品和分類到預設狀態嗎？此操作無法復原。
                </label>
                <h4>預設資料的最後更新日期為：{LATEST_UPDATE_TIME}</h4>
              </>
            ),
            okText: '確認還原',
            cancelText: '取消',
            okType: 'danger',
            width: 500,
            onOk: () => {
              resetRef.current = true
              API.reset()
              // avoid flickering
              setTimeout(() => {
                noti.success({
                  message: '系統設定',
                  description: '資料已還原成功，即將重新啟動App...',
                  showProgress: true,
                  duration: 3,
                })
              }, 100)
              // reload app after 3 seconds
              setTimeout(() => {
                window.location.reload()
              }, 3000)
            },
          })
        }, [modal, API, noti])}
      >
        還原預設
      </Button>
      <FloatButton.BackTop visibilityHeight={100} />
    </div>
  )
}

export default Products
