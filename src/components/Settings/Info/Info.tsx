import React, { useState } from 'react'
import { Card, Col, Row, Statistic, Alert, notification } from 'antd'
import ky from 'ky'
import { useAsyncEffect } from 'use-async-effect'

import { NUMBER } from 'src/constants/sync'
import { version } from 'src/../package.json'
import { getDeviceStorageInfo } from 'src/libs/common'
import { MANIFEST_URL } from 'src/libs/api'

import * as styles from './styles'

export const turnVersionToNumber = (version: string) => {
  return Number(version?.replaceAll('.', ''))
}

export const Info: React.FC<{}> = React.memo(() => {
  const [noti, contextHolder] = notification.useNotification()
  const [latestAppVersion, setLatestAppVersion] = useState('---')
  const [{ useage, percentageUsed, remaining }, setDeviceStorageInfo] =
    useState({
      useage: '---',
      percentageUsed: '---',
      remaining: '---',
    })
  let needUpdate = false
  if (turnVersionToNumber(latestAppVersion) > turnVersionToNumber(version)) {
    needUpdate = true
  }

  useAsyncEffect(async () => {
    // get latest app version from manifest.json
    try {
      const data = await ky.get(MANIFEST_URL).json<{ start_url: string }>()
      if (data?.start_url) {
        const matches = data.start_url.match(/v=(.+)/)
        if (matches) {
          setLatestAppVersion(matches[1])
        }
      }
    } catch (error) {
      if (error?.message) {
        noti.error({
          message: '網路資料錯誤',
          description: `取得最新版本失敗: ${error.message}`,
          duration: 20,
          showProgress: true,
        })
      }
    }
    // get device storage info
    try {
      const { useage, percentageUsed, remaining } = await getDeviceStorageInfo()
      setDeviceStorageInfo({ useage, percentageUsed, remaining })
    } catch (error) {
      // ignore
    }
  }, [noti])

  return (
    <div css={styles.info}>
      {contextHolder}
      {needUpdate && (
        <Alert
          style={{ margin: '12px 0' }}
          message="請重開App將自動更新到最新版本"
          type="warning"
          showIcon
        />
      )}
      <Row gutter={12}>
        <Col span={8}>
          <Card>
            <Statistic title="本機App版本" prefix="v" value={version} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="程式資料庫同步版本" value={NUMBER} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本機資料庫同步版本"
              value={localStorage.getItem('SYNC_NUMBER')}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="最新App版本"
              prefix="v"
              value={latestAppVersion}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="雲端資料同步版本" value={'---'} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本機雲端資料同步版本"
              value={localStorage.getItem('CLOUD_SYNC_NUMBER') ?? '---'}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col span={8}>
          <Card>
            <Statistic title="本機資料庫使用量" value={useage} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="本機資料庫剩餘量" value={remaining} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="本機資料庫使用率" value={percentageUsed} />
          </Card>
        </Col>
      </Row>
    </div>
  )
})

export default Info
