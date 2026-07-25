# vite-minimal

Single-page Jacaré counter — `pulse` / `derive` style reactivity with scoped `<style>`.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check
```

## Editor

Install the [Jacaré VS Code extension](https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare) for `.jcr` highlighting.

## Layout

```
public/
  jacare-logo.png
src/
  app.jcr       UI + state + scoped CSS
  app.css       global tokens / body
  boot.js       import './app.css' + mount
index.html
vite.config.js
jacare.config.js
jacare.d.ts
```

Next step: upgrade to [`vite-nav`](../vite-nav) when you need routes.
