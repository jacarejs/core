# Jacaré DevTools (Chrome)

Chrome DevTools panel for Jacaré apps (Manifest V3).

The panel is called **Jacaré** in DevTools. Inside it, debug with four simple tabs:

- **State** — live values that matter (named, DOM-bound, `.jcr`, signals). Internal watches stay behind **Show noise**.
- **Screens** — `.jcr` files linked to state
- **Mesh** — pulse bags (`@bag/key`)
- **Scope** — `registerScope` watch list

Plus a compact **Route** bar from `createNav`.

In DEV, `@jacare/vite-plugin` installs the page hook when `@jacare/devtools` is present (`devtoolsHook: false` to disable).

The Extension injects its content bridge **on demand** when you open the Jacaré DevTools panel (not on every site at page load). RPC to the page times out after a few seconds if the tab bridge is gone — reload the tab and Refresh.

## Load unpacked (local)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → `extensions/chrome-devtools`
4. Open a Jacaré app in DEV (`yarn lab:dev`)
5. DevTools → tab **Jacaré**

The Lab installs `window.__JACARE_DEVTOOLS_HOOK__` via `@jacare/devtools/hook`.

## Pack ZIP

```bash
yarn chrome-devtools:pack
# → extensions/chrome-devtools/dist/jacare-devtools.zip
```

## CI publish

GitHub Action: `.github/workflows/publish-chrome-devtools.yml` (workflow_dispatch).

Secrets: `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`.


Before first API publish, complete the Chrome Web Store **trader / negociante (EEA)** declaration in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Chrome Web Store

[Jacaré Devtools](https://chromewebstore.google.com/detail/jacar%C3%A9-devtools/cjemkcfolgmpfkpkpiklmkijalpfmkcm)

## Privacy

Talks only to the inspected page’s Jacaré hook. No network telemetry.
