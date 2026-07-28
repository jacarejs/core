const portsByTab = new Map()
const RPC_TIMEOUT_MS = 5000

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'jacare-page') return
  const tabId = port.sender?.tab?.id
  if (tabId == null) return
  portsByTab.set(tabId, port)
  port.onDisconnect.addListener(() => {
    if (portsByTab.get(tabId) === port) portsByTab.delete(tabId)
  })
})

async function ensureContentScript(tabId) {
  if (portsByTab.has(tabId)) return { ok: true }
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-script.js'],
    })
    // Wait briefly for the content script to open its port.
    const deadline = Date.now() + 1500
    while (Date.now() < deadline) {
      if (portsByTab.has(tabId)) return { ok: true }
      await new Promise((r) => setTimeout(r, 50))
    }
    return { ok: false, error: 'Content script injected but no page port yet. Reload the tab.' }
  } catch (error) {
    return {
      ok: false,
      error: error?.message || String(error) || 'Failed to inject into this tab.',
    }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'jacare-ensure-page') {
    const tabId = message.tabId
    void ensureContentScript(tabId).then(sendResponse)
    return true
  }

  if (message?.type !== 'jacare-panel-to-page') return false
  const { tabId, message: pageMessage } = message

  void (async () => {
    let port = portsByTab.get(tabId)
    if (!port) {
      const ensured = await ensureContentScript(tabId)
      if (!ensured.ok) {
        sendResponse(ensured)
        return
      }
      port = portsByTab.get(tabId)
    }
    if (!port) {
      sendResponse({ ok: false, error: 'No page connection. Reload the inspected tab.' })
      return
    }

    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    let settled = false
    const finish = (payload) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      port.onMessage.removeListener(onMessage)
      sendResponse(payload)
    }
    const onMessage = (msg) => {
      if (msg?.requestId !== requestId) return
      finish(msg.payload ?? { ok: true })
    }
    const timer = setTimeout(() => {
      finish({
        ok: false,
        error: `Timed out after ${RPC_TIMEOUT_MS}ms waiting for the page. Reload the tab.`,
      })
    }, RPC_TIMEOUT_MS)

    port.onMessage.addListener(onMessage)
    try {
      port.postMessage({ requestId, message: pageMessage })
    } catch (error) {
      finish({ ok: false, error: error?.message || 'Failed to post to page port.' })
    }
  })()

  return true
})
