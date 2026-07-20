export type PanelCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export interface DevtoolsUiConfig {
  pulsePosition: PanelCorner
  scopePosition: PanelCorner
  pulseMode: 'open' | 'minimized' | 'hidden'
}

const CONFIG_KEY = 'jacare:devtools:config'

const DEFAULT_CONFIG: DevtoolsUiConfig = {
  pulsePosition: 'bottom-right',
  scopePosition: 'bottom-left',
  pulseMode: 'open',
}

export function readUiConfig(): DevtoolsUiConfig {
  try {
    const raw = sessionStorage.getItem(CONFIG_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }
    const parsed = JSON.parse(raw) as Partial<DevtoolsUiConfig>
    return {
      pulsePosition: isCorner(parsed.pulsePosition) ? parsed.pulsePosition : DEFAULT_CONFIG.pulsePosition,
      scopePosition: isCorner(parsed.scopePosition) ? parsed.scopePosition : DEFAULT_CONFIG.scopePosition,
      pulseMode:
        parsed.pulseMode === 'open' ||
        parsed.pulseMode === 'minimized' ||
        parsed.pulseMode === 'hidden'
          ? parsed.pulseMode
          : DEFAULT_CONFIG.pulseMode,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function writeUiConfig(patch: Partial<DevtoolsUiConfig>): DevtoolsUiConfig {
  const next = { ...readUiConfig(), ...patch }
  try {
    sessionStorage.setItem(CONFIG_KEY, JSON.stringify(next))
  } catch {}
  return next
}

function isCorner(value: unknown): value is PanelCorner {
  return (
    value === 'bottom-right' ||
    value === 'bottom-left' ||
    value === 'top-right' ||
    value === 'top-left'
  )
}

export function applyCorner(el: HTMLElement, corner: PanelCorner): void {
  el.style.top = ''
  el.style.right = ''
  el.style.bottom = ''
  el.style.left = ''
  el.dataset['corner'] = corner
  switch (corner) {
    case 'bottom-right':
      el.style.right = '1rem'
      el.style.bottom = '1rem'
      break
    case 'bottom-left':
      el.style.left = '1rem'
      el.style.bottom = '1rem'
      break
    case 'top-right':
      el.style.right = '1rem'
      el.style.top = '1rem'
      break
    case 'top-left':
      el.style.left = '1rem'
      el.style.top = '1rem'
      break
  }
}

export const CORNER_LABELS: Record<PanelCorner, string> = {
  'bottom-right': 'Bottom right',
  'bottom-left': 'Bottom left',
  'top-right': 'Top right',
  'top-left': 'Top left',
}
