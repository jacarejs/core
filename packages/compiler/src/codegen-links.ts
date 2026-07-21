import type { CodegenContext } from './codegen-shared.js'
import { parseLinkFrom, type TemplateContract } from './parse-contract.js'

/** Inject `const alias = getBag('bag')?.key` for contract Mesh links. */
export function emitContractLinks(
  ctx: CodegenContext,
  contract?: TemplateContract,
): void {
  const links = contract?.links
  if (!links || Object.keys(links).length === 0) return
  ctx.useRuntime('getBag')
  for (const [name, link] of Object.entries(links)) {
    const { bag, key } = parseLinkFrom(link.from)
    ctx.line(`const ${name} = getBag(${JSON.stringify(bag)})?.${key}`)
  }
  ctx.blank()
}
