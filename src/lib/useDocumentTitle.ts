import { useEffect } from 'react'

// 탭 제목을 '페이지 이름 - BridgeOn'으로 바꾼다. 스크린리더가 페이지를 옮길 때 이 제목을 먼저 읽는다.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} - BridgeOn` : 'BridgeOn'
  }, [title])
}
