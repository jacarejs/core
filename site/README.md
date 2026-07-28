# `site/` — GitHub Pages artifact (generated)

This directory is **built by CI**, not a source tree.

- Workflow: [`.github/workflows/pages.yml`](../.github/workflows/pages.yml)
- Assembler: [`scripts/prepare-pages-site.mjs`](../scripts/prepare-pages-site.mjs)
- Index / 404 sources: `scripts/gh-pages-index.html`, `scripts/gh-pages-404.html`

Built output is gitignored. Do not commit hashed `assets/` here — they go stale vs Lab / BMI / Studio / Island demos.

## Local preview

```bash
yarn build
JACARE_BASE=/core/todo/ yarn example:build
JACARE_BASE=/core/showcase/ yarn showcase:build
JACARE_BASE=/core/bmi/ yarn bmi:build
JACARE_BASE=/core/lab/ yarn lab:build
JACARE_BASE=/core/studio/ yarn studio:build
JACARE_BASE=/core/island/ yarn island:build
JACARE_BASE=/core/island-react/ yarn island-react:build
JACARE_BASE=/core/island-vue/ yarn island-vue:build
JACARE_BASE=/core/island-angular/ yarn island-angular:build
yarn pages:prepare
npx serve site
```

Live demos: [jacarejs.github.io/core](https://jacarejs.github.io/core/).
