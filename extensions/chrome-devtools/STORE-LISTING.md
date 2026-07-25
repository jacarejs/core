# Store listing — Jacaré (Chrome Web Store)

Copy/paste helpers for the first upload. Extension ZIP: `extensions/chrome-devtools/dist/jacare-devtools.zip`.

## Identity

| Field | Value |
|-------|--------|
| **Name** | Jacaré Devtools |
| **Short name** (if asked) | Jacaré Devtools |
| **Version** | `0.1.0` (from `manifest.json`) |
| **Category** | Developer Tools |
| **Language** | English (primary); Portuguese optional for listing |

## Short description (≤132 chars)

```
Inspect Jacaré apps in Chrome DevTools: live state, routes, .jcr screens, Mesh bags, and Scope.
```

## Detailed description

```
Jacaré is a Chrome DevTools panel for apps built with the Jacaré front-end framework.

Open any Jacaré page in development, open DevTools, and select the Jacaré tab to inspect:

• Route — current createNav path, params, and search
• State — reactive pulses with live values (noise filtered by default)
• Screens — .jcr sources linked to state
• Mesh — pulse bags (@bag/key)
• Scope — registerScope watch list

Pick an element in the page to jump to related pulses. Hover or select a value to highlight DOM bindings.

Requirements:
• A Jacaré app running in DEV with the page hook (Lab or @jacare/vite-plugin + @jacare/devtools)
• Chrome DevTools open on the inspected tab

Privacy:
• Talks only to the inspected page’s Jacaré hook
• No analytics, no accounts, no data sent to remote servers
```

## Portuguese (opcional — descrição longa)

```
Jacaré é um painel do Chrome DevTools para apps do framework Jacaré.

Abra a app em DEV, abra o DevTools e use a aba Jacaré para inspecionar:

• Rota — path, params e search do createNav
• State — pulses reativos com valores ao vivo
• Screens — fontes .jcr ligadas ao estado
• Mesh — bags (@bag/key)
• Scope — lista registerScope

Requisitos: app Jacaré em DEV com o page hook. Sem telemetria — só comunica com a página inspecionada.
```

## Single purpose (privacy / justification)

```
This extension’s single purpose is to provide a Chrome DevTools panel that inspects Jacaré framework state (reactivity, routes, Mesh, Scope) in the currently inspected tab.
```

## Permission justification

| Permission | Why |
|------------|-----|
| Host permissions (`http(s)://*`, localhost) | Attach the content script so the DevTools panel can talk to Jacaré apps during local and remote DEV |

## Privacy summary (store form)

- **Does not** collect user data  
- **Does not** sell or transfer data  
- **Does not** use remote code  
- Communicates only with the inspected page via `postMessage` / extension messaging  

Privacy policy URL: publish `extensions/chrome-devtools/privacy.md` (raw / GitHub Pages) if the form requires a URL.

Example raw URL after push to `main`:

`https://raw.githubusercontent.com/jacarejs/core/main/extensions/chrome-devtools/privacy.md`

## Assets

| Asset | Path |
|-------|------|
| Icon 16 | `extensions/chrome-devtools/icons/icon16.png` |
| Icon 32 | `extensions/chrome-devtools/icons/icon32.png` |
| Icon 48 | `extensions/chrome-devtools/icons/icon48.png` |
| Icon 128 | `extensions/chrome-devtools/icons/icon128.png` (store listing) |
| Screenshots | Capture Lab + DevTools → tab **Jacaré** (1280×800 or 640×400) |

## Distribution

- Visibility: **Unlisted** first (recommended), then Public  
- Regions: all / as needed  

## After first publish

Copy **Extension ID** from the dashboard → GitHub secret `CHROME_EXTENSION_ID`.
