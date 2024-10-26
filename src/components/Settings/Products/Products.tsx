import React, { useState, useMemo, useContext, useCallback } from 'react'
import { debounce } from 'lodash'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Button,
  Input,
  InputNumber,
  Space,
  Table,
  Modal,
  Select,
  Tabs,
  Alert,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'

import { AppContext } from 'src/pages/App/context'
import { StorageContext } from 'src/pages/Settings/context'
import * as styles from './styles'

export const Products: React.FC = () => {
  const { API } = useContext(AppContext)
  const storage = useContext(StorageContext)
  const [commonditiesMap, setCommMap] =
    useState<Resta.Products.commonditiesMap>({})
  const commondityTypes = useLiveQuery(
    async () => {
      const types = await API.commondityTypes.get()
      storage.product.commondityTypes = types
      // add key
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
          console.log('storage', storage)
          return true
        }
        return false
      })
    }, 300),
    [],
  )
  const commondityTypeColumns = useMemo(
    () => [
      { title: '編號', dataIndex: 'id', key: 'id' },
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

  useLiveQuery(async () => {
    const data = await API.commondity.get()
    storage.product.commondities = data
    const map: Resta.Products.commonditiesMap = {}
    data.forEach(item => {
      const { id, typeID } = item
      map[typeID] = map[typeID] ?? []
      map[typeID].push({
        key: id,
        ...item,
      })
    })
    setCommMap(map)
  }, [])
  const onChangeCommondity = useCallback(
    debounce(
      (
        id: number,
        action: 'add' | 'edit' | 'delete' | 'moveUp' | 'moveDown',
        dataIndex: string,
        event: React.ChangeEvent<HTMLInputElement> | string,
      ) => {
        const commondity = storage.product.commondities.find(comm => {
          return comm.id === id
        })
        if (commondity) {
          switch (action) {
            default:
            case 'add':
              break
          }
        }
      },
      300,
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
            defaultValue={record.hideOnMode || 'both'}
            style={{ width: 140 }}
            onChange={value =>
              onChangeCommondity(record.id, 'edit', 'hideOnMode', value)
            }
          >
            <Select.Option value="both">皆顯示</Select.Option>
            <Select.Option value="calculator">僅顯示在計算機</Select.Option>
            <Select.Option value="commondity">僅顯示在商品</Select.Option>
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
              onClick={onChangeCommondity.bind(null, record.id, 'moveUp')}
            />
            <Button
              css={styles.actionBtn}
              type="text"
              variant="filled"
              color="primary"
              icon={<ArrowDownOutlined />}
              onClick={onChangeCommondity.bind(null, record.id, 'moveDown')}
            />

            <Button
              css={styles.deleteBtn}
              type="text"
              variant="filled"
              color="danger"
              icon={<DeleteOutlined />}
              onClick={onChangeCommondity.bind(null, record.id, 'delete')}
            />
          </>
        ),
      },
    ]
    return (
      commondityTypes?.map(type => {
        const { id, label } = type
        return {
          key: id,
          label: label,
          children: (
            <Table
              bordered={false}
              css={styles.commondityTable}
              dataSource={commonditiesMap[id] ?? []}
              columns={columns}
              pagination={false}
            />
          ),
        }
      }) || []
    )
  }, [commondityTypes, commonditiesMap, onChangeCommondity])

  return (
    <div css={styles.container}>
      <h2 css={styles.title}>商品種類</h2>
      <Table
        bordered={false}
        css={styles.typeTable}
        dataSource={commondityTypes}
        columns={commondityTypeColumns}
        pagination={false}
      />
      <h2 css={styles.title}>商品設定</h2>
      <Alert message="拖曳項目移動即可排序" type="info" showIcon />
      <Tabs items={comTabItems} css={styles.commondityTable} />
    </div>
  )
}

export default Products
