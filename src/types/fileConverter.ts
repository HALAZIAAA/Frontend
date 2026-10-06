export type BackendFileStatus =
  | 'queued'
  | 'processing'
  | 'done'
  | 'failed'
  | 'cancelling'
  | 'cancelled'
  | 'delete_failed'

// 백엔드 current_stage 가 쓰는 값 전체
export type BackendFileStage =
  | 'queued'
  | 'uploaded'
  | 'extracting'
  | 'ocr'
  | 'describing'
  | 'refining'
  | 'generating_docx'
  | 'completed'
  | 'failed'
  | 'cancelling'
  | 'cancelled'
  | 'delete_failed'

export type BackendFileProcessResponse = {
  file_id: string
  original_name: string
  status: BackendFileStatus
  current_stage: BackendFileStage
  message: string
}

export type ResultFileFormat = 'docx' | 'txt'

export type BackendFileStatusResponse = {
  file_id: string
  status: BackendFileStatus
  current_stage: BackendFileStage
  total_images: number
  processed_images: number
  display_count: boolean
  result_ready: boolean
  download_url: string | null
  error_message: string | null
  // 완료 후 확인이 필요한 안내 목록 (docs/txt_spec.md 4) — 검수 화면에 표시
  warnings: string[]
  // 실제로 받을 수 있는 형식. DOCX 생성만 실패하면 ['txt']
  // 값이 없는 예전 응답·목업은 두 형식 모두 있는 것으로 본다.
  available_formats?: ResultFileFormat[]
  // 변환이 끝나기까지의 대략치(초). 과거 기록이 없으면 null
  estimated_seconds?: number | null
  // 업로드 시각(UTC ISO). 새로고침 뒤 남은 시간 계산의 기준으로 쓴다.
  created_at: string
}

export type BackendFileListItemResponse = {
  file_id: string
  original_name: string
  status: BackendFileStatus
  current_stage: BackendFileStage
  total_images: number
  processed_images: number
  created_at: string
  result_ready: boolean
  download_url: string | null
  available_formats?: ResultFileFormat[]
  file_type?: string
}

// 완료 화면 미리보기 (GET /files/{id}/preview). 문단은 실제 TXT·DOCX와 같은 원고에서 온다.
export type BackendPreviewParagraph = {
  text: string
  heading_level: number | null
  list_level: number | null
  list_marker: string | null
  boundary: boolean // [그림 시작] 같은 구간 표시
}

export type BackendPreviewPage = {
  page_number: number
  image_url: string | null
  paragraphs: BackendPreviewParagraph[]
}

export type BackendPreviewResponse = {
  file_type: string
  pages: BackendPreviewPage[]
}
