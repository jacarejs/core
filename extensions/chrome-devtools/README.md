# Jacaré DevTools (Chrome)

Chrome DevTools panel for Jacaré apps (Manifest V3).

## Load unpacked (local)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this folder: `extensions/chrome-devtools`
4. Open a Jacaré app in DEV (e.g. `yarn lab:dev`)
5. Open DevTools → tab **Jacaré** → **Refresh**

The Lab installs `window.__JACARE_DEVTOOLS_HOOK__` via `@jacare/devtools/hook` so the extension can read the pulse graph.

## Pack ZIP

```bash
node scripts/pack-chrome-devtools.mjs
# → extensions/chrome-devtools/dist/jacare-devtools.zip
```

## CI publish

GitHub Action: `.github/workflows/publish-chrome-devtools.yml` (workflow_dispatch).

Secrets required for upload (see private doc):

- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`

**Before first API publish:** complete the Chrome Web Store **trader / negociante (EEA)** declaration in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole) — otherwise upload/publish fails.

## Privacy

The extension only talks to the inspected page’s Jacaré hook. No network telemetry.
