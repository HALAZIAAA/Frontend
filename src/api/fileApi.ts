import type {
  BackendFileListItemResponse,
  BackendFileProcessResponse,
  BackendFileStatusResponse,
} from '../types/fileConverter'

const API_BASE = 'http://localhost:8000/api/v1/files'

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
