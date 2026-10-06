import { useEffect, useState } from 'react'
import { BACKEND_ORIGIN, deleteFile, getRecentFiles } from '../../api/fileApi'
import { formatDate } from '../../lib/formatDate'
import { useFeedback } from '../../lib/feedback'
import type { BackendFileListItemResponse, BackendFileStatus } from '../../types/fileConverter'
import { SkeletonList } from '../common/Skeleton'
import { Link } from 'react-router-dom'
import EmptyState from '../common/EmptyState'
import { FileTextIcon } from '@phosphor-icons/react'

const STATUS_LABEL: Record<BackendFileStatus, string> = {
  queued: '대기 중',
  processing: '변환 중',
  done: '완료',
  failed: '실패',
  cancelling: '취소 중',
  cancelled: '취소됨',
  delete_failed: '삭제 실패',
}

function toAbsolute(url: string): string {
  return url.startsWith('http') ? url : `${BACKEND_ORIGIN}${url}`
}

function MyFilesSection() {
  const { toast, confirm } = useFeedback()
  const [files, setFiles] = useState<BackendFileListItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    getRecentFiles()
      .then((items) => {
        if (cancelled) return
        setFiles(items)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setFiles([])
        setError(err instanceof Error ? err.message : '파일 목록을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async (fileId: string, name: string) => {
    const ok = await confirm({
      title: `'${name}'을(를) 삭제할까요?`,
      message: '변환 결과 파일도 함께 지워집니다.',
      confirmLabel: '삭제',
      danger: true,
    })
    if (!ok) return

    try {
      await deleteFile(fileId)
      setFiles((prev) => prev.filter((item) => item.file_id !== fileId))
      toast(`'${name}'을(를) 삭제했습니다.`, 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : '삭제에 실패했습니다.', 'error')
    }
  }

  return (
    <section className="mypage-card" aria-label="내 변환 파일">
      <h2 className="mypage-section-title">내 변환 파일</h2>
      <p className="mypage-section-hint">보관 기간이 지난 파일은 표시되지 않습니다.</p>

      {loading ? (
        <SkeletonList count={2} lines={2} label="변환 파일을 불러오는 중" />
      ) : error ? (
        <p className="mypage-list-empty">{error}</p>
      ) : files.length === 0 ? (
        <EmptyState
          icon={<FileTextIcon size={28} />}
          title="변환한 파일이 없어요"
          description="PDF나 PPTX를 올리면 읽을 수 있는 문서로 바꿔 드려요."
          action={
            <Link to="/" className="empty-state-button">
              파일 변환하기
            </Link>
          }
        />
      ) : (
        <ul className="mypage-list">
          {files.map((file) => (
            <li key={file.file_id} className="mypage-list-item file">
              <div className="mypage-list-main">
                <span className="mypage-list-title">{file.original_name}</span>
              </div>
              <span className="mypage-list-sub">
                {STATUS_LABEL[file.status] ?? file.status} · {formatDate(file.created_at)}
              </span>
              <div className="mypage-file-actions">
                {/* 서버가 첨부파일로 내려주므로 같은 창에서 눌러도 화면 이동 없이 다운로드만 된다.
                    파일마다 링크 이름이 같지 않도록 파일명을 붙인다. (보이는 '다운로드'도 이름에 포함) */}
                {file.result_ready && file.download_url && (
                  <a
                    className="mypage-file-link"
                    href={toAbsolute(file.download_url)}
                    aria-label={`${file.original_name} 결과 파일 다운로드`}
                  >
                    다운로드
                  </a>
                )}
                <button
                  type="button"
                  className="mypage-file-delete"
                  onClick={() => handleDelete(file.file_id, file.original_name)}
                  aria-label={`${file.original_name} 삭제`}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default MyFilesSection
