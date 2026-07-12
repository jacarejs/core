declare module 'create-jacare/scaffold.js' {
  export const VITE_TEMPLATES: string[]

  export function resolveViteTemplate(name: string): string | null

  export function getTemplatesRoot(): string

  export function scaffoldFromDisk(
    name: string,
    template: string,
    targetDir: string,
    version?: string,
  ): { template: string; dir: string }
}
