const PREFIX = 'jcr1:'

function toBase64Url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function gzipEncode(text) {
  if (typeof CompressionStream === 'undefined') {
    return new TextEncoder().encode(text)
  }
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gzipDecode(bytes) {
  if (typeof DecompressionStream === 'undefined') {
    return new TextDecoder().decode(bytes)
  }
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
    return await new Response(stream).text()
  } catch {
    return new TextDecoder().decode(bytes)
  }
}

export async function encodeSharePayload(source) {
  const bytes = await gzipEncode(String(source ?? ''))
  return PREFIX + toBase64Url(bytes)
}

export async function decodeSharePayload(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return null
  if (!value.startsWith(PREFIX)) {
    try {
      return decodeURIComponent(value)
    } catch {
      return null
    }
  }
  try {
    const bytes = fromBase64Url(value.slice(PREFIX.length))
    return await gzipDecode(bytes)
  } catch {
    return null
  }
}

export async function readShareFromLocation() {
  const hash = location.hash.replace(/^#/, '')
  if (hash.startsWith(PREFIX) || hash.length > 20) {
    return decodeSharePayload(hash)
  }
  const params = new URLSearchParams(location.search)
  const q = params.get('src')
  if (q) return decodeSharePayload(q)
  return null
}

export async function writeShareToLocation(source) {
  const payload = await encodeSharePayload(source)
  const url = new URL(location.href)
  url.search = ''
  url.hash = payload
  history.replaceState(null, '', url)
  return url.toString()
}
