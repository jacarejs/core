/** Set the browser tab title from a screen (outside createNav). */
export function setNavTitle(title: string): void {
  if (typeof document === 'undefined') return
  if (typeof title !== 'string' || title.length === 0) return
  document.title = title
}

/** Read the current browser tab title. */
export function getNavTitle(): string {
  if (typeof document === 'undefined') return ''
  return document.title
}
