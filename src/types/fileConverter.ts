export type BackendFileStatus =
  | 'queued'
  | 'processing'
  | 'done'
  | 'failed'
  | 'cancelling'
  | 'cancelled'
  | 'delete_failed'

export type BackendFileStage =
  | 'uploaded'
  | 'extracting'
  | 'describing'
  | 'generating_docx'
  | 'completed'
  | 'failed'

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
}
