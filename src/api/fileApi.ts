import type {
  BackendFileListItemResponse,
  BackendFileProcessResponse,
  BackendFileStatusResponse,
  BackendPreviewResponse,
} from '../types/fileConverter'

// 백엔드 주소는 front/.env 의 VITE_BACKEND_ORIGIN 으로 설정 (미설정 시 localhost:8000)
export const BACKEND_ORIGIN: string =
  import.meta.env.VITE_BACKEND_ORIGIN ?? 'http://localhost:8000'

const API_BASE = `${BACKEND_ORIGIN}/api/v1/files`

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string; message?: string }
    return data.detail ?? data.message ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

export async function uploadFile(file: File): Promise<BackendFileProcessResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/process`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response)
    throw new Error(errorMessage)
  }

  return (await response.json()) as BackendFileProcessResponse
}

export async function getFileStatus(fileId: string): Promise<BackendFileStatusResponse> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(fileId)}/status`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response)
    throw new Error(errorMessage)
  }

  return (await response.json()) as BackendFileStatusResponse
}

export async function getRecentFiles(): Promise<BackendFileListItemResponse[]> {
  const response = await fetch(API_BASE, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response)
    throw new Error(errorMessage)
  }

  return (await response.json()) as BackendFileListItemResponse[]
}

export async function deleteFile(fileId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response)
    throw new Error(errorMessage)
  }
}

/**
 * 실패한 변환을 같은 file_id로 이어서 다시 시도한다.
 * 저장된 추출·이미지 설명·원고를 재사용하므로 AI를 다시 호출하지 않는다.
 * 이어갈 수 없으면(만료 404, 실패 상태가 아님 409) null을 돌려준다.
 */
export async function retryFile(fileId: string): Promise<BackendFileProcessResponse | null> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(fileId)}/retry`, {
    method: 'POST',
    credentials: 'include',
  })

  if (response.status === 404 || response.status === 409) {
    return null
  }

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response)
    throw new Error(errorMessage)
  }

  return (await response.json()) as BackendFileProcessResponse
}

export type CancelResult = { file_id: string; status: string; message: string }

export async function cancelFile(fileId: string): Promise<CancelResult> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(fileId)}/cancel`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response)
    throw new Error(errorMessage)
  }

  return (await response.json()) as CancelResult
}

// 완료 화면 미리보기. 이미지 주소는 백엔드 기준 경로라서 BACKEND_ORIGIN을 붙여 돌려준다.
export async function getFilePreview(fileId: string): Promise<BackendPreviewResponse> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(fileId)}/preview`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response)
    throw new Error(errorMessage)
  }

  const data = (await response.json()) as BackendPreviewResponse
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      image_url: page.image_url ? `${BACKEND_ORIGIN}${page.image_url}` : null,
    })),
  }
}
