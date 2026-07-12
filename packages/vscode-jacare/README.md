# Jacaré for VS Code

Syntax highlighting, icons, and language support for `.jcr` files.

## Features

- Colored syntax for `view` templates, `#if` / `#for` directives, components, and bindings
- Scoped `style` blocks highlighted as CSS
- Jacaré file icon in the explorer (enable **Jacaré Icons** icon theme)
- Auto-closing pairs for tags and template literals

## Install

### Marketplace

Search **Jacaré** in the VS Code Extensions panel (`heberalmeida.jacare`).

### From source

From the monorepo:

```bash
cd packages/vscode-jacare
yarn install
yarn build
```

Then in VS Code: **Extensions → Install from VSIX** after `yarn package`, or use **Run Extension** from the VS Code debugger.

## Publish (maintainers)

1. Create a [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) with **Marketplace > Manage**
2. Add repository secret `VSCE_PAT`
3. Confirm publisher **heberalmeida** at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
4. Run **Actions → Publish VS Code Extension** (auto-bumps patch version, publishes, commits and tags)

Local bump:

```bash
node scripts/sync-versions.mjs vscode bump patch
```

## Icon theme

The extension sets **Jacaré Icons** as the default file icon theme. `.jcr` files show the Jacaré logo in the explorer.

If the icon does not appear, open Command Palette → **Preferences: File Icon Theme** → select **Jacaré Icons**, then reload the window.

## Language id

`.jcr` files use language id `jacare`.
