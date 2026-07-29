export type BagSiteInfo = {
  file: string
  line: number
  character: number
  keys: string[]
}

export type BagIndexEntry = {
  id: string
  keys: Set<string>
  sites: BagSiteInfo[]
}

export type MeshHoverInput = {
  bag: string
  key: string
  resolveExpr: string
  isRoute: boolean
  entry: BagIndexEntry | undefined
  /** Workspace-relative path for display, if known. */
  relativePath?: string
}

export function formatMeshHoverMarkdown(input: MeshHoverInput): string {
  const address = `@${input.bag}/${input.key}`

  if (input.isRoute) {
    return [
      `**Route param** \`${address}\``,
      '',
      `| | |`,
      `| --- | --- |`,
      `| Bag | \`route\` (reserved) |`,
      `| Key | \`${input.key}\` |`,
      `| Resolves to | \`${input.resolveExpr}\` |`,
      '',
      'Active nav params via `createRoute` / `createNav` — not a `createBag` port.',
      '',
      '[Pulse bags — Lab](https://jacarejs.github.io/core/lab/#/bag)',
    ].join('\n')
  }

  const lines = [
    `**Mesh Port** \`${address}\``,
    '',
    `| | |`,
    `| --- | --- |`,
    `| Bag | \`${input.bag}\` |`,
    `| Key | \`${input.key}\` |`,
    `| Resolves to | \`${input.resolveExpr}\` |`,
  ]

  if (!input.entry) {
    lines.push(`| Published | no · no \`createBag('${input.bag}', …)\` in workspace |`)
  } else {
    const keys = [...input.entry.keys].sort()
    const keyOk = input.entry.keys.has(input.key)
    const keysLabel =
      keys.length === 0
        ? 'yes · keys unknown (no \`return { … }\` parsed)'
        : keyOk
          ? `yes · \`${keys.join('`, `')}\``
          : `yes · key not in return · known: \`${keys.join('`, `')}\``
    lines.push(`| Published | ${keysLabel} |`)
    const site = input.entry.sites[0]
    if (site) {
      const path = input.relativePath ?? site.file
      lines.push(`| Defined in | \`${path}:${site.line + 1}\` |`)
    }
  }

  lines.push(
    '',
    '[Pulse bags — Lab](https://jacarejs.github.io/core/lab/#/bag)',
  )
  return lines.join('\n')
}
