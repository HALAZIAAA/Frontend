import { useEffect, useRef } from 'react'

// 화면에 들어오면 from에서 to까지 올라가는 숫자. 한 번만 움직이고 멈춘다.
// 처음부터 마지막 값을 그려 두고, 화면에 들어온 순간에만 글자를 바꿔 가며 올린다. 그래서 움직임이 시작되지 못해도 틀린 값이 남지 않는다.
// '동작 줄이기'를 켠 사용자에게는 움직이지 않고, 화면 읽기 프로그램은 마지막 값만 읽는다.
function CountUp({
  from = 0,
  to,
  digits = 0,
  suffix = '',
  delay = 0,
}: {
  from?: number
  to: number
  digits?: number
  suffix?: string
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const final = `${to.toFixed(digits)}${suffix}`

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const duration = 900
        const startAt = performance.now() + delay
        const tick = (now: number) => {
          const progress = Math.min(1, Math.max(0, (now - startAt) / duration))
          const eased = 1 - (1 - progress) ** 3 // 끝으로 갈수록 느려진다
          el.textContent = progress < 1 ? `${(from + (to - from) * eased).toFixed(digits)}${suffix}` : final
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      el.textContent = final
    }
  }, [from, to, digits, suffix, delay, final])

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </>
  )
}

export default CountUp
