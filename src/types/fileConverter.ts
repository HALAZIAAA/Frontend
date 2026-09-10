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
  // txt 생성 시 국소 오류 경고 목록 (docs/txt_spec.md 4.2) — 검수 화면에 표시
  warnings: string[]
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
}
