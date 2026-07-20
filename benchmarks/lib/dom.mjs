import { Window } from 'happy-dom'

export function installDom() {
  const window = new Window()
  const { document } = window

  globalThis.window = window
  globalThis.document = document
  globalThis.HTMLElement = window.HTMLElement
  globalThis.Element = window.Element
  globalThis.Node = window.Node
  globalThis.Text = window.Text
  globalThis.Comment = window.Comment
  globalThis.DocumentFragment = window.DocumentFragment

  return { window, document }
}
