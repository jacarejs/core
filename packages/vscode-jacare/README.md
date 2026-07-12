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

1. Bump `version` in `package.json`
2. Create a [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) with **Marketplace > Manage**
3. Add repository secret `VSCE_PAT`
4. Confirm publisher **heberalmeida** at [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
5. Push tag `vscode-v<version>` (example: `vscode-v0.0.4`) or run the **Publish VS Code Extension** workflow manually

## Icon theme

The extension sets **Jacaré Icons** as the default file icon theme. `.jcr` files show the Jacaré logo in the explorer.

If the icon does not appear, open Command Palette → **Preferences: File Icon Theme** → select **Jacaré Icons**, then reload the window.

## Language id

`.jcr` files use language id `jacare`.
