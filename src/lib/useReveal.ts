import { useLayoutEffect, type RefObject } from 'react'

// 화면에 들어오는 요소를 아래에서 살짝 올리며 나타낸다. 같은 부모 아래 요소는 순서대로 조금씩 늦게 나온다.
// 표시는 React가 그리지 않는 data-reveal 속성으로만 해서 다시 그려져도 지워지지 않는다.
// '동작 줄이기'를 켰거나 IntersectionObserver가 없으면 아무것도 하지 않아 처음부터 다 보인다.
export function useReveal(rootRef: RefObject<HTMLElement | null>, selector: string) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector))
    const orderInParent = new Map<Element | null, number>()
    for (const el of targets) {
      const order = orderInParent.get(el.parentElement) ?? 0
      orderInParent.set(el.parentElement, order + 1)
      el.style.setProperty('--reveal-delay', `${Math.min(order, 6) * 70}ms`)
      el.dataset.reveal = 'pending'
    }

    const timers: number[] = []
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          observer.unobserve(el)
          el.dataset.reveal = 'done'
          el.dataset.revealed = '' // 나타난 뒤 이어지는 움직임(숫자 튀어나오기 등)이 이 표시를 본다
          // 다 나타나면 전환 표시를 지워서 다른 전환(누름 반응 등)이 늦어지지 않게 한다.
          timers.push(window.setTimeout(() => delete el.dataset.reveal, 1200))
        }
      },
      // 화면 아래 끝에서 40px 올라왔을 때 나타낸다. 비율(%)로 잡으면 세로로 아주 긴 화면에서
      // 맨 아래 요소가 그 선을 영영 넘지 못해 숨은 채로 남을 수 있어서 픽셀로 잡는다.
      { rootMargin: '0px 0px -40px 0px' },
    )
    targets.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      timers.forEach((id) => window.clearTimeout(id))
      for (const el of targets) {
        delete el.dataset.reveal
        delete el.dataset.revealed
        el.style.removeProperty('--reveal-delay')
      }
    }
  }, [rootRef, selector])
}
