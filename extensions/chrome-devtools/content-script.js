const SOURCE_PAGE = 'jacare-devtools-page'
const SOURCE_CONTENT = 'jacare-devtools-content'

if (!window.__JACARE_CONTENT_INJECTED__) {
  window.__JACARE_CONTENT_INJECTED__ = true

  function injectHook() {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('page-hook.js')
    script.async = false
    ;(document.documentElement || document.head || document.body).appendChild(script)
    script.addEventListener('load', () => script.remove())
  }

  injectHook()

  let port = null

  function connectPort() {
    port = chrome.runtime.connect({ name: 'jacare-page' })
    port.onMessage.addListener((msg) => {
      window.postMessage(
        {
          source: SOURCE_CONTENT,
          kind: 'request',
          requestId: msg.requestId,
          message: msg.message,
        },
        '*',
      )
    })
    port.onDisconnect.addListener(() => {
      port = null
      setTimeout(connectPort, 400)
    })
  }

  connectPort()

  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    const data = event.data
    if (!data || data.source !== SOURCE_PAGE) return
    if (data.kind === 'response' && port) {
      port.postMessage({ requestId: data.requestId, payload: data.payload })
    }
  })
}
