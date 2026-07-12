export type PulseNodeKind = 'signal' | 'computed' | 'effect'

export interface PulseNode {
  id: number
  kind: PulseNodeKind
  value?: unknown
  stale?: boolean
  disposed: boolean
  subscribers: number
}

export interface PulseEdge {
  from: number
  to: number
}

export interface PulseGraphSnapshot {
  nodes: PulseNode[]
  edges: PulseEdge[]
  updatedAt: number
}
