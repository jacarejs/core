import { moduleSnippet, viewSnippet } from '../utils/snippet.js'

export const scopedCode = moduleSnippet(
  `// ScopedA.jcr`,
  viewSnippet(
    '',
    `  <div class="scope-a-box box">Scoped A · shared class name "box"</div>`,
    `.box {
  font-weight: 700;
  letter-spacing: 0.02em;
}`,
  ),
  `// ScopedB.jcr`,
  viewSnippet(
    '',
    `  <div class="scope-b-box box">Scoped B · same class, different color</div>`,
    `.box {
  font-style: italic;
}`,
  ),
)

export const globalCode = viewSnippet(
  `const outlineOn = pulse(true)

function toggleOutline() {
  outlineOn.update((on) => !on)
}`,
  `  <div class="stack">
    <div class="row" class-shared-outline=\${outlineOn}>
      <ScopedA />
      <ScopedB />
    </div>
    <button type="button" class="btn btn-outline" on-click=\${toggleOutline}>Toggle outline</button>
  </div>`,
  `:global(.shared-outline) {
  outline: 2px dashed color-mix(in srgb, var(--leaf) 45%, transparent);
  outline-offset: 3px;
  border-radius: 0.75rem;
}`,
)

export const spotlightCode = viewSnippet(
  `const spotlightOn = pulse(false)

function toggleSpotlight() {
  spotlightOn.update((on) => !on)
}`,
  `  <div class="stack">
    <div class="card" class-spotlight=\${spotlightOn}>
      <p class="muted">The spotlight class only exists in this file's own scoped style block.</p>
    </div>
    <button type="button" class="btn btn-outline" on-click=\${toggleSpotlight}>Toggle spotlight</button>
  </div>`,
  `.spotlight {
  background: linear-gradient(135deg, rgba(143, 209, 42, 0.32), rgba(31, 143, 78, 0.16));
  box-shadow: 0 0 0 2px var(--leaf) inset;
}`,
)

export const hueChipCode = viewSnippet(
  `const accentHue = pulse(140)`,
  `  <div class="stack">
    <div class="hue-chip" style---hue=\${accentHue}></div>
    <input class="input" type="range" min="0" max="360" bind-value=\${accentHue} />
  </div>`,
  `.hue-chip {
  --hue: 140;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.85rem;
  border: 1px solid var(--line);
  background: hsl(var(--hue) 70% 55%);
}`,
)

export const styleIfCode = viewSnippet(
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
    <div class="theme-card">
      <strong>Theme card</strong>
      <p>Background and text come from style if branches.</p>
    </div>
  </div>`,
  `.theme-card {
  padding: 1rem 1.1rem;
  border-radius: 0.9rem;
  border: 1px solid transparent;

  #if theme() === 'night'
    background: #0b1a14;
    color: #e8f8dc;
    border-color: #1f8f4e;
  #elif theme() === 'dusk'
    background: #ffe8c7;
    color: #7a3e05;
    border-color: #f0b35a;
  #else
    background: #f8fffb;
    color: #0b1a14;
    border-color: color-mix(in srgb, var(--leaf) 25%, white);
  #end
}`,
)

export const styleCaseCode = viewSnippet(
  `const tone = pulse('ok')
const tones = ['ok', 'warn', 'danger']

function setTone(next) {
  tone.set(next)
}`,
  `  <div class="stack">
    <div class="row">
      #for tones as t (t)
        <button class="btn btn-outline" class-active=\${() => tone() === t} on-click=\${() => setTone(t)}>\${t}</button>
      #end
    </div>
    <span class="tone-badge">Tone badge</span>
  </div>`,
  `#case tone()
  #when 'ok'
.tone-badge { background: #dcfce7; color: #166534; }
  #when 'warn'
.tone-badge { background: #fef3c7; color: #92400e; }
  #when 'danger'
.tone-badge { background: #fee2e2; color: #991b1b; }
  #else
.tone-badge { background: #f3f4f6; color: #374151; }
#end`,
)

export const styleForCode = viewSnippet(
  `const accents = pulse([
  { id: 'leaf', color: '#8fd12a' },
  { id: 'amber', color: '#f59e0b' },
  { id: 'rose', color: '#f43f5e' },
])`,
  `  <div class="row">
    #for accents() as accent (accent.id)
      <span class=\${'chip-' + accent.id}>\${accent.id}</span>
    #end
  </div>`,
  `#for accents() as accent (accent.id)
.chip-\${accent.id} {
  border: 1px solid \${accent.color};
  background: color-mix(in srgb, \${accent.color} 22%, white);
}
#end`,
)
