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
