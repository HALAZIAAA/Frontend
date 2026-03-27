import { useEffect, useMemo, useRef, useState } from 'react'

type ConversionStatus = 'idle' | 'file_selected' | 'converting' | 'success' | 'error'
type ConversionStage =
  | 'uploading'
  | 'extracting_images'
  | 'generating_descriptions'
  | 'formatting_document'
  | 'merging_docx'
  | 'completed'
  | 'failed'

type MockFailStage = ConversionStage | 'none'
type TargetFormat = 'DOCX' | 'TXT' | 'PDF'

type StoredConversionState = {
  status: ConversionStatus
  stage: ConversionStage
  progress: number
  fileName: string
  fileSize: number
  sourceFormat: string
  targetFormat: TargetFormat
  startedAt: number | null
  errorMessage: string
  mockFailStage: MockFailStage
}

type StageConfig = {
  stage: Exclude<ConversionStage, 'completed' | 'failed'>
  durationMs: number
  targetProgress: number
}

const STORAGE_KEY = 'file_converter_conversion_state_v1'
const STAGE_SEQUENCE: StageConfig[] = [
  { stage: 'uploading', durationMs: 1800, targetProgress: 18 },
  { stage: 'extracting_images', durationMs: 1800, targetProgress: 36 },
  { stage: 'generating_descriptions', durationMs: 2200, targetProgress: 58 },
  { stage: 'formatting_document', durationMs: 2200, targetProgress: 80 },
  { stage: 'merging_docx', durationMs: 1800, targetProgress: 96 },
]

const DEFAULT_STATE: StoredConversionState = {
  status: 'idle',
  stage: 'uploading',
  progress: 0,
  fileName: '',
  fileSize: 0,
  sourceFormat: 'PDF',
  targetFormat: 'DOCX',
  startedAt: null,
  errorMessage: '',
  mockFailStage: 'none',
}

function getStageLabel(stage: ConversionStage): string {
  const stageMap: Record<ConversionStage, string> = {
    uploading: '업로드 중',
    extracting_images: '이미지 추출',
    generating_descriptions: '이미지 설명 생성',
    formatting_document: 'llm으로 문서 형식 정리',
    merging_docx: 'docx 형식으로 내용 병합',
    completed: '완료',
    failed: '실패',
  }
  return stageMap[stage]
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

function getSourceFormat(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex === -1 || dotIndex === fileName.length - 1) {
    return 'UNKNOWN'
  }
  return fileName.slice(dotIndex + 1).toUpperCase()
}

function getStoredState(): StoredConversionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as StoredConversionState
    return {
      ...DEFAULT_STATE,
      ...parsed,
    }
  } catch {
    return DEFAULT_STATE
  }
}

function getStageSnapshot(
  startedAt: number,
  mockFailStage: MockFailStage,
): Pick<StoredConversionState, 'status' | 'stage' | 'progress' | 'errorMessage'> {
  const elapsedMs = Date.now() - startedAt
  let passedMs = 0
  let previousProgress = 0

  for (const config of STAGE_SEQUENCE) {
    const stageStartMs = passedMs
    const stageEndMs = passedMs + config.durationMs

    if (elapsedMs <= stageEndMs) {
      const ratioInStage = Math.max(0, (elapsedMs - stageStartMs) / config.durationMs)
      const progress = Math.min(
        config.targetProgress,
        previousProgress + (config.targetProgress - previousProgress) * ratioInStage,
      )

      if (mockFailStage === config.stage && ratioInStage >= 0.5) {
        return {
          status: 'error',
          stage: 'failed',
          progress: Math.max(progress, previousProgress + 4),
          errorMessage: `${getStageLabel(config.stage)} 단계에서 오류가 발생했습니다.`,
        }
      }

      return {
        status: 'converting',
        stage: config.stage,
        progress,
        errorMessage: '',
      }
    }

    passedMs = stageEndMs
    previousProgress = config.targetProgress
  }

  return {
    status: 'success',
    stage: 'completed',
    progress: 100,
    errorMessage: '',
  }
}

function UploadSection() {
  const [conversionState, setConversionState] = useState<StoredConversionState>(DEFAULT_STATE)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const stageText = useMemo(() => {
    if (conversionState.status !== 'converting') return ''
    return getStageLabel(conversionState.stage)
  }, [conversionState.status, conversionState.stage])

  useEffect(() => {
    const restoredState = getStoredState()
    if (restoredState.status === 'converting' && restoredState.startedAt) {
      const liveSnapshot = getStageSnapshot(restoredState.startedAt, restoredState.mockFailStage)
      const mergedState: StoredConversionState = {
        ...restoredState,
        ...liveSnapshot,
        startedAt: liveSnapshot.status === 'converting' ? restoredState.startedAt : null,
      }
      setConversionState(mergedState)
      return
    }
    setConversionState(restoredState)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversionState))
  }, [conversionState])

  useEffect(() => {
    if (conversionState.status !== 'converting' || !conversionState.startedAt) {
      return
    }

    const timer = window.setInterval(() => {
      setConversionState((prevState) => {
        if (prevState.status !== 'converting' || !prevState.startedAt) {
          return prevState
        }
        const snapshot = getStageSnapshot(prevState.startedAt, prevState.mockFailStage)
        return {
          ...prevState,
          ...snapshot,
          startedAt: snapshot.status === 'converting' ? prevState.startedAt : null,
        }
      })
    }, 300)

    return () => window.clearInterval(timer)
  }, [conversionState.status, conversionState.startedAt])

  const handleSelectButtonClick = (): void => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return
    const sourceFormat = getSourceFormat(selectedFile.name)
    setConversionState({
      ...DEFAULT_STATE,
      status: 'file_selected',
      stage: 'uploading',
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      sourceFormat,
    })
  }

  const handleTargetFormatChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const nextFormat = event.target.value as TargetFormat
    setConversionState((prevState) => ({
      ...prevState,
      targetFormat: nextFormat,
    }))
  }

  const handleMockFailChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedStage = event.target.value as MockFailStage
    setConversionState((prevState) => ({
      ...prevState,
      mockFailStage: selectedStage,
    }))
  }

  const handleStartConversion = (): void => {
    setConversionState((prevState) => ({
      ...prevState,
      status: 'converting',
      stage: 'uploading',
      progress: 5,
      errorMessage: '',
      startedAt: Date.now(),
    }))
  }

  const handleRetry = (): void => {
    setConversionState((prevState) => ({
      ...prevState,
      status: 'converting',
      stage: 'uploading',
      progress: 5,
      errorMessage: '',
      startedAt: Date.now(),
    }))
  }

  const handleReset = (): void => {
    setConversionState(DEFAULT_STATE)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = (): void => {
    // Mock mode: backend 연동 전까지는 UI 동작만 유지한다.
    window.alert('다운로드 기능은 백엔드 연동 후 활성화됩니다.')
  }

  return (
    <section className="upload-section" aria-labelledby="upload-section-title">
      <div className="upload-box">
        <input
          ref={fileInputRef}
          type="file"
          className="upload-file-input-hidden"
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

            <div className="format-row">
              <span className="format-item">{conversionState.sourceFormat}</span>
              <span className="format-arrow" aria-hidden="true">
                →
              </span>
              <label className="target-format-label">
                <span className="sr-only">변환 대상 형식</span>
                <select
                  value={conversionState.targetFormat}
                  onChange={handleTargetFormatChange}
                  className="target-format-select"
                >
                  <option value="DOCX">DOCX</option>
                  <option value="PDF">PDF</option>
                  <option value="TXT">TXT</option>
                </select>
              </label>
            </div>

            <label className="mock-fail-label">
              실패 테스트 스테이지
              <select
                value={conversionState.mockFailStage}
                onChange={handleMockFailChange}
                className="mock-fail-select"
              >
                <option value="none">실패 없음</option>
                <option value="uploading">업로드 중</option>
                <option value="extracting_images">이미지 추출</option>
                <option value="generating_descriptions">이미지 설명 생성</option>
                <option value="formatting_document">llm으로 문서 형식 정리</option>
                <option value="merging_docx">docx 형식으로 내용 병합</option>
              </select>
            </label>

            <div className="selected-action-row">
              <button type="button" className="upload-select-button" onClick={handleSelectButtonClick}>
                파일 다시 선택
              </button>
              <button type="button" className="convert-start-button" onClick={handleStartConversion}>
                변환 시작
              </button>
            </div>
          </div>
        )}

        {conversionState.status === 'converting' && (
          <div className="upload-panel-group upload-panel-converting">
            <div className="progress-spinner" aria-hidden="true" />
            <h2 className="upload-box-title">변환 중...</h2>
            <p className="upload-box-support-text">
              {conversionState.fileName} 파일을 {conversionState.targetFormat} 형식으로 변환하고 있습니다.
            </p>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${conversionState.progress}%` }} />
            </div>
            <p className="progress-percent-text">{Math.round(conversionState.progress)}%</p>
            <p className="progress-stage-text">{stageText}</p>
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
            <p className="upload-box-support-text">
              {conversionState.errorMessage || '변환 중 문제가 발생했습니다. 다시 시도해주세요.'}
            </p>

            <div className="selected-action-row">
              <button type="button" className="convert-start-button" onClick={handleRetry}>
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
