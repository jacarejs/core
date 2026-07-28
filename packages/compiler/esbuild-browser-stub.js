/** Browser stub for `esbuild` — Vite resolves this via package.json `"browser"`. */
export function transformSync() {
  throw new Error(
    'TypeScript strip (esbuild) is not available in the browser. Remove // @jacare-ts or compile with the Jacaré CLI / Vite plugin.',
  )
}

export default { transformSync }
