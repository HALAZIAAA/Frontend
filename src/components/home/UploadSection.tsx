import { useCallback, useEffect, useRef, useState } from 'react'
import { getFileStatus, getRecentFiles, uploadFile } from '../../api/fileApi'
import type { BackendFileListItemResponse, BackendFileStage } from '../../types/fileConverter'

type ConversionStatus = 'idle' | 'file_selected' | 'converting' | 'success' | 'error'

type ConversionState = {
  status: ConversionStatus
  selectedFile: File | null
  fileName: string
  fileSize: number
  fileId: string
  currentStage: BackendFileStage
  progress: number
  downloadUrl: string | null
  errorMessage: string
  errorUserMessage: string
  isSubmitting: boolean
}

type PersistedConversionState = {
  fileId: string
  fileName: string
  fileSize: number
  status: ConversionStatus
  currentStage: BackendFileStage
  progress: number
  downloadUrl: string | null
  errorMessage: string
  errorUserMessage: string
}

const DEFAULT_STATE: ConversionState = {
  status: 'idle',
  selectedFile: null,
  fileName: '',
  fileSize: 0,
  fileId: '',
  currentStage: 'uploaded',
  progress: 0,
  downloadUrl: null,
  errorMessage: '',
  errorUserMessage: '',
  isSubmitting: false,
}

const POLLING_INTERVAL_MS = 1500
const BACKEND_ORIGIN = 'http://localhost:8000'
const STORAGE_KEY = 'file_converter_upload_state_v2'
const DISMISSED_FAILED_FILE_IDS_KEY = 'file_converter_dismissed_failed_file_ids_v1'

type ConvertedFileStatusLabel = '완료' | '변환 중' | '실패'
type ConvertedFileStatusVariant = 'done' | 'processing' | 'failed'

function getStageLabel(stage: BackendFileStage): string {
  const stageMap: Record<BackendFileStage, string> = {
    uploaded: '업로드 중',
    extracting: '이미지 추출',
    describing: '이미지 설명 생성',
    generating_docx: 'docx 형식으로 내용 병합',
    completed: '완료',
    failed: '실패',
  }
  return stageMap[stage]
}

function getProgressByStage(
  stage: BackendFileStage,
  processedImages: number,
  totalImages: number,
  previousProgress: number,
): number {
  if (stage === 'uploaded') return 10
  if (stage === 'extracting') return 20
  if (stage === 'generating_docx') return 90
  if (stage === 'completed') return 100
  if (stage === 'failed') return previousProgress

  if (stage === 'describing') {
    if (totalImages <= 0) return Math.max(previousProgress, 20)
    const ratio = Math.max(0, Math.min(1, processedImages / totalImages))
    return Math.round(20 + ratio * 60)
  }

  return previousProgress
}

function mapErrorCodeToUserMessage(errorMessage: string): string {
  if (!errorMessage.trim()) {
    return '변환 중 오류가 발생했습니다.'
  }
  const [rawCode] = errorMessage.split(':')
  const normalizedCode = rawCode.trim()
  const codeMap: Record<string, string> = {
    EXTRACTION_FAILED: '파일 내용 추출 중 오류가 발생했습니다.',
    AI_REQUEST_FAILED: '이미지 설명 생성 중 오류가 발생했습니다.',
    DOCX_GENERATION_FAILED: '문서 생성 중 오류가 발생했습니다.',
    PIPELINE_FAILED: '변환 처리 중 오류가 발생했습니다.',
  }
  return codeMap[normalizedCode] ?? '변환 중 오류가 발생했습니다.'
}

function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB'] as const
  let value = sizeInBytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
}

function pickLatestItem(items: BackendFileListItemResponse[]): BackendFileListItemResponse | null {
  if (items.length === 0) return null
  const sortedItems = sortRecentFiles(items)
  return sortedItems[0] ?? null
}

function sortRecentFiles(items: BackendFileListItemResponse[]): BackendFileListItemResponse[] {
  return [...items].sort((a, b) => {
    const aTime = Date.parse(a.created_at)
    const bTime = Date.parse(b.created_at)
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0
    if (Number.isNaN(aTime)) return 1
    if (Number.isNaN(bTime)) return -1
    return bTime - aTime
  })
}

function getConvertedFileStatusMeta(item: BackendFileListItemResponse): {
  label: ConvertedFileStatusLabel
  variant: ConvertedFileStatusVariant
} {
  if (item.status === 'failed' || item.current_stage === 'failed') {
    return { label: '실패', variant: 'failed' }
  }
  if (item.status === 'done' && item.result_ready) {
    return { label: '완료', variant: 'done' }
  }
  return { label: '변환 중', variant: 'processing' }
}

function formatRelativeCreatedAt(createdAt: string): string {
  const createdAtTime = Date.parse(createdAt)
  if (Number.isNaN(createdAtTime)) {
    return '방금 전'
  }

  const diffMs = Date.now() - createdAtTime
  if (diffMs < 60 * 1000) {
    return '방금 전'
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  if (diffMinutes < 60) {
    return `${Math.max(diffMinutes, 1)}분 전`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  return `${Math.max(diffHours, 1)}시간 전`
}

function toDocxFileName(originalFileName: string): string {
  return `${originalFileName.replace(/\.[^/.]+$/, '')}.docx`
}

async function downloadConvertedFile(downloadUrl: string, originalFileName: string): Promise<void> {
  const absoluteDownloadUrl = downloadUrl.startsWith('http') ? downloadUrl : `${BACKEND_ORIGIN}${downloadUrl}`
  const response = await fetch(absoluteDownloadUrl, {
    method: 'GET',
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`다운로드에 실패했습니다. (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = toDocxFileName(originalFileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

function toPersistedState(state: ConversionState): PersistedConversionState {
  return {
    fileId: state.fileId,
    fileName: state.fileName,
    fileSize: state.fileSize,
    status: state.status,
    currentStage: state.currentStage,
    progress: state.progress,
    downloadUrl: state.downloadUrl,
    errorMessage: state.errorMessage,
    errorUserMessage: state.errorUserMessage,
  }
}

function readDismissedFailedFileIds(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_FAILED_FILE_IDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const validIds = parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    return Array.from(new Set(validIds))
  } catch {
    return []
  }
}

function writeDismissedFailedFileIds(fileIds: string[]): void {
  const uniqueIds = Array.from(new Set(fileIds.filter((fileId) => fileId.trim().length > 0)))
  localStorage.setItem(DISMISSED_FAILED_FILE_IDS_KEY, JSON.stringify(uniqueIds))
}

function isFailedFileDismissed(fileId: string): boolean {
  if (!fileId.trim()) return false
  return readDismissedFailedFileIds().includes(fileId)
}

function dismissFailedFile(fileId: string): void {
  if (!fileId.trim()) return
  const dismissedIds = readDismissedFailedFileIds()
  if (dismissedIds.includes(fileId)) return
  writeDismissedFailedFileIds([...dismissedIds, fileId])
}

function readPersistedState(): PersistedConversionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedConversionState
    if (!parsed.fileId && parsed.status === 'converting') return null
    return parsed
  } catch {
    return null
  }
}

function toConversionStateFromPersisted(persisted: PersistedConversionState): ConversionState {
  return {
    ...DEFAULT_STATE,
    fileId: persisted.fileId,
    fileName: persisted.fileName,
    fileSize: persisted.fileSize,
    status: persisted.status,
    currentStage: persisted.currentStage,
    progress: persisted.progress,
    downloadUrl: persisted.downloadUrl,
    errorMessage: persisted.errorMessage,
    errorUserMessage: persisted.errorUserMessage,
  }
}

function UploadSection() {
  const [conversionState, setConversionState] = useState<ConversionState>(DEFAULT_STATE)
  const [convertedFiles, setConvertedFiles] = useState<BackendFileListItemResponse[]>([])
  const [isConvertedFilesLoading, setIsConvertedFilesLoading] = useState<boolean>(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const hasHydratedRef = useRef(false)
  const hasLoadedListRef = useRef(false)

  const refreshConvertedFiles = useCallback(async (): Promise<void> => {
    if (!hasLoadedListRef.current) {
      setIsConvertedFilesLoading(true)
    }
    try {
      const recentItems = await getRecentFiles()
      setConvertedFiles(sortRecentFiles(recentItems))
    } catch {
      // 목록 조회 실패 시 기존 목록을 유지한다.
    } finally {
      hasLoadedListRef.current = true
      setIsConvertedFilesLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    const restoreState = async (): Promise<void> => {
      const persistedFallback = readPersistedState()

      try {
        const recentItems = await getRecentFiles()
        if (isCancelled) return
        setConvertedFiles(sortRecentFiles(recentItems))
        hasLoadedListRef.current = true
        setIsConvertedFilesLoading(false)

        const latestItem = pickLatestItem(recentItems)
        if (latestItem) {
          if (latestItem.status === 'done' && latestItem.result_ready) {
            setConversionState({
              ...DEFAULT_STATE,
              status: 'success',
              fileId: latestItem.file_id,
              fileName: latestItem.original_name,
              currentStage: 'completed',
              progress: 100,
              downloadUrl: latestItem.download_url,
            })
            hasHydratedRef.current = true
            return
          }

          if (latestItem.status === 'failed' || latestItem.current_stage === 'failed') {
            if (isFailedFileDismissed(latestItem.file_id)) {
              setConversionState(DEFAULT_STATE)
              hasHydratedRef.current = true
              return
            }

            let detailedErrorMessage =
              persistedFallback?.errorMessage ?? 'PIPELINE_FAILED: 변환 처리 중 오류가 발생했습니다.'

            try {
              const statusResponse = await getFileStatus(latestItem.file_id)
              detailedErrorMessage = statusResponse.error_message ?? detailedErrorMessage
            } catch {
              // 상세 상태 조회가 실패하면 기존 메시지를 유지한다.
            }

            setConversionState({
              ...DEFAULT_STATE,
              status: 'error',
              fileId: latestItem.file_id,
              fileName: latestItem.original_name,
              currentStage: 'failed',
              progress: Math.max(persistedFallback?.progress ?? 0, 10),
              downloadUrl: latestItem.download_url,
              errorMessage: detailedErrorMessage,
              errorUserMessage: mapErrorCodeToUserMessage(detailedErrorMessage),
            })
            hasHydratedRef.current = true
            return
          }

          if (latestItem.status === 'queued' || latestItem.status === 'processing') {
            const initialProgress = getProgressByStage(
              latestItem.current_stage,
              latestItem.processed_images,
              latestItem.total_images,
              persistedFallback?.progress ?? 0,
            )

            setConversionState({
              ...DEFAULT_STATE,
              status: 'converting',
              fileId: latestItem.file_id,
              fileName: latestItem.original_name,
              currentStage: latestItem.current_stage,
              progress: Math.max(initialProgress, persistedFallback?.progress ?? 0),
            })
            hasHydratedRef.current = true
            return
          }
        }
      } catch {
        // 서버 복구 실패 시 localStorage fallback으로 진행한다.
        setIsConvertedFilesLoading(false)
      }

      if (
        persistedFallback &&
        !(persistedFallback.status === 'error' && isFailedFileDismissed(persistedFallback.fileId))
      ) {
        setConversionState(toConversionStateFromPersisted(persistedFallback))
      }
      hasHydratedRef.current = true
    }

    void restoreState()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hasHydratedRef.current) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersistedState(conversionState)))
  }, [conversionState])

  useEffect(() => {
    if (!hasHydratedRef.current) return
    if (conversionState.status !== 'converting' || !conversionState.fileId) {
      return
    }

    let isCancelled = false

    const fetchStatus = async (): Promise<void> => {
      try {
        const response = await getFileStatus(conversionState.fileId)
        if (isCancelled) return
        void refreshConvertedFiles()

        setConversionState((prevState) => {
          if (response.status === 'failed' || response.current_stage === 'failed') {
            const rawErrorMessage =
              response.error_message ?? 'PIPELINE_FAILED: 변환 처리 중 오류가 발생했습니다.'
            return {
              ...prevState,
              status: 'error',
              currentStage: 'failed',
              progress: prevState.progress,
              errorMessage: rawErrorMessage,
              errorUserMessage: mapErrorCodeToUserMessage(rawErrorMessage),
              isSubmitting: false,
            }
          }

          if (response.result_ready) {
            return {
              ...prevState,
              status: 'success',
              currentStage: 'completed',
              progress: 100,
              downloadUrl: response.download_url,
              errorMessage: '',
              errorUserMessage: '',
              isSubmitting: false,
            }
          }

          const nextProgress = getProgressByStage(
            response.current_stage,
            response.processed_images,
            response.total_images,
            prevState.progress,
          )

          return {
            ...prevState,
            status: 'converting',
            currentStage: response.current_stage,
            progress: Math.max(prevState.progress, nextProgress),
            errorMessage: '',
            errorUserMessage: '',
            isSubmitting: false,
          }
        })
      } catch (error) {
        if (isCancelled) return
        const message = error instanceof Error ? error.message : '상태 조회 중 오류가 발생했습니다.'
        setConversionState((prevState) => ({
          ...prevState,
          status: 'error',
          currentStage: 'failed',
          progress: prevState.progress,
          errorMessage: message,
          errorUserMessage: '변환 상태를 확인하는 중 오류가 발생했습니다.',
          isSubmitting: false,
        }))
      }
    }

    void fetchStatus()
    const intervalId = window.setInterval(() => {
      void fetchStatus()
    }, POLLING_INTERVAL_MS)

    return () => {
      isCancelled = true
      window.clearInterval(intervalId)
    }
  }, [conversionState.status, conversionState.fileId, refreshConvertedFiles])

  useEffect(() => {
    if (!hasHydratedRef.current) return
    if (conversionState.status === 'success' || conversionState.status === 'error') {
      void refreshConvertedFiles()
    }
  }, [conversionState.status, refreshConvertedFiles])

  const handleSelectButtonClick = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return
    setConversionState({
      ...DEFAULT_STATE,
      status: 'file_selected',
      selectedFile,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      currentStage: 'uploaded',
      progress: 0,
      isSubmitting: false,
    })
  }

  const handleStartConversion = async (): Promise<void> => {
    if (!conversionState.selectedFile || conversionState.isSubmitting) return

    setConversionState((prevState) => ({
      ...prevState,
      isSubmitting: true,
      errorMessage: '',
      errorUserMessage: '',
    }))

    try {
      const uploadResponse = await uploadFile(conversionState.selectedFile)
      setConversionState((prevState) => ({
        ...prevState,
        status: 'converting',
        fileId: uploadResponse.file_id,
        currentStage: uploadResponse.current_stage,
        progress: getProgressByStage(uploadResponse.current_stage, 0, 0, prevState.progress),
        errorMessage: '',
        errorUserMessage: '',
        isSubmitting: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.'
      setConversionState((prevState) => ({
        ...prevState,
        status: 'error',
        currentStage: 'failed',
        progress: prevState.progress,
        errorMessage: message,
        errorUserMessage: '파일 업로드 중 오류가 발생했습니다.',
        isSubmitting: false,
      }))
    }
  }

  const handleRetry = async (): Promise<void> => {
    if (!conversionState.selectedFile) {
      setConversionState(DEFAULT_STATE)
      return
    }
    await handleStartConversion()
  }

  const handleReset = (): void => {
    if (conversionState.status === 'error' && conversionState.fileId) {
      dismissFailedFile(conversionState.fileId)
    }
    setConversionState(DEFAULT_STATE)
    localStorage.removeItem(STORAGE_KEY)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = async (): Promise<void> => {
    if (!conversionState.downloadUrl) return

    try {
      await downloadConvertedFile(conversionState.downloadUrl, conversionState.fileName)
    } catch (error) {
      const message = error instanceof Error ? error.message : '다운로드 중 오류가 발생했습니다.'
      setConversionState((prevState) => ({
        ...prevState,
        status: 'error',
        currentStage: 'failed',
        progress: prevState.progress,
        errorMessage: message,
        errorUserMessage: '다운로드 중 오류가 발생했습니다.',
      }))
    }
  }

  const handleListItemDownload = async (item: BackendFileListItemResponse): Promise<void> => {
    if (!item.download_url) return

    try {
      await downloadConvertedFile(item.download_url, item.original_name)
    } catch (error) {
      const message = error instanceof Error ? error.message : '다운로드 중 오류가 발생했습니다.'
      setConversionState((prevState) => ({
        ...prevState,
        status: 'error',
        currentStage: 'failed',
        progress: prevState.progress,
        errorMessage: message,
        errorUserMessage: '다운로드 중 오류가 발생했습니다.',
      }))
    }
  }

  const handleListItemDelete = (fileId: string): void => {
    // TODO: 백엔드 삭제 API가 추가되면 이 핸들러에서 서버 삭제를 먼저 호출한다.
    setConvertedFiles((prevItems) => prevItems.filter((item) => item.file_id !== fileId))
  }

  return (
    <section className="upload-section" aria-labelledby="upload-section-title">
      <div className="upload-box">
        <input
          ref={fileInputRef}
          type="file"
          className="upload-file-input-hidden"
          multiple={false}
          accept=".pdf,.pptx"
          onChange={handleFileChange}
          aria-label="파일 선택"
        />

        {conversionState.status === 'idle' && (
          <div className="upload-panel-group">
            <div className="upload-icon-circle" aria-hidden="true">
              <svg className="upload-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 16V5M12 5L7.5 9.5M12 5L16.5 9.5M5 14.5V18C5 18.6 5.4 19 6 19H18C18.6 19 19 18.6 19 18V14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 id="upload-section-title" className="upload-box-title">
              파일을 드래그하거나 클릭하여 업로드
            </h2>
            <p className="upload-box-support-text">최대 100MB까지 지원</p>
            <button type="button" className="upload-select-button" onClick={handleSelectButtonClick}>
              파일 선택
            </button>
          </div>
        )}

        {conversionState.status === 'file_selected' && (
          <div className="upload-panel-group upload-panel-selected">
            <div className="upload-icon-circle" aria-hidden="true">
              <svg className="upload-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 16V5M12 5L7.5 9.5M12 5L16.5 9.5M5 14.5V18C5 18.6 5.4 19 6 19H18C18.6 19 19 18.6 19 18V14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="selected-file-name">{conversionState.fileName}</p>
            <p className="selected-file-size">{formatFileSize(conversionState.fileSize)}</p>

            <div className="selected-action-row">
              <button type="button" className="upload-select-button" onClick={handleSelectButtonClick}>
                파일 다시 선택
              </button>
              <button
                type="button"
                className="convert-start-button"
                onClick={() => {
                  void handleStartConversion()
                }}
                aria-label="변환 시작"
                disabled={conversionState.isSubmitting}
              >
                {conversionState.isSubmitting ? '업로드 중...' : '변환 시작'}
              </button>
            </div>
          </div>
        )}

        {conversionState.status === 'converting' && (
          <div className="upload-panel-group upload-panel-converting">
            <div className="progress-spinner" aria-hidden="true" />
            <h2 className="upload-box-title">변환 중...</h2>
            <p className="upload-box-support-text">{conversionState.fileName} 파일을 변환하고 있습니다.</p>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${conversionState.progress}%` }} />
            </div>
            <p className="progress-percent-text">{Math.round(conversionState.progress)}%</p>
            <p className="progress-stage-text">{getStageLabel(conversionState.currentStage)}</p>
          </div>
        )}

        {conversionState.status === 'success' && (
          <div className="upload-panel-group upload-panel-result">
            <div className="result-icon success-icon" aria-hidden="true">
              ✓
            </div>
            <h2 className="upload-box-title">변환 완료!</h2>
            <p className="upload-box-support-text">파일이 성공적으로 변환되었습니다</p>

            <div className="selected-action-row">
              <button type="button" className="convert-start-button" onClick={handleDownload}>
                다운로드
              </button>
              <button type="button" className="upload-select-button secondary-action-button" onClick={handleReset}>
                새 파일 변환
              </button>
            </div>
          </div>
        )}

        {conversionState.status === 'error' && (
          <div className="upload-panel-group upload-panel-result">
            <div className="result-icon error-icon" aria-hidden="true">
              !
            </div>
            <h2 className="upload-box-title">변환 실패</h2>
            <p className="upload-box-support-text error-user-message">
              {conversionState.errorUserMessage || '변환 중 문제가 발생했습니다. 다시 시도해주세요.'}
            </p>
            <p className="error-detail-message">{conversionState.errorMessage}</p>

            <div className="selected-action-row">
              <button
                type="button"
                className="convert-start-button"
                onClick={() => {
                  void handleRetry()
                }}
              >
                다시 시도
              </button>
              <button type="button" className="upload-select-button secondary-action-button" onClick={handleReset}>
                새 파일 선택
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="converted-file-list-card" aria-labelledby="converted-file-list-title">
        <h3 id="converted-file-list-title" className="converted-file-list-title">
          변환된 파일 목록
        </h3>

        {isConvertedFilesLoading ? (
          <p className="converted-file-list-empty">목록을 불러오는 중...</p>
        ) : convertedFiles.length === 0 ? (
          <p className="converted-file-list-empty">아직 변환된 파일이 없습니다.</p>
        ) : (
          <ul className="converted-file-list" aria-label="변환된 파일 목록">
            {convertedFiles.map((item) => {
              const statusMeta = getConvertedFileStatusMeta(item)
              const isDownloadEnabled = Boolean(item.download_url)
              return (
                <li key={item.file_id} className="converted-file-list-item">
                  <div className="converted-file-main">
                    <div className="converted-file-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M7 3H14L19 8V20C19 20.55 18.55 21 18 21H7C6.45 21 6 20.55 6 20V4C6 3.45 6.45 3 7 3Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M14 3V8H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="converted-file-text">
                      <p className="converted-file-name">{item.original_name}</p>
                      <div className="converted-file-meta-row">
                        <span className="converted-file-format">PDF → DOCX</span>
                        <span className="converted-file-time">{formatRelativeCreatedAt(item.created_at)}</span>
                        <span className={`converted-file-status-badge is-${statusMeta.variant}`}>{statusMeta.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="converted-file-actions">
                    <button
                      type="button"
                      className="converted-file-action-button"
                      aria-label={`${item.original_name} 다운로드`}
                      disabled={!isDownloadEnabled}
                      onClick={() => {
                        void handleListItemDownload(item)
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path
                          d="M12 4V14M12 14L8 10M12 14L16 10M5 17V19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19V17"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="converted-file-action-button danger"
                      aria-label={`${item.original_name} 목록에서 삭제`}
                      onClick={() => {
                        handleListItemDelete(item.file_id)
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path
                          d="M4 7H20M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7M18 7L17.2 19.2C17.16 19.67 16.77 20.03 16.3 20.03H7.7C7.23 20.03 6.84 19.67 6.8 19.2L6 7M10 11V17M14 11V17"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default UploadSection
