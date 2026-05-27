import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import PostCard from '../../components/community/PostCard'
import Pagination from '../../components/community/Pagination'
import { getPosts } from '../../api/communityApi'
import type { PostCategory, SortType } from '../../types/community'
import '../../styles/navbar.css'
import '../../styles/community.css'

const CATEGORY_TABS: Array<'전체' | PostCategory> = ['전체', '공지', '질문', '팁', '후기']

function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState<'전체' | PostCategory>('전체')
  const [sort, setSort] = useState<SortType>('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const { posts, totalPages } = useMemo(
    () =>
      getPosts({
        category: selectedCategory,
        sort,
        page: currentPage,
        keyword,
      }),
    [selectedCategory, sort, currentPage, keyword],
  )

  const handleCategoryChange = (category: '전체' | PostCategory) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
    setCurrentPage(1)
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as SortType
    setSort(value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="community-page">
      <Navbar menuItems={['파일 변환', '커뮤니티']} />

      <main className="community-main">
        <h1 className="community-title">커뮤니티</h1>

        <section className="community-filter-card" aria-label="커뮤니티 필터 및 검색">
          <div className="community-category-tabs" role="tablist" aria-label="게시글 카테고리">
            {CATEGORY_TABS.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  category === selectedCategory
                    ? 'community-category-tab active'
                    : 'community-category-tab'
                }
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="community-search-row">
            <div className="community-search-input-wrapper">
              <span className="community-search-icon">🔍</span>
              <input
                type="text"
                value={keyword}
                onChange={handleKeywordChange}
                placeholder="게시글 검색..."
                className="community-search-input"
              />
            </div>

            <select
              className="community-sort-select"
              value={sort}
              onChange={handleSortChange}
              aria-label="정렬 기준 선택"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
            </select>

            <Link to="/community/write" className="community-write-button">
              <span className="community-write-button-icon">✏</span>
              글쓰기
            </Link>
          </div>
        </section>

        <section className="community-post-list" aria-label="커뮤니티 게시글 목록">
          {posts.length === 0 ? (
            <div className="community-empty-state">조건에 맞는 게시글이 없습니다.</div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </section>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>
    </div>
  )
}

export default CommunityPage

