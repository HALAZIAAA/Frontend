// ============================================================
// [DEMO] 백엔드 연결 전 시각 데모용 목 API
//
// 백엔드 연결 시 아래 3단계로 제거:
//   1. 이 파일(fileMockApi.ts) 삭제
//   2. UploadSection.tsx 상단 import 를 fileApi 로 교체
//      (주석으로 표시된 [DEMO] / [REAL] 줄 참고)
//   3. UploadSection.tsx 의 downloadConvertedFile 내
//      [DEMO] 블록 제거, [REAL] 블록 주석 해제
// ============================================================

import type {
  BackendFileListItemResponse,
  BackendFileProcessResponse,
  BackendFileStatusResponse,
} from '../types/fileConverter'

// 단계별 소요 시간 (ms)
const STAGE_MS = {
  uploaded: 2_000,        // 2초  - 업로드 중
  extracting: 3_000,      // 3초  - 이미지 추출
  describing: 20_000,     // 20초 - 이미지 텍스트 변환
  generating_docx: 5_000, // 5초  - 문서 생성
}

const TOTAL_IMAGES = 5

type DemoState = {
  fileId: string
  fileName: string
  startTime: number
  downloadUrl: string | null
}

let demo: DemoState | null = null

type ActiveStage = 'uploaded' | 'extracting' | 'describing' | 'generating_docx' | 'completed'

function resolveStage(elapsed: number): ActiveStage {
  const { uploaded, extracting, describing, generating_docx } = STAGE_MS
  if (elapsed < uploaded) return 'uploaded'
  if (elapsed < uploaded + extracting) return 'extracting'
  if (elapsed < uploaded + extracting + describing) return 'describing'
  if (elapsed < uploaded + extracting + describing + generating_docx) return 'generating_docx'
  return 'completed'
}

function makeBlobUrl(fileName: string): string {
  const blob = new Blob([`BridgeOn Demo 변환 파일: ${fileName}`], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  return URL.createObjectURL(blob)
}

// ── API 구현 ────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<BackendFileProcessResponse> {
  demo = {
    fileId: `demo-${Date.now()}`,
    fileName: file.name,
    startTime: Date.now(),
    downloadUrl: null,
  }
  return {
    file_id: demo.fileId,
    original_name: file.name,
    status: 'processing',
    current_stage: 'uploaded',
    message: '업로드 완료 (데모)',
  }
}

export async function getFileStatus(fileId: string): Promise<BackendFileStatusResponse> {
  if (!demo || demo.fileId !== fileId) {
    throw new Error('[DEMO] 파일 상태를 찾을 수 없습니다.')
  }

  const elapsed = Date.now() - demo.startTime
  const stage = resolveStage(elapsed)

  if (stage === 'completed') {
    if (!demo.downloadUrl) demo.downloadUrl = makeBlobUrl(demo.fileName)
    return {
      file_id: fileId,
      status: 'done',
      current_stage: 'completed',
      total_images: TOTAL_IMAGES,
      processed_images: TOTAL_IMAGES,
      display_count: false,
      result_ready: true,
      download_url: demo.downloadUrl,
      error_message: null,
    }
  }

  const describingElapsed = Math.max(
    0,
    elapsed - STAGE_MS.uploaded - STAGE_MS.extracting,
  )
  const processedImages =
    stage === 'describing'
      ? Math.min(
          Math.floor((describingElapsed / STAGE_MS.describing) * TOTAL_IMAGES),
          TOTAL_IMAGES - 1,
        )
      : stage === 'generating_docx'
        ? TOTAL_IMAGES
        : 0

  return {
    file_id: fileId,
    status: 'processing',
    current_stage: stage,
    total_images: TOTAL_IMAGES,
    processed_images: processedImages,
    display_count: stage === 'describing',
    result_ready: false,
    download_url: null,
    error_message: null,
  }
}

export async function getRecentFiles(): Promise<BackendFileListItemResponse[]> {
  if (!demo) return []

  const elapsed = Date.now() - demo.startTime
  const stage = resolveStage(elapsed)

  if (stage !== 'completed') return []

  if (!demo.downloadUrl) demo.downloadUrl = makeBlobUrl(demo.fileName)

  return [
    {
      file_id: demo.fileId,
      original_name: demo.fileName,
      status: 'done',
      current_stage: 'completed',
      total_images: TOTAL_IMAGES,
      processed_images: TOTAL_IMAGES,
      created_at: new Date(demo.startTime).toISOString(),
      result_ready: true,
      download_url: demo.downloadUrl,
    },
  ]
}
