import { useRef, type KeyboardEvent } from 'react'

type UseTabsOptions<T extends string> = {
  idPrefix: string // 탭·패널 id 앞에 붙는 이름. 한 화면에 탭 묶음이 여럿이면 서로 달라야 한다.
  tabs: readonly T[]
  selected: T
  onSelect: (tab: T) => void
}

// WAI-ARIA 탭 패턴의 키보드 동작을 붙여 준다.
// - Tab 키는 탭 줄에서 선택된 탭 하나에만 멈추고, 다음 Tab은 바로 내용으로 간다.
// - ←/→로 이전·다음 탭으로 옮기면서 바로 선택한다. 끝에서 누르면 반대쪽 끝으로 돌아간다.
// - Home/End로 처음·마지막 탭으로 간다.
export function useTabs<T extends string>({ idPrefix, tabs, selected, onSelect }: UseTabsOptions<T>) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const panelId = `${idPrefix}-panel`
  const tabId = (index: number) => `${idPrefix}-tab-${index}`

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % tabs.length
        break
      case 'ArrowLeft':
        next = (index - 1 + tabs.length) % tabs.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = tabs.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    onSelect(tabs[next])
    tabRefs.current[next]?.focus()
  }

  // 탭 버튼에 그대로 펼쳐 넣는다: <button {...getTabProps(tab, index)}>
  const getTabProps = (tab: T, index: number) => ({
    id: tabId(index),
    role: 'tab' as const,
    'aria-selected': tab === selected,
    'aria-controls': panelId,
    tabIndex: tab === selected ? 0 : -1,
    ref: (element: HTMLButtonElement | null) => {
      tabRefs.current[index] = element
    },
    onClick: () => onSelect(tab),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => handleKeyDown(event, index),
  })

  // 탭이 보여 주는 내용 영역에 펼쳐 넣는다: <div {...panelProps}>
  const panelProps = {
    id: panelId,
    role: 'tabpanel' as const,
    'aria-labelledby': tabId(Math.max(0, tabs.indexOf(selected))),
  }

  return { getTabProps, panelProps }
}
