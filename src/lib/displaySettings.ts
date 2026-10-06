// 화면 설정(고대비·글자 크기). 이 브라우저에만 저장한다. 서버로 보내지 않는다.
// index.html의 짧은 스크립트가 같은 키를 첫 화면 그리기 전에 읽어서 깜빡임 없이 적용한다.

export type TextSize = 'normal' | 'large' | 'xlarge'
export type DisplaySettings = { highContrast: boolean; textSize: TextSize }

const STORAGE_KEY = 'bridgeon-display'
const DEFAULTS: DisplaySettings = { highContrast: false, textSize: 'normal' }

export function readDisplaySettings(): DisplaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>
    return {
      highContrast: parsed.highContrast === true,
      textSize: parsed.textSize === 'large' || parsed.textSize === 'xlarge' ? parsed.textSize : 'normal',
    }
  } catch {
    // 사생활 보호 모드 등으로 저장소를 못 쓰면 기본값으로 둔다.
    return DEFAULTS
  }
}

export function applyDisplaySettings(settings: DisplaySettings): void {
  const root = document.documentElement
  if (settings.highContrast) root.dataset.contrast = 'high'
  else delete root.dataset.contrast
  if (settings.textSize === 'normal') delete root.dataset.textSize
  else root.dataset.textSize = settings.textSize
}

export function saveDisplaySettings(settings: DisplaySettings): void {
  applyDisplaySettings(settings)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // 저장이 막혀도 지금 화면에는 적용된 상태로 둔다.
  }
}
