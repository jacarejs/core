export type PulseNodeKind = 'signal' | 'computed' | 'effect'

export interface PulseSource {
  file?: string
  line?: number
}

export interface PulseNode {
  id: number
  kind: PulseNodeKind
  name?: string
  file?: string
  line?: number
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

export interface DevtoolsMeta {
  name?: string
  file?: string
  line?: number
}

export type BindingKind = 'text' | 'attr' | 'prop' | 'class' | 'style' | 'model' | 'debug' | string

export interface BindingMeta {
  kind?: BindingKind
  file?: string
  line?: number
}

export interface PulseBinding {
  pulseId: number
  target: Node
  kind: BindingKind
  file?: string
  line?: number
}
