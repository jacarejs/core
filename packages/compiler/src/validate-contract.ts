import type { TemplateComponentNode, TemplateNode, TemplateAST } from './types.js'
import type { ContractPropDef, TemplateContract } from './parse-contract.js'

export interface ContractUsageIssue {
  message: string
  component: string
  prop?: string
}

export interface ProvidedProp {
  name: string
  mode: 'one-way' | 'model' | 'static' | 'event'
  value: string
}

export function collectProvidedProps(node: TemplateComponentNode): ProvidedProp[] {
  const provided: ProvidedProp[] = []
  for (const attr of node.attrs) {
    if (attr.kind === 'bind') {
      provided.push({ name: attr.name, mode: 'model', value: attr.value })
    } else if (attr.kind === 'prop') {
      provided.push({ name: attr.name, mode: 'one-way', value: attr.value })
    } else if (attr.kind === 'static') {
      provided.push({ name: attr.name, mode: 'static', value: attr.value })
    } else if (attr.kind === 'event') {
      provided.push({ name: attr.name, mode: 'event', value: attr.value })
    }
  }
  if (node.children.length > 0) {
    provided.push({ name: 'children', mode: 'one-way', value: '' })
  }
  return provided
}

export function validateContractUsage(
  node: TemplateComponentNode,
  contract: TemplateContract,
  childProps: string[] = [],
): ContractUsageIssue[] {
  const issues: ContractUsageIssue[] = []
  const provided = collectProvidedProps(node)
  const byName = new Map(provided.map((entry) => [entry.name, entry]))

  const allowed = new Set<string>([
    ...Object.keys(contract.props),
    ...Object.keys(contract.pulses),
    ...Object.keys(contract.emits),
  ])
  if (contract.slots.includes('default') || childProps.includes('children')) {
    allowed.add('children')
  }
  for (const slotName of contract.slots) {
    if (slotName !== 'default') allowed.add(slotName)
  }

  for (const entry of provided) {
    if (!allowed.has(entry.name)) {
      issues.push({
        component: node.name,
        prop: entry.name,
        message: `unknown prop/emit "${entry.name}"`,
      })
    }
  }

  for (const [name, def] of Object.entries(contract.props)) {
    const entry = byName.get(name)
    if (def.required && !entry) {
      issues.push({
        component: node.name,
        prop: name,
        message: `missing required prop "${name}"`,
      })
      continue
    }
    if (!entry) continue

    if (def.model) {
      if (entry.mode !== 'model') {
        issues.push({
          component: node.name,
          prop: name,
          message: `prop "${name}" is model — use bind-${name}={...} (two-way), not :${name} or a static attribute`,
        })
      }
    } else if (entry.mode === 'model') {
      issues.push({
        component: node.name,
        prop: name,
        message: `prop "${name}" is not model — use :${name}={...} instead of bind-${name}`,
      })
    }

    if (entry.mode === 'static') {
      const typeIssue = checkStaticType(name, def, entry.value)
      if (typeIssue) {
        issues.push({ component: node.name, prop: name, message: typeIssue })
      }
    }
  }

  for (const name of Object.keys(contract.pulses)) {
    const entry = byName.get(name)
    if (!entry) {
      issues.push({
        component: node.name,
        prop: name,
        message: `missing pulse prop "${name}"`,
      })
      continue
    }
    if (entry.mode === 'static') {
      issues.push({
        component: node.name,
        prop: name,
        message: `pulse "${name}" must be passed as :${name}={signal}, not a static attribute`,
      })
    }
  }

  return issues
}

function checkStaticType(name: string, def: ContractPropDef, raw: string): string | null {
  switch (def.type) {
    case 'boolean':
      if (raw !== 'true' && raw !== 'false') {
        return `prop "${name}" expects boolean static value "true" or "false", got "${raw}"`
      }
      return null
    case 'number':
      if (!Number.isFinite(Number(raw)) || raw.trim() === '') {
        return `prop "${name}" expects a numeric static value, got "${raw}"`
      }
      return null
    case 'object':
      return `prop "${name}" expects an object — pass :${name}={...}, not a static attribute`
    case 'string':
    case 'any':
      return null
    default:
      return null
  }
}

export function collectComponents(ast: TemplateAST): TemplateComponentNode[] {
  const out: TemplateComponentNode[] = []
  const walk = (nodes: TemplateNode[]): void => {
    for (const node of nodes) {
      if (node.type === 'component') {
        out.push(node)
        walk(node.children)
      } else if (node.type === 'element') {
        walk(node.children)
      } else if (node.type === 'if') {
        for (const branch of node.branches) walk(branch.children)
        walk(node.elseChildren)
      } else if (node.type === 'case') {
        for (const branch of node.branches) walk(branch.children)
        walk(node.elseChildren)
      } else if (node.type === 'each') {
        walk(node.children)
      }
    }
  }
  walk(ast.children)
  return out
}

export function formatContractIssue(
  file: string,
  component: string,
  message: string,
): string {
  return `${file}: <${component}> ${message}`
}
