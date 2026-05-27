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

  return (
    <nav className="pagination" aria-label="게시글 페이지네이션">
      <button
        type="button"
        className="pagination-button"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        이전
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? 'pagination-button active' : 'pagination-button'}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        className="pagination-button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        다음
      </button>
    </nav>
  )
}

export default Pagination

