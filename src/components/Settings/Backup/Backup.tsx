import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import { Table, Button, Progress, notification, Modal, Input } from 'antd'

import { AppContext } from 'src/pages/App/context'
import {
  backupAndUpload,
  listDriveFiles,
  deleteFiles,
  restoreFromBackup,
  generateDefaultBackupName,
} from './fileService'
import * as styles from './styles'

const gAPIID = '799987452297-qetqo8blfushga2h064of13epeqtgh4a'

/**
 * React component for managing IndexedDB backups on Google Drive.
 * - Allows user to export & upload backups
 * - Displays upload progress
 * - Lists existing backup files
 * - Supports multiple file selection & deletion
 */
export const Backup: React.FC<Resta.Backup.Props> = () => {
  const { gAPIToken, setGAPIToken } = useContext(AppContext)
  const [files, setFiles] = useState<Resta.Backup.BackupFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [backupFileName, setBackupFileName] = useState(() =>
    generateDefaultBackupName(),
  )
  const [noti, contextHolder] = notification.useNotification()
  const hasFocusedInput = useRef(false)

  // Load file list from Google Drive
  const loadFiles = useCallback(
    async (tokenOverride?: string | null) => {
      const token = tokenOverride ?? gAPIToken
      if (!token) return
      try {
        const res = await listDriveFiles(token)
        setFiles(res)
      } catch (err) {
        const errorType = err?.error?.errors?.[0]?.message
        if (errorType === 'Invalid Credentials') {
          requestToken(true)
        } else {
          noti.error({
            message: '無法載入備份資料',
            description: String(err?.error?.message ?? 'API Response Error'),
          })
        }
      }
    },
    [gAPIToken, noti],
  )

  const requestToken = useCallback(
    (force = false) => {
      if (!force && gAPIToken) return

      const oauth = window.google?.accounts?.oauth2
      if (!oauth) {
        noti.error({ message: 'Google OAuth 尚未載入，請稍後再試' })
        return
      }

      const client = oauth.initTokenClient({
        client_id: `${gAPIID}.apps.googleusercontent.com`,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: tokenResponse => {
          const token = tokenResponse?.access_token
          if (!token) {
            noti.error({ message: '未取得授權 Token，請重試' })
            return
          }
          setGAPIToken(token)
          loadFiles(token)
        },
      })
      client.requestAccessToken()
    },
    [gAPIToken, loadFiles, noti, setGAPIToken],
  )

  useEffect(() => {
    if (gAPIToken) {
      loadFiles(gAPIToken)
    } else {
      requestToken()
    }
  }, [gAPIToken, loadFiles, requestToken])

  const getAuthorizedToken = useCallback(() => {
    if (gAPIToken) return gAPIToken
    noti.info({ message: '請先授權 Google Drive 帳戶' })
    requestToken()
    return null
  }, [gAPIToken, noti, requestToken])

  const openBackupModal = useCallback(() => {
    const token = getAuthorizedToken()
    if (!token) return
    setBackupFileName(generateDefaultBackupName())
    setIsBackupModalOpen(true)
    hasFocusedInput.current = false
  }, [getAuthorizedToken])

  const handleBackupModalCancel = useCallback(() => {
    setIsBackupModalOpen(false)
    hasFocusedInput.current = false
  }, [])

  const confirmBackup = useCallback(async () => {
    const token = getAuthorizedToken()
    if (!token) return
    const trimmedName = backupFileName.trim()
    const targetName = trimmedName || generateDefaultBackupName()
    setIsBackupModalOpen(false)
    hasFocusedInput.current = false
    setLoading(true)
    try {
      await backupAndUpload(
        token,
        percent => setUploadProgress(percent),
        targetName,
      )
      noti.success({ message: '備份成功' })
      setBackupFileName(generateDefaultBackupName())
      await loadFiles(token)
    } catch (err) {
      noti.error({ message: '備份失敗', description: String(err) })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }, [backupFileName, getAuthorizedToken, loadFiles, noti])

  // Delete selected files
  const handleDelete = useCallback(async () => {
    const token = getAuthorizedToken()
    if (!token) return
    setLoading(true)
    try {
      await deleteFiles(token, selectedRowKeys as string[])
      noti.success({ message: '檔案刪除成功!' })
      loadFiles(token)
    } catch (err) {
      noti.error({ message: '無法刪除檔案', description: String(err) })
    } finally {
      setLoading(false)
      setSelectedRowKeys([])
    }
  }, [getAuthorizedToken, loadFiles, noti, selectedRowKeys])

  const handleRestore = useCallback(
    async (fileId: string) => {
      const token = getAuthorizedToken()
      if (!token) return
      setRestoringId(fileId)
      setLoading(true)
      try {
        await restoreFromBackup(token, fileId)
        noti.success({ message: '備份資料庫還原成功!' })
      } catch (err) {
        noti.error({ message: '無法還原備份資料庫', description: String(err) })
      } finally {
        setRestoringId(null)
        setLoading(false)
      }
    },
    [getAuthorizedToken, noti],
  )

  const columns = useMemo(
    () => [
      { title: '備份名稱', dataIndex: 'name', key: 'name' },
      { title: '大小 (bytes)', dataIndex: 'size', key: 'size' },
      { title: '建立時間', dataIndex: 'createdTime', key: 'createdTime' },
      {
        title: '動作',
        key: 'action',
        render: (_: unknown, record: Resta.Backup.BackupFile) => (
          <Button
            type="default"
            onClick={() => handleRestore(record.id)}
            loading={restoringId === record.id}
          >
            還原此資料庫
          </Button>
        ),
      },
    ],
    [handleRestore, restoringId],
  )

  const inputRefCallback = useCallback(input => {
    if (input && !hasFocusedInput.current) {
      setTimeout(() => {
        input.focus({
          cursor: 'all',
        })
        hasFocusedInput.current = true
      }, 100)
    }
  }, [])

  return (
    <>
      {contextHolder}
      <Modal
        title="設定備份檔名"
        open={isBackupModalOpen}
        onOk={confirmBackup}
        onCancel={handleBackupModalCancel}
        okText="開始備份"
        cancelText="取消"
      >
        <Input
          value={backupFileName}
          onChange={event => setBackupFileName(event.target.value)}
          placeholder="輸入備份檔名"
          ref={inputRefCallback}
        />
      </Modal>
      <Button type="primary" onClick={openBackupModal} loading={loading}>
        建立備份
      </Button>
      {uploadProgress > 0 && (
        <Progress
          percent={uploadProgress}
          status="active"
          strokeColor={{ from: '#108ee9', to: '#87d068' }}
        />
      )}
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        dataSource={files}
        columns={columns}
        rowKey="id"
        pagination={false}
        style={{ marginTop: 16 }}
      />
      {selectedRowKeys.length > 0 && (
        <Button
          danger
          onClick={handleDelete}
          loading={loading}
          css={styles.delButton}
        >
          刪除
        </Button>
      )}
    </>
  )
}

export default Backup
