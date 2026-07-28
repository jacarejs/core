# Privacy Policy — Jacaré Devtools

**Last updated:** July 28, 2026

This Privacy Policy applies to the **Jacaré Devtools** Chrome extension (the “Extension”), published for use with apps built on the Jacaré front-end framework.

## Summary

The Extension does **not** collect, store, sell, or transfer personal user data. It only inspects Jacaré framework state in the tab you open in Chrome DevTools.

## What the Extension does

Jacaré Devtools adds a Chrome DevTools panel that can:

- Read live reactive state (pulses), routes, `.jcr` screens, Mesh bags, and Scope entries from a Jacaré app
- Highlight DOM bindings and pick elements in the inspected page
- Optionally write values back into the page’s Jacaré runtime (for example Mesh import or numeric steppers) when you use those controls

All of this happens **locally** between the Extension and the currently inspected page.

## Data collection

We do **not** collect:

- Personally identifiable information
- Health, financial, or authentication information
- Personal communications
- Location
- Web history
- User activity analytics
- Site content for storage or transmission off the device

The Extension does **not** use analytics, accounts, advertising, or remote telemetry.

## How data is handled on your device

When DevTools is open on a Jacaré page and you use the Jacaré panel:

1. The Extension injects a content script **into the inspected tab only** (via `chrome.scripting`, when the panel needs a bridge).
2. A page hook bundled with the Extension may bridge messages to `window.__JACARE_DEVTOOLS_HOOK__` (or equivalent) when that hook is present in the page.
3. The DevTools panel reads and displays inspect snapshots via Chrome extension messaging and `postMessage`.

Inspect data stays in memory for the DevTools session. It is **not** uploaded to Jacaré servers or any third party.

## Permissions

| Permission | Purpose |
|------------|---------|
| `scripting` | Inject the page bridge **only** into the inspected tab when the Jacaré panel needs it |
| Host permissions (`http://*/*`, `https://*/*`, `localhost`) | Allow that on-demand inject on local and remote DEV Jacaré apps |

These permissions are used only for the Extension’s single purpose: inspecting Jacaré apps in DevTools. The Extension does **not** run a content script on every page at `document_start`.

## Remote code

The Extension does **not** execute remote code. All JavaScript shipped with the Extension is included in the package you install from the Chrome Web Store. The page hook is loaded from the Extension’s own `web_accessible_resources`, not from an external URL.

## Third parties

We do not sell or transfer user data to third parties. We do not use or transfer data for purposes unrelated to inspecting Jacaré apps, and we do not use data to determine creditworthiness or for lending.

## Children’s privacy

The Extension is a developer tool and is not directed at children. It does not knowingly collect personal information from anyone.

## Changes

We may update this Privacy Policy when the Extension’s behavior changes. The “Last updated” date at the top will be revised accordingly.

## Contact

Questions about this policy or the Extension:

- Project: [https://github.com/jacarejs/core](https://github.com/jacarejs/core)
- Lab / docs: [https://jacarejs.github.io/core/lab/](https://jacarejs.github.io/core/lab/)
