import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../community/Pagination'
import { getReports, setReportStatus } from '../../api/adminApi'
import { deletePost, deleteComment } from '../../api/communityApi'
import {
  REPORT_STATUS_LABEL,
  type AdminReport,
  type ReportStatus,
} from '../../types/report'

const FILTERS: Array<{ key: ReportStatus | ''; label: string }> = [
  { key: 'pending', label: '대기' },
  { key: 'resolved', label: '처리완료' },
  { key: 'rejected', label: '기각' },
  { key: '', label: '전체' },
]

function AdminReportsTab() {
  const [filter, setFilter] = useState<ReportStatus | ''>('pending')
  const [page, setPage] = useState(1)
  const [reports, setReports] = useState<AdminReport[]>([])
  const [total, setTotal] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getReports(filter, page)
      .then((result) => {
        if (cancelled) return
        setReports(result.reports)
        setTotal(result.total)
        setPendingCount(result.pendingCount)
        setTotalPages(result.totalPages)
        setPage(result.currentPage)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        setReports([])
        setError(err instanceof Error ? err.message : '신고를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filter, page, reloadKey])

  const handleStatus = async (report: AdminReport, status: ReportStatus) => {
    setBusyId(report.id)
    try {
      const updated = await setReportStatus(report.id, status)
      // 대기 목록에서 처리하면 그 줄은 목록 조건에서 빠지므로 다시 불러온다.
      if (filter && filter !== updated.status) {
        setReloadKey((key) => key + 1)
      } else {
        setReports((prev) => prev.map((item) => (item.id === report.id ? updated : item)))
        setPendingCount((prev) => (status === 'pending' ? prev + 1 : Math.max(0, prev - 1)))
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  // 신고된 대상을 지우고 신고도 처리완료로 넘긴다.
  const handleDeleteTarget = async (report: AdminReport) => {
    const label = report.targetType === 'post' ? '게시글' : '댓글'
    if (!window.confirm(`신고된 ${label}을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return

    setBusyId(report.id)
    try {
      if (report.targetType === 'post') {
        await deletePost(report.targetId)
      } else {
        await deleteComment(report.targetId)
      }
      await setReportStatus(report.id, 'resolved')
      setReloadKey((key) => key + 1)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-filter-group" role="tablist" aria-label="신고 상태 필터">
          {FILTERS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={filter === item.key ? 'admin-filter active' : 'admin-filter'}
              onClick={() => {
                setFilter(item.key)
                setPage(1)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="admin-total">
          대기 {pendingCount}건 / 표시 {total}건
        </span>
      </div>

      {loading ? (
        <p className="admin-empty">불러오는 중...</p>
      ) : error ? (
        <p className="admin-empty">{error}</p>
      ) : reports.length === 0 ? (
        <p className="admin-empty">해당하는 신고가 없습니다.</p>
      ) : (
        <>
          <ul className="admin-list">
            {reports.map((report) => (
              <li key={report.id} className="admin-row">
                <div className="admin-row-main">
                  <span className="admin-row-title">
                    <span className="admin-badge category">
                      {report.targetType === 'post' ? '게시글' : '댓글'}
                    </span>
                    {report.targetExists && report.postId ? (
                      <Link to={`/community/${report.postId}`} className="admin-row-link">
                        {report.targetPreview}
                      </Link>
                    ) : (
                      <span className="admin-row-deleted">{report.targetPreview}</span>
                    )}
                    <span className={`admin-badge status ${report.status}`}>
                      {REPORT_STATUS_LABEL[report.status]}
                    </span>
                  </span>
                  <span className="admin-row-sub">
                    {report.reason}
                    {report.detail ? ` · "${report.detail}"` : ''} · 신고자 {report.reporter} ·{' '}
                    {report.createdAt}
                  </span>
                </div>

                <div className="admin-row-actions">
                  {report.status !== 'resolved' && (
                    <button
                      type="button"
                      className="admin-action-button"
                      onClick={() => handleStatus(report, 'resolved')}
                      disabled={busyId === report.id}
                    >
                      처리완료
                    </button>
                  )}
                  {report.status !== 'rejected' && (
                    <button
                      type="button"
                      className="admin-action-button"
                      onClick={() => handleStatus(report, 'rejected')}
                      disabled={busyId === report.id}
                    >
                      기각
                    </button>
                  )}
                  {report.targetExists && (
                    <button
                      type="button"
                      className="admin-action-button danger"
                      onClick={() => handleDeleteTarget(report)}
                      disabled={busyId === report.id}
                    >
                      대상 삭제
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  )
}

export default AdminReportsTab
