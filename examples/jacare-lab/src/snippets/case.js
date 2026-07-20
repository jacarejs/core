import { viewSnippet } from '../utils/snippet.js'

export const roleCode = viewSnippet(
  `const role = pulse('member')
const roles = ['admin', 'guest', 'member']

function setRole(next) {
  role.set(next)
}`,
  `  <div class="stack">
    <div class="row">
      #for roles as r (r)
        <button class="btn btn-outline" class-active=\${() => role() === r} on-click=\${() => setRole(r)}>\${r}</button>
      #end
    </div>
    #case role()
      #when 'admin'
        <p class="muted">Admin panel unlocked.</p>
      #when 'guest'
        <p class="muted">Guest preview only.</p>
      #else
        <p class="muted">Member workspace.</p>
    #end
  </div>`,
)

export const statusCode = viewSnippet(
  `const status = pulse('loading')
const statuses = ['loading', 'error', 'empty', 'ready']

function setStatus(next) {
  status.set(next)
}`,
  `  <div class="stack">
    <div class="row">
      #for statuses as s (s)
        <button class="btn btn-outline" class-active=\${() => status() === s} on-click=\${() => setStatus(s)}>\${s}</button>
      #end
    </div>
    #case status()
      #when 'loading'
        <p class="muted">Loading…</p>
      #when 'error'
        <p class="muted">Something went wrong.</p>
      #when 'empty'
        <p class="muted">No items yet.</p>
      #when 'ready'
        <p class="muted">Ready — here is your content.</p>
      #else
        <p class="muted">Unknown status.</p>
    #end
  </div>`,
)

export const themeCode = viewSnippet(
  `const theme = pulse('day')
const themes = ['day', 'dusk', 'night']

function setTheme(next) {
  theme.set(next)
}`,
  `  <div class="stack">
    <div class="row">
      #for themes as t (t)
        <button class="btn btn-outline" class-active=\${() => theme() === t} on-click=\${() => setTheme(t)}>\${t}</button>
      #end
    </div>
    #case theme()
      #when 'day'
        <div class="theme-panel theme-day">…</div>
      #when 'dusk'
        <div class="theme-panel theme-dusk">…</div>
      #when 'night'
        <div class="theme-panel theme-night">…</div>
      #else
        <div class="theme-panel">Fallback</div>
    #end
  </div>`,
)

export const numericCode = viewSnippet(
  `const score = pulse(72)

function gradeKey() {
  const n = Number(score())
  if (n >= 90) return 'A'
  if (n >= 80) return 'B'
  if (n >= 70) return 'C'
  if (n >= 60) return 'D'
  return 'F'
}`,
  `  <div class="stack">
    <input class="input" type="range" min="0" max="100" bind-value=\${score} />
    #case gradeKey()
      #when 'A'
        <span class="badge">Grade A</span>
      #when 'B'
        <span class="badge">Grade B</span>
      #when 'C'
        <span class="badge badge-warn">Grade C</span>
      #when 'D'
        <span class="badge badge-warn">Grade D</span>
      #else
        <span class="badge badge-danger">Grade F</span>
    #end
  </div>`,
)
