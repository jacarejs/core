export interface ParsedArgs {
  positional: string[]
  flags: Record<string, string | boolean>
}

export function parseArgv(argv: string[]): ParsedArgs {
  const positional: string[] = []
  const flags: Record<string, string | boolean> = {}

  for (const token of argv) {
    if (!token.startsWith('--')) {
      positional.push(token)
      continue
    }

    const body = token.slice(2)
    const eq = body.indexOf('=')
    if (eq === -1) {
      flags[body] = true
      continue
    }

    const key = body.slice(0, eq)
    const value = body.slice(eq + 1)
    flags[key] = value === 'false' ? false : value === 'true' ? true : value
  }

  return { positional, flags }
}

export function flagString(flags: Record<string, string | boolean>, key: string): string | undefined {
  const value = flags[key]
  if (typeof value === 'string') return value
  return undefined
}

export function flagBool(flags: Record<string, string | boolean>, key: string): boolean {
  const value = flags[key]
  if (value === true) return true
  if (value === false) return false
  if (value === 'true') return true
  if (value === 'false') return false
  return false
}

export function flagNumber(
  flags: Record<string, string | boolean>,
  key: string,
): number | undefined {
  const value = flagString(flags, key)
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
