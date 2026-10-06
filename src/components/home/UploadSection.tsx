import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CheckIcon,
  FilePdfIcon,
  FilePptIcon,
  FileTextIcon,
  TrashIcon,
  UploadSimpleIcon,
  XIcon,
} from '@phosphor-icons/react'
// [DEMO] 데모 복원 시 아래 fileApi import 를 주석 처리하고 fileMockApi import 주석 해제
// import { getFileStatus, getRecentFiles, uploadFile } from '../../api/fileMockApi'
import {
  BACKEND_ORIGIN,
  cancelFile,
  deleteFile,
  getFileStatus,
  getRecentFiles,
  retryFile,
  uploadFile,
} from '../../api/fileApi'
import { useAuth } from '../../lib/auth'
import { useFeedback } from '../../lib/feedback'
// [DEMO] 슬라이드 이미지 — 데모 복원 시 주석 해제
// import { DEMO_SLIDES } from '../../lib/demoSlides'
import type {
  BackendFileListItemResponse,
  BackendFileStage,
  BackendFileStatusResponse,
  ResultFileFormat,
} from '../../types/fileConverter'
import { SkeletonList } from '../common/Skeleton'
import EmptyState from '../common/EmptyState'

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
  availableFormats: ResultFileFormat[]
  warnings: string[]
  startedAtMs: number | null
  speedSample: SpeedSample | null
  remainingSeconds: number | null
  // 그림 설명 단계에서 몇 장 중 몇 장을 마쳤는지. 상태 응답을 받기 전에는 null
  imageCounts: { processed: number; total: number } | null
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
  availableFormats: ResultFileFormat[]
  warnings: string[]
  startedAtMs: number | null
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
  availableFormats: [],
  warnings: [],
  startedAtMs: null,
  speedSample: null,
  remainingSeconds: null,
  imageCounts: null,
  errorMessage: '',
  errorUserMessage: '',
  isSubmitting: false,
}

// 백엔드가 available_formats 를 주지 않으면(예전 응답·목업) 둘 다 있는 것으로 본다.
const RESULT_FORMATS: ResultFileFormat[] = ['docx', 'txt']

const POLLING_INTERVAL_MS = 1500
const STORAGE_KEY = 'file_converter_upload_state_v2'

type ConvertedFileStatusLabel = '완료' | '일부 완료' | '변환 중' | '실패' | '변환 중지'
type ConvertedFileStatusVariant = 'done' | 'processing' | 'failed' | 'cancelled'

function getStageLabel(stage: BackendFileStage): string {
  const stageMap: Record<BackendFileStage, string> = {
    queued: '대기 중',
    uploaded: '업로드 중',
    extracting: '이미지 추출',
    ocr: '글자 인식(OCR)',
    describing: '이미지 설명 생성',
    refining: '원고 정리',
    generating_docx: '결과 문서(DOCX·TXT) 생성',
    completed: '완료',
    failed: '실패',
    cancelling: '변환 중지 중',
    cancelled: '변환 중지됨',
    delete_failed: '파일 정리 실패',
  }
  return stageMap[stage]
}

const ACCEPTED_EXTENSIONS = ['pdf', 'pptx']

function extensionOf(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

// 진행 화면의 단계 표시. 백엔드는 PDF만 글자 인식(ocr)을 거친다.
type StepStage = 'extracting' | 'ocr' | 'describing' | 'refining' | 'generating_docx'
const STEP_LABELS: Record<StepStage, string> = {
  extracting: '추출',
  ocr: '글자 인식',
  describing: '설명',
  refining: '정리',
  generating_docx: '문서 생성',
}

function stepsFor(fileName: string): StepStage[] {
  const steps: StepStage[] = ['extracting', 'ocr', 'describing', 'refining', 'generating_docx']
  return extensionOf(fileName) === 'pdf' ? steps : steps.filter((step) => step !== 'ocr')
}

function getProgressByStage(
  stage: BackendFileStage,
  processedImages: number,
  totalImages: number,
  previousProgress: number,
): number {
  if (stage === 'queued') return 5
  if (stage === 'uploaded') return 10
  if (stage === 'extracting') return 20
  if (stage === 'ocr') return 25
  if (stage === 'refining') return 85
  if (stage === 'generating_docx') return 90
  if (stage === 'completed') return 100

  if (stage === 'describing') {
    if (totalImages <= 0) return Math.max(previousProgress, 25)
    const ratio = Math.max(0, Math.min(1, processedImages / totalImages))
    return Math.round(25 + ratio * 55)
  }

  // 실패·중지 단계에서는 진행률을 되돌리지 않는다.
  return previousProgress
}

// 이미지 설명 속도를 재기 시작한 시점. 추출·OCR 시간이 섞이지 않게 따로 잡는다.
type SpeedSample = { atMs: number; processed: number }

function estimateRemainingSeconds(
  response: BackendFileStatusResponse,
  now: number,
  startedAtMs: number,
  sample: SpeedSample | null,
): number | null {
  const processed = response.processed_images
  const total = response.total_images

  // 이미지가 실제로 처리되고 있으면 이번 변환의 속도로 계산한다.
  if (sample && total > 0 && processed > sample.processed) {
    const perImage = (now - sample.atMs) / 1000 / (processed - sample.processed)
    return Math.max(0, Math.round(perImage * (total - processed)))
  }

  // 그 전에는 백엔드가 준 과거 기록 기반 예상치에서 지난 시간을 뺀다.
  if (response.estimated_seconds != null) {
    return Math.max(0, Math.round(response.estimated_seconds - (now - startedAtMs) / 1000))
  }

  return null
}

function smoothRemaining(previous: number | null, next: number | null): number | null {
  if (next === null || previous === null) return next
  // 남은 시간은 줄어드는 게 자연스럽다. 크게 늘어날 때만 새 값을 그대로 받는다.
  return next > previous * 1.3 ? next : Math.min(previous, next)
}

// '2/10'은 스크린리더가 '2 슬래시 10'처럼 읽어서 말로 풀어 쓴다.
function formatImageCounts(state: ConversionState): string | null {
  if (state.currentStage !== 'describing' || !state.imageCounts || state.imageCounts.total <= 0) return null
  const { processed, total } = state.imageCounts
  return `이미지 ${total}장 중 ${Math.min(processed, total)}장 완료`
}

function formatRemaining(seconds: number): string {
  if (seconds < 60) return '남은 시간 1분 이내'
  return `남은 시간 약 ${Math.round(seconds / 60)}분`
}

// 스크린리더에 알릴 문장. 단계 이름처럼 가끔 바뀌는 것만 담는다.
function getStatusAnnouncement(state: ConversionState): string {
  if (state.status === 'converting') return `변환 단계: ${getStageLabel(state.currentStage)}`
  if (state.status === 'success') {
    return state.availableFormats.includes('docx')
      ? '변환 완료. DOCX와 TXT 파일을 받을 수 있습니다.'
      : '변환 완료. DOCX를 만들지 못해 TXT 파일만 받을 수 있습니다.'
  }
  if (state.status === 'error') {
    return `변환 실패. ${state.errorUserMessage || '다시 시도해 주세요.'}`
  }
  return ''
}

function mapErrorCodeToUserMessage(errorMessage: string): string {
  if (!errorMessage.trim()) {
    return '변환 중 오류가 발생했습니다.'
  }
  const [rawCode] = errorMessage.split(':')
  const normalizedCode = rawCode.trim()
  const codeMap: Record<string, string> = {
    EXTRACTION_FAILED: '파일 내용 추출 중 오류가 발생했습니다.',
    OCR_FAILED: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    REFINE_REQUEST_FAILED: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    POSTPROCESS_FAILED: 'AI 분석은 끝났지만 결과 파일을 만드는 중 오류가 발생했습니다.',
    TXT_GENERATION_FAILED: 'AI 분석은 끝났지만 결과 파일을 만드는 중 오류가 발생했습니다.',
    TXT_WRITE_FAILED: 'AI 분석은 끝났지만 결과 파일을 저장하지 못했습니다.',
    // 예전 기록에만 남는 코드. 지금은 DOCX만 실패하면 TXT를 제공한다.
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

function formatLabelOf(item: BackendFileListItemResponse): string {
  const source = (item.file_type ?? extensionOf(item.original_name)).toUpperCase()
  const targets = availableFormatsOf(item).map((format) => format.toUpperCase()).join('·')
  return `${source} → ${targets}`
}

function availableFormatsOf(item: BackendFileListItemResponse): ResultFileFormat[] {
  return item.available_formats ?? RESULT_FORMATS
}

function canDownloadFormat(item: BackendFileListItemResponse, format: ResultFileFormat): boolean {
  return Boolean(item.download_url) && availableFormatsOf(item).includes(format)
}

function getConvertedFileStatusMeta(item: BackendFileListItemResponse): {
  label: ConvertedFileStatusLabel
  variant: ConvertedFileStatusVariant
} {
  if (item.status === 'failed' || item.current_stage === 'failed') {
    return { label: '실패', variant: 'failed' }
  }
  if (
    item.status === 'cancelled' ||
    item.status === 'cancelling' ||
    item.status === 'delete_failed'
  ) {
    return { label: '변환 중지', variant: 'cancelled' }
  }
  if (item.status === 'done' && item.result_ready) {
    if (!availableFormatsOf(item).includes('docx')) {
      return { label: '일부 완료', variant: 'done' }
    }
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

function toResultFileName(originalFileName: string, format: ResultFileFormat): string {
  return `${originalFileName.replace(/\.[^/.]+$/, '')}.${format}`
}

async function downloadConvertedFile(
  downloadUrl: string,
  originalFileName: string,
  format: ResultFileFormat = 'docx',
): Promise<void> {
  // [DEMO] Blob URL 직접 다운로드 — 데모 복원 시 주석 해제
  // if (downloadUrl.startsWith('blob:')) {
  //   const link = document.createElement('a')
  //   link.href = downloadUrl
  //   link.download = toResultFileName(originalFileName, format)
  //   document.body.appendChild(link)
  //   link.click()
  //   link.remove()
  //   return
  // }
  // [REAL] 백엔드 다운로드
  const absoluteDownloadUrl = downloadUrl.startsWith('http') ? downloadUrl : `${BACKEND_ORIGIN}${downloadUrl}`
  const separator = absoluteDownloadUrl.includes('?') ? '&' : '?'
  const response = await fetch(`${absoluteDownloadUrl}${separator}format=${format}`, {
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
  link.download = toResultFileName(originalFileName, format)
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
    availableFormats: state.availableFormats,
    warnings: state.warnings,
    startedAtMs: state.startedAtMs,
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
    availableFormats: persisted.availableFormats ?? RESULT_FORMATS,
    warnings: persisted.warnings ?? [],
    // 새로고침 뒤에도 같은 시작 시각을 써야 남은 시간이 이어진다.
    startedAtMs: persisted.startedAtMs ?? null,
    errorMessage: persisted.errorMessage,
    errorUserMessage: persisted.errorUserMessage,
  }
}

function UploadSection() {
  const { user } = useAuth()
  const [conversionState, setConversionState] = useState<ConversionState>(DEFAULT_STATE)
  const [convertedFiles, setConvertedFiles] = useState<BackendFileListItemResponse[]>([])
  const [isConvertedFilesLoading, setIsConvertedFilesLoading] = useState<boolean>(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useFeedback()
  const hasHydratedRef = useRef(false)
  const hasLoadedListRef = useRef(false)
  const prevUserIdRef = useRef<number | null | undefined>(undefined)

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

        // 완료/실패 건은 결과 화면을 복원하지 않는다 — 목록 배지로만 보여주고
        // 첫 화면은 항상 업로드 화면. 변환 중인 건만 진행 화면을 복원한다.
        const latestItem = pickLatestItem(recentItems)
        if (latestItem) {
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
              imageCounts: { processed: latestItem.processed_images, total: latestItem.total_images },
            })
            hasHydratedRef.current = true
            return
          }
        }

        // 서버 조회가 성공했고 변환 중인 건이 없으면 항상 업로드 화면.
        setConversionState(DEFAULT_STATE)
        hasHydratedRef.current = true
        return
      } catch {
        // 서버 복구 실패 시 localStorage fallback으로 진행한다.
        setIsConvertedFilesLoading(false)
      }

      // fallback에서도 변환 중이던 건만 복원한다. 완료/실패는 업로드 화면 유지.
      if (persistedFallback && persistedFallback.status === 'converting') {
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
              remainingSeconds: null,
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
              availableFormats: response.available_formats ?? RESULT_FORMATS,
              warnings: response.warnings ?? [],
              speedSample: null,
              remainingSeconds: null,
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

          const now = Date.now()
          const startedAtMs = prevState.startedAtMs ?? (Date.parse(response.created_at) || now)

          // 이미지 설명이 시작되는 순간을 속도 측정 기준점으로 잡는다.
          const speedSample =
            prevState.speedSample ??
            (response.current_stage === 'describing'
              ? { atMs: now, processed: response.processed_images }
              : null)

          return {
            ...prevState,
            status: 'converting',
            currentStage: response.current_stage,
            progress: Math.max(prevState.progress, nextProgress),
            imageCounts: { processed: response.processed_images, total: response.total_images },
            startedAtMs,
            speedSample,
            remainingSeconds: smoothRemaining(
              prevState.remainingSeconds,
              estimateRemainingSeconds(response, now, startedAtMs, speedSample),
            ),
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

  // 로그인/로그아웃 시 목록을 갱신하고, 로그아웃되면 화면을 업로드 화면으로 초기화한다.
  useEffect(() => {
    const prevUserId = prevUserIdRef.current
    const currentUserId = user ? user.id : null
    prevUserIdRef.current = currentUserId

    if (prevUserId === undefined) return // 최초 마운트는 건너뛴다.
    if (prevUserId === currentUserId) return // 실제 변화 없음.

    void refreshConvertedFiles()

    if (currentUserId === null) {
      // 로그아웃: 완료/변환 화면을 초기화한다.
      setConversionState(DEFAULT_STATE)
    }
  }, [user, refreshConvertedFiles])

  const handleSelectButtonClick = (): void => {
    fileInputRef.current?.click()
  }

  const selectFile = (selectedFile: File): void => {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) selectFile(selectedFile)
  }

  // 끌어다 놓기는 마우스 사용자용 보조 수단이다. 키보드·스크린리더 사용자는 '파일 선택' 버튼을 쓴다.
  const canDrop = conversionState.status === 'idle' || conversionState.status === 'file_selected'

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    if (!canDrop) return
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>): void => {
    // 상자 안의 자식 요소로 옮겨갈 때도 dragleave가 와서, 상자 밖으로 나갈 때만 끈다.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    if (!canDrop) return
    event.preventDefault()
    setIsDragOver(false)
    const droppedFile = event.dataTransfer.files[0]
    if (!droppedFile) return
    if (!ACCEPTED_EXTENSIONS.includes(extensionOf(droppedFile.name))) {
      toast('PDF 또는 PPTX 파일만 변환할 수 있어요.', 'error')
      return
    }
    selectFile(droppedFile)
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
        startedAtMs: Date.now(),
        speedSample: null,
        remainingSeconds: null,
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
    // 저장된 추출·이미지 설명·원고를 재사용해 AI 호출을 줄인다.
    // 이어갈 수 없으면 아래에서 파일을 새로 올린다.
    if (conversionState.fileId) {
      try {
        const resumed = await retryFile(conversionState.fileId)

        if (resumed) {
          setConversionState((prevState) => ({
            ...prevState,
            status: 'converting',
            currentStage: resumed.current_stage,
            startedAtMs: Date.now(),
            speedSample: null,
            remainingSeconds: null,
            errorMessage: '',
            errorUserMessage: '',
            isSubmitting: false,
          }))
          void refreshConvertedFiles()
          return
        }
      } catch {
        // 이어서 시도하지 못하면 새 업로드로 넘어간다.
      }
    }

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

  const handleDownload = async (format: ResultFileFormat): Promise<void> => {
    if (!conversionState.downloadUrl) return

    try {
      await downloadConvertedFile(conversionState.downloadUrl, conversionState.fileName, format)
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

  const handleListItemDownload = async (
    item: BackendFileListItemResponse,
    format: ResultFileFormat,
  ): Promise<void> => {
    if (!item.download_url) return

    try {
      await downloadConvertedFile(item.download_url, item.original_name, format)
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

  const handleListItemDelete = async (fileId: string): Promise<void> => {
    try {
      await deleteFile(fileId)
      setConvertedFiles((prevItems) => prevItems.filter((item) => item.file_id !== fileId))
    } catch (error) {
      console.error('파일 삭제 실패', error)
      // 필요하면 여기서 사용자에게 에러 메시지를 보여줄 수 있어요.
    }
  }

  const handleCancelConversion = async (fileId: string): Promise<void> => {
    try {
      await cancelFile(fileId)
    } catch (error) {
      console.error('작업 중단 실패', error)
      // 필요하면 여기서 사용자에게 에러 메시지를 보여줄 수 있어요.
      return
    }

    // 이 파일이 변환 화면에 떠 있으면 업로드 화면으로 초기화 (폴링도 멈춤)
    setConversionState((prevState) => (prevState.fileId === fileId ? DEFAULT_STATE : prevState))

    // 목록에서 즉시 '변환 중지'로 표시 (서버에도 cancelled로 저장됨)
    setConvertedFiles((prevItems) =>
      prevItems.map((item) =>
        item.file_id === fileId
          ? { ...item, status: 'cancelled' as const, result_ready: false, download_url: null }
          : item,
      ),
    )

    await refreshConvertedFiles()
  }

  return (
    <section className="upload-section" aria-labelledby="upload-section-title">
      <h2 id="upload-section-title" className="sr-only">
        파일 변환
      </h2>
      {/* 변환 단계가 바뀔 때만 읽어 준다. 진행률 숫자는 1.5초마다 바뀌어서 넣지 않는다. */}
      <p className="sr-only" role="status">
        {getStatusAnnouncement(conversionState)}
      </p>

      <div
        className={`upload-box${canDrop ? ' is-drop-target' : ''}${isDragOver ? ' is-drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
              <UploadSimpleIcon className="upload-icon-svg" />
            </div>

            <h3 className="upload-box-title">PDF 또는 PPTX 파일을 선택하세요</h3>
            <p className="upload-box-support-text">또는 이 상자로 파일을 끌어다 놓으세요</p>
            <button type="button" className="upload-select-button upload-select-button-large" onClick={handleSelectButtonClick}>
              파일 선택
            </button>
            <ul className="upload-spec-list" role="list" aria-label="변환 조건">
              <li>PDF·PPTX → DOCX·TXT</li>
              <li>최대 100MB</li>
            </ul>
          </div>
        )}

        {conversionState.status === 'file_selected' && (
          <div className="upload-panel-group upload-panel-selected">
            <div className="selected-file-chip">
              <span className="selected-file-chip-icon" aria-hidden="true">
                {extensionOf(conversionState.fileName) === 'pdf' ? (
                  <FilePdfIcon size={28} />
                ) : extensionOf(conversionState.fileName) === 'pptx' ? (
                  <FilePptIcon size={28} />
                ) : (
                  <FileTextIcon size={28} />
                )}
              </span>
              <span className="selected-file-chip-text">
                <span className="selected-file-name">{conversionState.fileName}</span>
                <span className="selected-file-size">
                  {extensionOf(conversionState.fileName).toUpperCase()}{' '}
                  {formatFileSize(conversionState.fileSize)}
                </span>
              </span>
            </div>

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
            {/* [DEMO] describing 단계 슬라이드 표시 — 데모 복원 시 아래 주석 해제하고 스피너 줄 삭제
            {conversionState.currentStage === 'describing' ? (() => {
              const progressPerSlide = 60 / DEMO_SLIDES.length
              const slideIndex = Math.min(
                Math.max(Math.floor((conversionState.progress - 20) / progressPerSlide), 0),
                DEMO_SLIDES.length - 1,
              )
              return (
                <div className="demo-slide-wrapper">
                  <div className="demo-slide-container">
                    <img
                      src={DEMO_SLIDES[slideIndex]}
                      alt={`분석 중인 이미지 ${slideIndex + 1}`}
                      className="demo-slide-img"
                    />
                    <div className="demo-slide-scan-line" />
                  </div>
                  <p className="demo-slide-label">
                    이미지 {slideIndex + 1} / {DEMO_SLIDES.length} 분석 중...
                  </p>
                </div>
              )
            })() : (
              <div className="progress-spinner" aria-hidden="true" />
            )}
            [DEMO] end */}
            <div className="progress-spinner" aria-hidden="true" />

            <h3 className="upload-box-title">변환 중...</h3>
            <p className="upload-box-support-text">{conversionState.fileName} 파일을 변환하고 있습니다.</p>

            <div
              className="progress-track"
              role="progressbar"
              aria-label="변환 진행률"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(conversionState.progress)}
              aria-valuetext={[
                `${Math.round(conversionState.progress)}%`,
                getStageLabel(conversionState.currentStage),
                formatImageCounts(conversionState),
              ]
                .filter(Boolean)
                .join(', ')}
            >
              <div
                className="progress-fill"
                style={{ transform: `scaleX(${Math.min(100, Math.max(0, conversionState.progress)) / 100})` }}
              />
            </div>
            <p className="progress-percent-text">{Math.round(conversionState.progress)}%</p>
            <p className="progress-stage-text">{getStageLabel(conversionState.currentStage)}</p>
            {/* 한 장마다 읽어 주면 시끄러워서 알림 영역에 넣지 않는다. 진행률 막대의 값(aria-valuetext)으로 필요할 때 들을 수 있다. */}
            {formatImageCounts(conversionState) && (
              <p className="progress-image-count">{formatImageCounts(conversionState)}</p>
            )}
            <ConversionSteps fileName={conversionState.fileName} stage={conversionState.currentStage} />
            {conversionState.remainingSeconds !== null && (
              <p className="progress-eta-text">{formatRemaining(conversionState.remainingSeconds)}</p>
            )}

            <button
              type="button"
              className="convert-cancel-button"
              disabled={conversionState.currentStage === 'uploaded'}
              onClick={() => {
                handleCancelConversion(conversionState.fileId)
              }}
            >
              변환 중단
            </button>
          </div>
        )}

        {conversionState.status === 'success' && (
          <div className="upload-panel-group upload-panel-result">
            <div className="result-icon success-icon" aria-hidden="true">
              <CheckIcon size={28} weight="bold" />
            </div>
            <h3 className="upload-box-title">
              {conversionState.availableFormats.includes('docx') ? '변환 완료!' : 'TXT만 생성됨'}
            </h3>
            <p className="upload-box-support-text">
              {conversionState.availableFormats.includes('docx')
                ? '파일이 성공적으로 변환되었습니다'
                : 'DOCX 파일을 만들지 못했습니다. TXT 파일만 받을 수 있습니다.'}
            </p>

            {conversionState.warnings.length > 0 && (
              <div className="conversion-warning-box" role="status">
                <p className="conversion-warning-title">확인 필요</p>
                <ul className="conversion-warning-list">
                  {conversionState.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="selected-action-row">
              <button
                type="button"
                className="convert-start-button"
                disabled={!conversionState.availableFormats.includes('docx')}
                onClick={() => {
                  void handleDownload('docx')
                }}
              >
                DOCX 다운로드
              </button>
              <button
                type="button"
                className="convert-start-button"
                disabled={!conversionState.availableFormats.includes('txt')}
                onClick={() => {
                  void handleDownload('txt')
                }}
              >
                TXT 다운로드
              </button>
              <button
                type="button"
                className="upload-select-button secondary-action-button action-row-center"
                onClick={handleReset}
              >
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
            <h3 className="upload-box-title">변환 실패</h3>
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
          <SkeletonList count={2} lines={2} label="변환된 파일 목록을 불러오는 중" />
        ) : convertedFiles.length === 0 ? (
          <EmptyState
            icon={<FileTextIcon size={28} />}
            title="아직 변환한 파일이 없어요"
            description="위에서 파일을 올리면 결과가 여기에 쌓여요."
          />
        ) : (
          <ul className="converted-file-list" aria-label="변환된 파일 목록">
            {convertedFiles.map((item) => {
              const statusMeta = getConvertedFileStatusMeta(item)
              const isDocxEnabled = canDownloadFormat(item, 'docx')
              const isTxtEnabled = canDownloadFormat(item, 'txt')
              return (
                <li key={item.file_id} className="converted-file-list-item">
                  <div className="converted-file-main">
                    <div className="converted-file-icon" aria-hidden="true">
                      <FileTextIcon />
                    </div>

                    <div className="converted-file-text">
                      <p className="converted-file-name">{item.original_name}</p>
                      <div className="converted-file-meta-row">
                        <span className="converted-file-format">{formatLabelOf(item)}</span>
                        <span className="converted-file-time">{formatRelativeCreatedAt(item.created_at)}</span>
                        <span className={`converted-file-status-badge is-${statusMeta.variant}`}>{statusMeta.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="converted-file-actions">
                    {statusMeta.variant === 'processing' && (
                      <button
                      type="button"
                      className="converted-file-action-button danger"
                      aria-label={`${item.original_name} 변환 중단`}
                      data-tooltip="변환 중단"
                      disabled={item.status === 'queued'}
                      onClick={() => {
                        handleCancelConversion(item.file_id)
                      }}
                    >
                        <XIcon aria-hidden="true" />
                      </button>
                    )}

                    <button
                      type="button"
                      className="converted-file-action-button docx-download-button"
                      aria-label={`${item.original_name} DOCX 다운로드`}
                      data-tooltip={isDocxEnabled ? 'DOCX 다운로드' : 'DOCX 파일 없음'}
                      disabled={!isDocxEnabled}
                      onClick={() => {
                        void handleListItemDownload(item, 'docx')
                      }}
                    >
                      DOCX
                    </button>

                    <button
                      type="button"
                      className="converted-file-action-button txt-download-button"
                      aria-label={`${item.original_name} TXT 다운로드`}
                      data-tooltip={isTxtEnabled ? 'TXT 다운로드' : 'TXT 파일 없음'}
                      disabled={!isTxtEnabled}
                      onClick={() => {
                        void handleListItemDownload(item, 'txt')
                      }}
                    >
                      TXT
                    </button>

                    <button
                      type="button"
                      className="converted-file-action-button danger"
                      aria-label={`${item.original_name} 목록에서 삭제`}
                      data-tooltip="목록에서 삭제"
                      disabled={statusMeta.variant === 'processing'}
                      onClick={() => {
                        handleListItemDelete(item.file_id)
                      }}
                    >
                      <TrashIcon aria-hidden="true" />
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

function ConversionSteps({ fileName, stage }: { fileName: string; stage: BackendFileStage }) {
  const steps = stepsFor(fileName)
  // 대기·업로드 중이면 -1(아직 시작 전), 단계에 없는 값(PPTX의 ocr 등)도 시작 전으로 둔다.
  const currentIndex = steps.indexOf(stage as StepStage)
  return (
    <div className="conversion-steps">
      <p className="sr-only">
        {currentIndex >= 0 ? `${steps.length}단계 중 ${currentIndex + 1}단계` : '변환 준비 중'}
      </p>
      <ol className="conversion-step-list" role="list">
        {steps.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
          return (
            <li
              key={step}
              className={`conversion-step is-${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="conversion-step-marker" aria-hidden="true">
                {state === 'done' ? <CheckIcon size={14} weight="bold" /> : index + 1}
              </span>
              <span className="conversion-step-label">{STEP_LABELS[step]}</span>
              <span className="sr-only">
                {state === 'done' ? ' 완료' : state === 'current' ? ' 진행 중' : ' 대기'}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default UploadSection
