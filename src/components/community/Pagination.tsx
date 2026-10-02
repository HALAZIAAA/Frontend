type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 0) {
    return null
  }

  const pages = []
  for (let page = 1; page <= totalPages; page += 1) {
    pages.push(page)
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  // 게시글·사용자·신고 목록이 함께 쓰므로 이름은 '페이지 이동'으로 둔다.
  // 현재 페이지는 색뿐 아니라 aria-current로도 알려서 "3페이지, 현재 페이지"로 읽힌다.
  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        type="button"
        className="pagination-button"
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        이전
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? 'pagination-button active' : 'pagination-button'}
          onClick={() => onPageChange(page)}
          aria-label={`${page}페이지`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        className="pagination-button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        다음
      </button>
    </nav>
  )
}

export default Pagination
