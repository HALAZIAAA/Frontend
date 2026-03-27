import { useEffect, useRef, useState } from 'react'
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
  const sortedItems = [...items].sort((a, b) => {
    const aTime = Date.parse(a.created_at)
    const bTime = Date.parse(b.created_at)
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0
    return bTime - aTime
  })
  return sortedItems[0] ?? null
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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const hasHydratedRef = useRef(false)

  useEffect(() => {
    let isCancelled = false

    const restoreState = async (): Promise<void> => {
      const persistedFallback = readPersistedState()

      try {
        const recentItems = await getRecentFiles()
        if (isCancelled) return

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
      }

      if (persistedFallback) {
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
  }, [conversionState.status, conversionState.fileId])

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
    setConversionState(DEFAULT_STATE)
    localStorage.removeItem(STORAGE_KEY)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = async (): Promise<void> => {
    if (!conversionState.downloadUrl) return

    try {
      const absoluteDownloadUrl = conversionState.downloadUrl.startsWith('http')
        ? conversionState.downloadUrl
        : `${BACKEND_ORIGIN}${conversionState.downloadUrl}`
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
      link.download = `${conversionState.fileName.replace(/\.[^/.]+$/, '')}.docx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
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
    </section>
  )
}

export default UploadSection
