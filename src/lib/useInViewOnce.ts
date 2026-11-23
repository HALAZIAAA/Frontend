import { useEffect, useRef, useState } from 'react'

// 요소가 화면에 정해진 비율만큼 들어오면 true가 된다. 한 번 true가 되면 그대로다.
// 화면에 들어왔을 때 움직이기 시작하는 그림이 쓴다. IntersectionObserver가 없으면 처음부터 true다.
export function useInViewOnce<T extends Element>(threshold: number) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        observer.disconnect()
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}
