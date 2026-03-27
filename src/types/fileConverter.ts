export type BackendFileStatus = 'queued' | 'processing' | 'done' | 'failed'

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
