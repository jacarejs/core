# Jacaré Studio

Live playground for Jacaré: edit a `.jcr` module, compile in the browser, mount a preview, and share via URL.

- Live: [jacarejs.github.io/core/studio](https://jacarejs.github.io/core/studio/)
- Presets: counter, derive, keyed list, `#if`, `#case`, bindings, form, timer
- Share: the current source is gzip + base64 encoded into the URL hash — copy the link and send it

## Run locally

From the repo root:

```bash
yarn studio:dev
```

Or from this folder:

```bash
cd examples/jacare-studio
yarn dev
```

Open [http://localhost:3005](http://localhost:3005).

## How it works

- The editor keeps a `pulse` with the source; every change re-compiles with `@jacare/compiler` (in the browser) and re-mounts the preview.
- `node:path` is shimmed for the browser in `vite.config.js` (see `src/shims/path.js`).
- Sharing uses `CompressionStream('gzip')` + base64url in the URL hash (`src/lib/share.js`).

## Related

- [Jacaré Lab](https://jacarejs.github.io/core/lab/) — guided tutorial + playground
- [API docs](../../docs/api.md) · [Language reference](../../docs/language-reference.md)
