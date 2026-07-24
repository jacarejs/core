const portsByTab = new Map()

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'jacare-page') return
  const tabId = port.sender?.tab?.id
  if (tabId == null) return
  portsByTab.set(tabId, port)
  port.onDisconnect.addListener(() => {
    if (portsByTab.get(tabId) === port) portsByTab.delete(tabId)
  })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'jacare-panel-to-page') return false
  const { tabId, message: pageMessage } = message
  const port = portsByTab.get(tabId)
  if (!port) {
    sendResponse({ ok: false, error: 'No page connection. Reload the inspected tab.' })
    return false
  }

  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const onMessage = (msg) => {
    if (msg?.requestId !== requestId) return
    port.onMessage.removeListener(onMessage)
    sendResponse(msg.payload ?? { ok: true })
  }
  port.onMessage.addListener(onMessage)
  port.postMessage({ requestId, message: pageMessage })
  return true
})
