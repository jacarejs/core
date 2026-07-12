# Jacaré for VS Code

Syntax highlighting, icons, and language support for `.jcr` files.

## Features

- Colored syntax for `view` templates, `#if` / `#for` directives, components, and bindings
- Scoped `style` blocks highlighted as CSS
- Jacaré file icon in the explorer (enable **Jacaré Icons** icon theme)
- Auto-closing pairs for tags and template literals

## Install

From the monorepo:

```bash
cd packages/vscode-jacare
yarn install
yarn build
```

Then in VS Code: **Extensions → Install from VSIX** after `yarn package`, or use **Run Extension** from the VS Code debugger.

## Icon theme

Open Command Palette → **Preferences: File Icon Theme** → select **Jacaré Icons**.

## Language id

`.jcr` files use language id `jacare`.
