# Scale — BMI by Jacaré

Live body-mass index calculator demo. Move height and weight; the gauge, number, and category update through fine-grained reactivity — no VDOM.

Live demo: [jacarejs.github.io/core/bmi](https://jacarejs.github.io/core/bmi/)

![Jacaré](public/jacare-logo.png)

## Run

From the monorepo root:

```bash
yarn install
yarn bmi:dev
```

Open [http://localhost:3002](http://localhost:3002).

Build:

```bash
yarn bmi:build
```

For GitHub Pages (subpath `/core/bmi/`):

```bash
JACARE_BASE=/core/bmi/ yarn build
```

## DevTools

In **dev** only (`yarn bmi:dev`), `boot.js` calls `connectJacareDevtools()`.

| Want | Do |
|------|----|
| Hide panel | Click `×` → becomes a small **Pulse Graph** chip |
| Show again | Click the chip |
| Minimize | Click `−` |
| Disable for this app | Remove / comment the `connectJacareDevtools()` block in `src/boot.js` |
| Production | Not included — guarded by `import.meta.env.DEV` |

The list shows live pulse values and flashes when they change (sliders, unit toggle, etc.).

## What it shows

- `pulse` + `derive` for BMI, category, and needle angle
- `#if` for metric / imperial slider ranges
- `bind-value` on range inputs
- Reactive CSS (`style---angle`) for the gauge
- `class-*` bindings for health-zone colors

Educational demo only — not medical advice.
